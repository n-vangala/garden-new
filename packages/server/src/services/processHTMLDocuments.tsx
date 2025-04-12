import { JSDOM } from 'jsdom';
import { embedText } from '../../packages/embed'; // Adjust the import if needed

export interface HtmlProcessingResult {
  fullHtml: string;
  extractedText: string;
  chunks: { text: string; embedding: number[] }[];
}

const CHUNK_SIZE = 200;

function chunkText(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
}

export async function processHtmlDocument(htmlContent: string, jobId: string, io: any): Promise<HtmlProcessingResult> {
  // Emit that processing is starting
  io.emit('processingStarting', { jobId, message: 'Processing started.' });
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Parse HTML and extract text
  const dom = new JSDOM(htmlContent);
  const extractedText = dom.window.document.body.textContent?.trim() || '';
  
  // Chunk the text
  const textChunks = chunkText(extractedText, CHUNK_SIZE);
  const totalChunks = textChunks.length;
  const chunks = [];
  
  // Process each chunk
  for (let i = 0; i < totalChunks; i++) {
    const chunk = textChunks[i];
    // Emit progress update
    io.emit('progressUpdate', { 
      jobId, 
      progress: Math.round(((i + 1) / totalChunks) * 100),
      chunkIndex: i + 1,
      totalChunks,
      message: `Processed chunk ${i + 1} of ${totalChunks}`
    });
    const embedding = await embedText(chunk);
    chunks.push({ text: chunk, embedding });
  }
  
  // Emit finalizing event
  io.emit('finalizing', { jobId, message: 'Finalizing processing.' });
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Emit completed event with result details
  io.emit('completed', { jobId, result: { fullHtml: htmlContent, extractedText, chunks } });
  
  return {
    fullHtml: htmlContent,
    extractedText,
    chunks,
  };
}
