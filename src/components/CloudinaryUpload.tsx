import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, File, Image, Video, Music, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useCloudinaryUpload, CloudinaryUploadConfig } from '../hooks/useCloudinaryUpload';
import { AttachmentRequestDto } from '../types';

export interface CloudinaryUploadProps {
  config: CloudinaryUploadConfig;
  onUploadSuccess: (attachment: AttachmentRequestDto) => void;
  onUploadError?: (error: string) => void;
  onUploadComplete?: (attachments: AttachmentRequestDto[]) => void;
  multiple?: boolean;
  showPreview?: boolean;
  className?: string;
  disabled?: boolean;
  accept?: string;
  placeholder?: string;
  maxFiles?: number;
}

export const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  config,
  onUploadSuccess,
  onUploadError,
  onUploadComplete,
  multiple = false,
  showPreview = true,
  className = '',
  disabled = false,
  accept,
  placeholder = 'Click to upload or drag and drop',
  maxFiles = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<AttachmentRequestDto[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const {
    uploadFile,
    uploadMultipleFiles,
    isUploading,
    progress,
    resetProgress,
  } = useCloudinaryUpload(config);

  const handleFileUpload = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    setErrors([]);
    resetProgress();

    try {
      if (multiple) {
        const results = await uploadMultipleFiles(fileArray);
        const successfulUploads: AttachmentRequestDto[] = [];
        const uploadErrors: string[] = [];

        results.forEach((result, index) => {
          if (result.success && result.data) {
            successfulUploads.push(result.data);
            onUploadSuccess(result.data);
          } else if (result.error) {
            uploadErrors.push(`${fileArray[index].name}: ${result.error}`);
            onUploadError?.(result.error);
          }
        });

        setUploadedFiles(prev => [...prev, ...successfulUploads]);
        setErrors(uploadErrors);

        if (successfulUploads.length > 0) {
          onUploadComplete?.(successfulUploads);
        }
      } else {
        const result = await uploadFile(fileArray[0]);
        if (result.success && result.data) {
          setUploadedFiles([result.data]);
          onUploadSuccess(result.data);
          onUploadComplete?.([result.data]);
        } else if (result.error) {
          setErrors([result.error]);
          onUploadError?.(result.error);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setErrors([errorMessage]);
      onUploadError?.(errorMessage);
    }
  }, [multiple, uploadFile, uploadMultipleFiles, onUploadSuccess, onUploadError, onUploadComplete, resetProgress]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  }, [handleFileUpload]);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getFileIcon = (type: string) => {
    if (type === 'PHOTO') return <Image className="w-4 h-4" />;
    if (type === 'VIDEO') return <Video className="w-4 h-4" />;
    if (type === 'AUDIO') return <Music className="w-4 h-4" />;
    if (type === 'PDF') return <FileText className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled && !isUploading ? openFileDialog : undefined}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className={`w-8 h-8 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className={`text-sm ${dragActive ? 'text-blue-600' : 'text-gray-600'}`}>
            {placeholder}
          </p>
          {multiple && (
            <p className="text-xs text-gray-500">
              Maximum {maxFiles} files, drag and drop supported
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Uploaded Files Preview */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(file.type)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.description}</p>
                  <p className="text-xs text-gray-500">{file.type}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ))}
        </div>
      )}

      {/* Success Message */}
      {uploadedFiles.length > 0 && !isUploading && (
        <div className="mt-4 flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-700">
            Successfully uploaded {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload;
