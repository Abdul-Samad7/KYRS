import React, { useState, useRef } from 'react';
import { UploadIcon, FileIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

const DataUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
        setSuccess(false);
      } else {
        setError('Please select a CSV file');
        setFile(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setError(null);
      setSuccess(false);
    } else {
      setError('Please drop a CSV file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // TODO: Implement actual upload to backend
      // const formData = new FormData();
      // formData.append('file', file);
      // await api.uploadDataset(formData);
      
      // Simulate upload for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Upload Dataset</h1>
        <p className="mt-2 text-gray-400">
          Upload your own exoplanet dataset in CSV format for AI-powered analysis
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-lg p-12 text-center cursor-pointer transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <UploadIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          
          {file ? (
            <div className="space-y-2">
              <FileIcon className="h-8 w-8 text-blue-400 mx-auto" />
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-sm text-gray-400">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-300 mb-2">
                Drop your CSV file here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Accepts CSV files only
              </p>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3">
            <AlertCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-4 flex items-center gap-2 text-green-400 bg-green-900/20 border border-green-800 rounded-lg p-3">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span>Dataset uploaded successfully!</span>
          </div>
        )}

        {/* Upload Button */}
        {file && !success && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload and Analyze'}
          </button>
        )}
      </div>

      {/* Expected Format */}
      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Expected Format</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <p>Your CSV should contain exoplanet data with columns such as:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Planet identifier (name, KOI ID, etc.)</li>
            <li>Temperature (equilibrium temperature in Kelvin)</li>
            <li>Radius (in Earth radii)</li>
            <li>Orbital period (in days)</li>
            <li>Disposition (CONFIRMED, CANDIDATE, FALSE POSITIVE)</li>
          </ul>
          <p className="mt-4 text-xs text-gray-500">
            Note: The AI will automatically detect column types and adapt to your data structure
          </p>
        </div>
      </div>

      {/* Current Dataset Info */}
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Current Dataset</h3>
        <p className="text-gray-400">
          NASA Kepler KOI Dataset • 9,564 exoplanets loaded
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Upload a new dataset to replace the default or analyze alongside it
        </p>
      </div>
    </div>
  );
};

export default DataUpload;