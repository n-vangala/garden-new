import React from 'react';
import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { uploadDetailsRoute } from '../routes/UploadDetails';

interface ProcessingResult {
  fullHtml: string;
  extractedText: string;
  chunks: { text: string; embedding: number[] }[];
}

const dummyRoute = {
  id: 'dummy-route',
  path: '/uploads/:id',
  getParentRoute: () => null,
} as any;


const UploadDetails: React.FC = () => {
  const params = useParams({ from: dummyRoute }) as { id: string };
  const { id } = params;

  const { data, isLoading, error } = useQuery<ProcessingResult>({
    queryKey: ['uploads', id],      // any array or string
    queryFn: async () => {
      const res = await fetch(`/api/uploads/details/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch upload details');
      }
      return res.json() as Promise<ProcessingResult>;
    },
  });
  

  if (isLoading) return <p>Loading details...</p>;
  if (error) return <p>Error loading details: {(error as Error).message}</p>;

  return (
    <div className="w-screen h-screen bg-baby-powder font-nunitoSans">
      <div className="p-4">
          <h1 className="text-xl font-bold mb-4">Upload Details</h1>
          <p className="mb-2"><strong>Extracted Text:</strong></p>
          <div className="border p-2 mb-4" style={{ maxHeight: '200px', overflowY: 'scroll' }}>
              <pre>{(data as ProcessingResult)?.extractedText ?? 'No extracted text available'}</pre>
          </div>
          <h2 className="text-lg font-semibold mb-2">Chunks and Embeddings:</h2>
          <ul className="space-y-2">
              {(data as ProcessingResult)?.chunks?.map((chunk, index) => (
                  <li key={index} className="border p-2 rounded">
                      <p className="text-sm"><strong>Chunk:</strong> {chunk.text}</p>
                      <p className="text-xs text-gray-600">
                          <strong>Embedding:</strong> [{chunk.embedding.join(', ')}]
                      </p>
                  </li>
              ))}
          </ul>
      </div>
    </div>
  );
};

export default UploadDetails;
