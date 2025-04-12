import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { StatusCodes } from 'http-status-codes';
import { FileModel } from '../db/mongo';
import { processHtmlDocument } from '../services/processHTMLDocuments'
import { processPdfDocument } from '../services/processPDFDocuments';

export const uploadsRouter = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Store files in an 'uploads' directory
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create directory if it doesn't exist
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch(err => cb(err, uploadDir));
  },
  filename: (_req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (_req, file, cb) => {
    // Accept only PDF and HTML files
    const allowedTypes = ['.pdf', '.html'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and HTML files are allowed'));
    }
  }
});

// Define types for our file metadata responses
type FileType = 'html' | 'pdf';

interface FileResponse {
  id: string;
  filename: string;
  uploadedAt: string;
  status: string;
  type: FileType;
}

// POST endpoint to handle file uploads
uploadsRouter.post('/', upload.single('file'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'No file uploaded' });
    return;
  }

  const fileExt = path.extname(req.file.originalname).toLowerCase().substring(1);
  
  if (fileExt !== 'pdf' && fileExt !== 'html') {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Only PDF and HTML files are allowed' });
    return;
  }
  
  try {
    // Create file metadata in MongoDB
    FileModel.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      uploadedAt: new Date(),
      status: 'completed',
      type: fileExt as FileType,
      size: req.file.size
    })
    .then(fileDoc => {
      const response: FileResponse = {
        id: fileDoc._id.toString(),
        filename: fileDoc.originalName,
        uploadedAt: fileDoc.uploadedAt.toISOString(),
        status: fileDoc.status,
        type: fileDoc.type as FileType
      };
      res.status(StatusCodes.CREATED).json(response);
    })
    .catch(error => {
      console.error('Database error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to save file information'
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to process upload'
    });
  }
});

// GET endpoint to list uploads
uploadsRouter.get('/', (_req: Request, res: Response): void => {
  FileModel.find()
    .sort({ uploadedAt: -1 })
    .then(files => {
      const uploads: FileResponse[] = files.map(file => ({
        id: file._id.toString(),
        filename: file.originalName,
        uploadedAt: file.uploadedAt.toISOString(),
        status: file.status,
        type: file.type as FileType
      }));
      res.json(uploads);
    })
    .catch(error => {
      console.error('Database error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve uploads'
      });
    });
});

// GET endpoint to download a file
uploadsRouter.get('/:id', (req: Request, res: Response): void => {
  FileModel.findById(req.params.id)
    .then(file => {
      if (!file) {
        res.status(StatusCodes.NOT_FOUND).json({
          error: 'File not found'
        });
        return;
      }
      
      fs.access(file.path)
        .then(() => {
          res.set('Content-Type', file.type === 'pdf' ? 'application/pdf' : 'text/html');
          res.set('Content-Disposition', `inline; filename="${file.originalName}"`);
          res.sendFile(file.path);
        })
        .catch(error => {
          console.error('File access error:', error);
          res.status(StatusCodes.NOT_FOUND).json({
            error: 'File content not found on disk'
          });
        });
    })
    .catch(error => {
      console.error('Database error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve file information'
      });
    });
});

// DELETE endpoint to delete a file
uploadsRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const fileDoc = await FileModel.findById(req.params.id);
    if (!fileDoc) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'File not found' });
      return;
    }

    try {
      await fs.unlink(fileDoc.path);
    } catch (fsError: any) {
      if (fsError.code === 'ENOENT') {
        console.warn(`File at ${fileDoc.path} not found on disk; proceeding with metadata deletion.`);
      } else {
        console.error('Error deleting file from disk:', fsError);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete file from disk.' });
        return;
      }
    }
  
    await FileModel.deleteOne({ _id: fileDoc._id });
    res.json({ message: 'File deleted successfully.' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete file.' });
  }
});

// NEW: Endpoint to trigger asynchronous processing via WebSockets
uploadsRouter.post('/process/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const fileDoc = await FileModel.findById(req.params.id);
      if (!fileDoc) {
        res.status(StatusCodes.NOT_FOUND).json({ error: 'File not found' });
        return;
      }
      
      const io = req.app.locals.io;
      const jobId = fileDoc._id.toString();
      
      // Trigger processing asynchronously
      if (fileDoc.type === 'html') {
        processHtmlDocument(await fs.readFile(fileDoc.path, 'utf8'), jobId, io)
          .then(async (result) => {
            // After processing, update the database.
            await FileModel.findByIdAndUpdate(fileDoc._id, { processingResult: result });
          })
          .catch((err: Error) => {
            io.emit('error', { jobId, message: err.message });
            console.error('Processing error:', err);
          });
      } else if (fileDoc.type === 'pdf') {
        processPdfDocument(fileDoc.path, 1, jobId, io)
          .then(async (result: any) => {
            await FileModel.findByIdAndUpdate(fileDoc._id, { processingResult: result });
          })
          .catch((err: Error) => {
            io.emit('error', { jobId, message: err.message });
            console.error('Processing error:', err);
          });
      }
      
      // Immediately respond to the client.
      res.status(StatusCodes.OK).json({ message: 'Processing started', jobId });
    } catch (error) {
      console.error('Error triggering processing:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to trigger processing' });
    }
  });
  
