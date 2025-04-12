import React, { useState } from 'react';

const UploadSection: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setStatus('Uploading...');
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setStatus('Upload successful!');
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const errorData = await res.json();
        setStatus(`Upload failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setStatus('Error during upload.');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-lg font-semibold mb-4">Upload a New File</h2>
      <div className="flex flex-col">
        <p className="text-sm text-gray-500 mb-2">Upload PDF or HTML files only</p>
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="mb-4 p-2 border border-gray-300 rounded" 
          accept=".pdf,.html"
        />
        <button
          onClick={handleUpload}
          className="px-4 py-2 bg-primary-100 text-white rounded hover:bg-primary-120 transition-colors"
          disabled={!file}
        >
          {status === 'Uploading...' ? 'Uploading...' : 'Upload'}
        </button>
        {status && (
          <p className={`mt-3 text-sm ${
            status.includes('successful') 
              ? 'text-green-600' 
              : status.includes('failed') || status.includes('Error') 
                ? 'text-red-600' 
                : 'text-gray-600'
          }`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default UploadSection;
