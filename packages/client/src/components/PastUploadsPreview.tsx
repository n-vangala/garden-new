import React from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

interface UploadEntry {
  id: string;
  filename: string;
  uploadedAt: string;
  status: 'completed' | 'processing' | 'failed';
  type: 'html' | 'pdf';
}

const PastUploadsPreview: React.FC = () => {
  const { data: uploads = [], isLoading } = useQuery<UploadEntry[]>({
    queryKey: ['uploads'],
    queryFn: async () => {
      const res = await fetch('/api/uploads');
      if (!res.ok) throw new Error('Failed to fetch uploads');
      return res.json();
    },
  });

  const recentUploads = uploads.slice(0, 5); // Show only the 5 most recent uploads

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Uploads</h2>
        <Link
          to="/uploads"
          className="text-primary-100 hover:text-primary-120 font-medium text-sm"
        >
          View All →
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : recentUploads.length === 0 ? (
        <p className="text-sm text-gray-500">No uploads yet</p>
      ) : (
        <ul className="space-y-3">
          {recentUploads.map(upload => (
            <li 
              key={upload.id} 
              className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0"
            >
              <div className="flex items-center space-x-2">
                <span>{upload.type === 'pdf' ? '📄' : '🌐'}</span>
                <span className="text-gray-700">{upload.filename}</span>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  upload.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : upload.status === 'processing'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {upload.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PastUploadsPreview;
