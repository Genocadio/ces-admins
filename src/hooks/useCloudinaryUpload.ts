import { useState, useCallback } from 'react';
import { AttachmentType, AttachmentRequestDto } from '../types';

export interface CloudinaryUploadConfig {
  cloudName: string;
  uploadPreset: string;
  folder?: string;
  maxFileSize?: number; // in bytes
  allowedFormats?: string[];
  maxFiles?: number;
}

export interface UploadResult {
  success: boolean;
  data?: AttachmentRequestDto;
  error?: string;
}

export interface UseCloudinaryUploadReturn {
  uploadFile: (file: File) => Promise<UploadResult>;
  uploadMultipleFiles: (files: File[]) => Promise<UploadResult[]>;
  isUploading: boolean;
  progress: number;
  resetProgress: () => void;
}

export const useCloudinaryUpload = (config: CloudinaryUploadConfig): UseCloudinaryUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const resetProgress = useCallback(() => {
    setProgress(0);
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (config.maxFileSize && file.size > config.maxFileSize) {
      return `File size exceeds maximum allowed size of ${Math.round(config.maxFileSize / 1024 / 1024)}MB`;
    }

    if (config.allowedFormats && config.allowedFormats.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !config.allowedFormats.includes(fileExtension)) {
        return `File format not allowed. Allowed formats: ${config.allowedFormats.join(', ')}`;
      }
    }

    return null;
  }, [config]);

  const determineAttachmentType = useCallback((mimeType: string): AttachmentType => {
    if (mimeType.startsWith('image/')) return AttachmentType.PHOTO;
    if (mimeType.startsWith('video/')) return AttachmentType.VIDEO;
    if (mimeType.startsWith('audio/')) return AttachmentType.AUDIO;
    if (mimeType === 'application/pdf') return AttachmentType.PDF;
    return AttachmentType.PDF; // Default to PDF for other document types
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<UploadResult> => {
    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        return { success: false, error: validationError };
      }

      setIsUploading(true);
      setProgress(0);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', config.uploadPreset);
      formData.append('cloud_name', config.cloudName);
      
      if (config.folder) {
        formData.append('folder', config.folder);
      }

      // Upload to Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      setProgress(100);

      // Create attachment data in backend format
      const attachment: AttachmentRequestDto = {
        url: result.secure_url,
        type: determineAttachmentType(file.type),
        description: file.name,
      };

      return { success: true, data: attachment };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    } finally {
      setIsUploading(false);
    }
  }, [config, validateFile, determineAttachmentType]);

  const uploadMultipleFiles = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    if (config.maxFiles && files.length > config.maxFiles) {
      return [{
        success: false,
        error: `Maximum ${config.maxFiles} files allowed`
      }];
    }

    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const result = await uploadFile(files[i]);
      results.push(result);
      
      // Update progress for multiple files
      if (files.length > 1) {
        setProgress(((i + 1) / files.length) * 100);
      }
    }

    return results;
  }, [config.maxFiles, uploadFile]);

  return {
    uploadFile,
    uploadMultipleFiles,
    isUploading,
    progress,
    resetProgress,
  };
};
