import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPage = () => {
  // State for the upload section
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // State for the knowledge base browser
  const [documents, setDocuments] = useState([]);
  const [browseError, setBrowseError] = useState('');

  // Fetch documents when the component loads
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/documents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setDocuments(res.data);
      } catch (err) {
        setBrowseError('Could not fetch documents.');
      }
    };
    fetchDocuments();
  }, []); // Empty array means this runs once on mount

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file first.');
      return;
    }
    
    const formData = new FormData();
    formData.append('document', file);
    
    setMessage('');
    setUploadError('');
    setIsUploading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage(res.data.message);
      // Refresh document list after successful upload
      const newDocsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/documents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      setDocuments(newDocsRes.data);

    } catch (err) {
      setUploadError(err.response?.data?.error || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      {/* Upload Section */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
        <div className="flex flex-col space-y-4">
          <input 
            type="file" 
            onChange={handleFileChange} 
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500"
          >
            {isUploading ? 'Uploading...' : 'Upload and Process File'}
          </button>
          {message && <p className="text-green-400">{message}</p>}
          {uploadError && <p className="text-red-500">{uploadError}</p>}
        </div>
      </div>

      {/* Knowledge Base Browser Section */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Knowledge Base Explorer</h2>
        {browseError && <p className="text-red-500">{browseError}</p>}
        <ul className="list-disc pl-5 space-y-2">
          {documents.length > 0 ? (
            documents.map((doc, index) => (
              <li key={index}>
                <a 
                  href={`${import.meta.env.VITE_API_URL}/data/${doc}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {doc}
                </a>
              </li>
            ))
          ) : (
            <p className="text-gray-400">No documents found.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AdminPage;