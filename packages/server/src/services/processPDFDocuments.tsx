import fs from 'fs/promises';
import path from 'path';

// Define the interface for a processed PDF page.
export interface PdfPageProcessing {
  pageNumber: number;
  imagePath: string;
  extractedText: string;
  chunks: { text: string; embedding: number[] }[];
}

// Maximum length for each chunk (adjust as desired).
const MAX_CHUNK_LENGTH = 500;

// URLs for the fake APIs.
const OCR_API_URL = 'http://localhost:4001/ocr';
const EMBED_API_URL = 'http://localhost:4002/embed';

/**
 * Splits text into paragraphs and combines them into chunks that do not exceed maxLength.
 * If a single paragraph is longer than maxLength, it is kept as one chunk.
 */
function paragraphChunk(text: string, maxLength: number = MAX_CHUNK_LENGTH): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = '';

  paragraphs.forEach((para) => {
    const trimmed = para.trim();
    if (!trimmed) return; // Skip empty paragraphs

    if ((currentChunk + '\n\n' + trimmed).trim().length <= maxLength) {
      currentChunk = (currentChunk + '\n\n' + trimmed).trim();
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      // If the paragraph itself is longer than maxLength, push it as its own chunk.
      if (trimmed.length > maxLength) {
        chunks.push(trimmed);
        currentChunk = '';
      } else {
        currentChunk = trimmed;
      }
    }
  });

  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
}

/**
 * Dummy function to simulate conversion of a PDF page to an image.
 * In a real implementation, replace this with a call to a PDF-to-image library.
 */
async function convertPdfPageToImage(pdfPath: string, pageNumber: number): Promise<string> {
  // For demonstration, we simulate an image path.
  return path.join(__dirname, `../../uploads/pdf_page_${pageNumber}.jpg`);
}

/**
 * Calls the OCR service by reading the image from disk and sending it as a JPEG.
 */
async function performOcrOnImage(imagePath: string): Promise<string> {
  const imageBuffer = await fs.readFile(imagePath);
  const response = await fetch(OCR_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'image/jpeg' },
    body: imageBuffer,
  });
  if (!response.ok) throw new Error('OCR request failed');
  // Expect a JSON response like: { text: "extracted OCR text" }
  const data = (await response.json()) as { text: string };
  return data.text;
}

/**
 * Calls the embed service API for a given text chunk.
 */
async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(EMBED_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error('Embedding request failed');
  const data = (await response.json()) as { embedding: number[] };
  return data.embedding;
}

export async function processPdfDocument(
  pdfPath: string,
  totalPages: number,
  jobId: string,
  io: any
): Promise<PdfPageProcessing[]> {
  const results: PdfPageProcessing[] = [];

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    io.emit('processingStarting', { jobId, message: `Processing page ${pageNumber} started` });

    // Convert PDF page to an image (dummy conversion).
    const imagePath = await convertPdfPageToImage(pdfPath, pageNumber);
    
    // Simulate a delay to mimic real OCR processing.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Perform OCR on the image.
    const extractedText = await performOcrOnImage(imagePath);

    // Use the same paragraph-based chunking method as HTML.
    const textChunks = paragraphChunk(extractedText);
    const totalChunks = textChunks.length;
    const chunks: { text: string; embedding: number[] }[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const chunk = textChunks[i]!;
      io.emit('progressUpdate', {
        jobId,
        progress: Math.round(((i + 1) / totalChunks) * 100),
        pageNumber,
        chunkIndex: i + 1,
        totalChunks,
        message: `Page ${pageNumber}: processed chunk ${i + 1} of ${totalChunks}`,
      });
      const embedding = await getEmbedding(chunk);
      chunks.push({ text: chunk, embedding });
    }

    io.emit('finalizing', { jobId, message: `Finalizing page ${pageNumber}` });
    await new Promise((resolve) => setTimeout(resolve, 500));

    results.push({
      pageNumber,
      imagePath,
      extractedText,
      chunks,
    });
  }

  io.emit('completed', { jobId, result: results });
  return results;
}
