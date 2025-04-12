import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { StatusCodes } from 'http-status-codes';
import { FileModel } from '../db/mongo';

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
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
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

// Interface for file responses
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
        res.status(StatusCodes.BAD_REQUEST).json({ 
            error: 'No file uploaded' 
        });
        return;
    }

    const fileExt = path.extname(req.file.originalname).toLowerCase().substring(1);
    
    if (fileExt !== 'pdf' && fileExt !== 'html') {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            error: 'Only PDF and HTML files are allowed' 
        });
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
            // Return the file info
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
    // Fetch all files from the database
    FileModel.find()
        .sort({ uploadedAt: -1 }) // Sort by newest first
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
    // Find the file by ID
    FileModel.findById(req.params.id)
        .then(file => {
            if (!file) {
                res.status(StatusCodes.NOT_FOUND).json({
                    error: 'File not found'
                });
                return;
            }
            
            // Check if file exists on disk
            fs.access(file.path)
                .then(() => {
                    // Set appropriate headers
                    res.set('Content-Type', file.type === 'pdf' ? 'application/pdf' : 'text/html');
                    res.set('Content-Disposition', `inline; filename="${file.originalName}"`);
                    
                    // Send the file
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