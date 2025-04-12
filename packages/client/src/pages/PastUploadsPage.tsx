import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NavigationBar } from '../components/NavigationBar';
import { useNavigate } from '@tanstack/react-router';
import { authApi } from '../api/auth';

interface UploadEntry {
  id: string;
  filename: string;
  uploadedAt: string;
  status: 'completed' | 'processing' | 'failed';
  type: 'html' | 'pdf';
}

const PastUploadsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: uploads = [], isLoading } = useQuery<UploadEntry[]>({
    queryKey: ['uploads'],
    queryFn: async () => {
      const res = await fetch('/api/uploads');
      if (!res.ok) throw new Error('Failed to fetch uploads');
      return res.json();
    },
  });

  const navigate = useNavigate();
  const logout = authApi.useLogout();

  // Group uploads by their upload date (using locale date string)
  const groupByDate = (uploads: UploadEntry[]) => {
    return uploads.reduce((groups, upload) => {
      const date = new Date(upload.uploadedAt).toLocaleDateString();
      return {
        ...groups,
        [date]: [...(groups[date] || []), upload],
      };
    }, {} as Record<string, UploadEntry[]>);
  };

  // Delete function: call the DELETE API endpoint
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      const res = await fetch(`/api/uploads/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(`Delete failed: ${errorData.error || 'Unknown error'}`);
      } else {
        // Invalidate the uploads query to refetch updated data
        queryClient.invalidateQueries({ queryKey: ['uploads'] });
      }
    } catch (error) {
      console.error('Error deleting upload:', error);
      alert('Error during deletion.');
    }
  };

  return (
    <div className="w-screen h-screen bg-baby-powder font-nunitoSans">
      {/* Navigation Bar */}
      <NavigationBar
        userName="garden" // Change to dynamic auth value later
        onLogout={() =>
          logout.mutate(undefined, {
            onSuccess: () => navigate({ to: '/login' }),
          })
        }
        isLoggingOut={logout.isPending}
      />
      
      {/* Main Content */}
      <div className="flex flex-col gap-8 px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6">Past Uploads</h1>
          
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {Object.entries(groupByDate(uploads)).map(([date, dateUploads]) => (
                <div key={date} className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">{date}</h2>
                  <div className="space-y-4">
                    {dateUploads.map((upload) => (
                      <div
                        key={upload.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">
                              {upload.type === 'pdf' ? '📄' : '🌐'}
                            </span>
                            <div>
                              <h3 className="font-medium text-gray-900">{upload.filename}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(upload.uploadedAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm ${
                                upload.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : upload.status === 'processing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                            </span>
                            <button
                                className="text-primary-100 hover:text-primary-120 font-medium text-sm"
                                onClick={() => navigate({ to: `/uploads/${upload.id}`, replace: true })}
                                >
                              View Details
                            </button>
                            <button
                              className="text-red-500 hover:underline text-sm font-medium"
                              onClick={() => handleDelete(upload.id)}
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {uploads.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📂</div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No uploads yet</h3>
                  <p className="text-gray-500">Your uploaded documents will appear here</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PastUploadsPage;
