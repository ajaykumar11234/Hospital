import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContextProvider';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Upload, FileText, Trash2, Download, Calendar, File, X, ExternalLink } from 'lucide-react';

const MyHealthRecords = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [viewingFile, setViewingFile] = useState(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/health-records/list`, {
        headers: { token },
      });

      if (data.success) {
        setRecords(data.records);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch health records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRecords();
    }
  }, [token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', description);

      const { data } = await axios.post(
        `${backendUrl}/api/health-records/upload`,
        formData,
        {
          headers: { token },
        }
      );

      if (data.success) {
        toast.success('Health record uploaded successfully');
        setSelectedFile(null);
        setDescription('');
        document.getElementById('fileInput').value = '';
        fetchRecords();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/health-records/delete/${recordId}`,
        {
          headers: { token },
        }
      );

      if (data.success) {
        toast.success('Record deleted successfully');
        fetchRecords();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete record');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('document') || fileType.includes('word')) return '📝';
    return '📁';
  };

  const handleViewFile = (record) => {
    if (record.fileType.includes('pdf')) {
      setViewingFile(record);
    } else {
      window.open(record.fileUrl, '_blank');
    }
  };

  if (viewingFile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{viewingFile.fileName}</h2>
              <p className="text-sm text-blue-100">My Health Record</p>
            </div>
            <div className="flex gap-2">
              <a
                href={viewingFile.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/20 rounded-full transition"
                title="Open in new tab"
              >
                <ExternalLink className="h-6 w-6" />
              </a>
              <button
                onClick={() => setViewingFile(null)}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe
              src={viewingFile.fileUrl}
              className="w-full h-full"
              title={viewingFile.fileName}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Health Records</h1>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          Upload New Record
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File (PDF, Images, Documents - Max 10MB)
            </label>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Blood test report, X-ray scan, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              uploading || !selectedFile
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            <Upload className="h-5 w-5" />
            {uploading ? 'Uploading...' : 'Upload Record'}
          </button>
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          My Records ({records.length})
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <File className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No health records uploaded yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Upload your medical documents to keep them safe and accessible
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((record) => (
              <div
                key={record._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{getFileIcon(record.fileType)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">
                        {record.fileName}
                      </h3>
                      <p className="text-xs text-gray-500">{formatFileSize(record.fileSize)}</p>
                    </div>
                  </div>
                </div>

                {record.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{record.description}</p>
                )}

                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <Calendar className="h-3 w-3" />
                  {formatDate(record.uploadDate)}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewFile(record)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
                  >
                    <FileText className="h-4 w-4" />
                    View
                  </button>
                  <a
                    href={record.fileUrl}
                    download
                    className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm font-medium"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(record._id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHealthRecords;
