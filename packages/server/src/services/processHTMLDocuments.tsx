import { parse } from 'node-html-parser';

// Define the structure of your processing result.
export interface HtmlProcessingResult {
  fullHtml: string;
  extractedText: string;
  chunks: { text: string; embedding: number[] }[];
}

interface EmbedResponse {
    embedding: number[];
  }

// Maximum characters per paragraph-chunk.
const MAX_CHUNK_LENGTH = 500;
// URL of the embed service API.
const EMBED_API_URL = 'http://localhost:4000/embed'; // adjust if needed

// Paragraph-based chunking function.
function paragraphChunk(text: string, maxLength: number = MAX_CHUNK_LENGTH): string[] {
  // Split text into paragraphs based on two or more newline characters.
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = '';

  paragraphs.forEach((para) => {
    const trimmed = para.trim();
    if (!trimmed) return; // skip empty paragraphs

    // If adding this paragraph to current chunk remains under the limit:
    if ((currentChunk + '\n\n' + trimmed).trim().length <= maxLength) {
      currentChunk = (currentChunk + '\n\n' + trimmed).trim();
    } else {
      // If currentChunk exists, push it.
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      // If the single paragraph is longer than maxLength, you might either push it as its own chunk
      // or further break it down. For now, we'll push it.
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

// Helper function to call your embed API.
async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(EMBED_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error('Embedding request failed');
  const data = (await response.json()) as EmbedResponse;
  return data.embedding;
}

// Main processing function for HTML documents.
export async function processHtmlDocument(
  htmlContent: string,
  jobId: string,
  io: any
): Promise<HtmlProcessingResult> {
  // Emit processing starting event.
  io.emit('processingStarting', { jobId, message: 'Processing started.' });
  await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate delay

  // Parse HTML to extract text using node-html-parser.
  const root = parse(htmlContent);
  const extractedText = (root.text || "").trim();
  // Create paragraph-based chunks.
  const textChunks = paragraphChunk(extractedText);
  const totalChunks = textChunks.length;
  const chunks: { text: string; embedding: number[] }[] = [];

  // Process each chunk in sequence.
  for (let i = 0; i < totalChunks; i++) {
    const chunk = textChunks[i];
    // Emit progress update.
    io.emit('progressUpdate', { 
      jobId, 
      progress: Math.round(((i + 1) / totalChunks) * 100),
      chunkIndex: i + 1,
      totalChunks,
      message: `Processed chunk ${i + 1} of ${totalChunks}`
    });
    // Ensure chunk is not undefined before processing.
    if (chunk) {
      // Get fake embedding for the chunk.
      const embedding = await getEmbedding(chunk);
      chunks.push({ text: chunk, embedding });
    }
  }

  // Emit finalizing event.
  io.emit('finalizing', { jobId, message: 'Finalizing processing.' });
  await new Promise((resolve) => setTimeout(resolve, 500)); // simulate delay

  // Emit completed event with the result.
  io.emit('completed', { jobId, result: { fullHtml: htmlContent, extractedText, chunks } });

  return {
    fullHtml: htmlContent,
    extractedText,
    chunks,
  };
}
