import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Calendar, X, File, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

const PatientHealthRecordsModal = ({ patientId, patientName, onClose, backendUrl }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      console.log('Fetching records for patient:', patientId);
      console.log('Backend URL:', backendUrl);
      const { data } = await axios.get(
        `${backendUrl}/api/health-records/patient/${patientId}`
      );

      console.log('Response:', data);
      if (data.success) {
        setRecords(data.records);
        console.log('Records loaded:', data.records.length);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Failed to fetch health records');
    } finally {
      setLoading(false);
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
              <p className="text-sm text-blue-100">{patientName}</p>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Patient Health Records</h2>
            <p className="text-sm text-blue-100">{patientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <File className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No health records found</p>
              <p className="text-gray-400 text-sm mt-2">
                This patient hasn't uploaded any medical documents yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {records.map((record) => (
                <div
                  key={record._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-4xl">{getFileIcon(record.fileType)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">
                          {record.fileName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(record.fileSize)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {record.description && (
                    <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                      {record.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <Calendar className="h-3 w-3" />
                    Uploaded: {formatDate(record.uploadDate)}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewFile(record)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
                    >
                      <FileText className="h-4 w-4" />
                      View
                    </button>
                    <a
                      href={record.fileUrl}
                      download
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm font-medium"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHealthRecordsModal;
