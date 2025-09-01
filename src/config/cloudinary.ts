import { CloudinaryUploadConfig } from '../hooks/useCloudinaryUpload';

// Cloudinary configuration
// Replace these values with your actual Cloudinary credentials
export const cloudinaryConfig: CloudinaryUploadConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset',
  folder: 'ces-attachments', // Customize this folder name
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'mp4', 'avi', 'mov', 'mp3', 'wav'],
  maxFiles: 5,
};

// Environment-specific configurations
export const getCloudinaryConfig = (): CloudinaryUploadConfig => {
  const env = import.meta.env.MODE;
  
  switch (env) {
    case 'development':
      return {
        ...cloudinaryConfig,
        folder: 'ces-dev-attachments',
        maxFileSize: 5 * 1024 * 1024, // 5MB for dev
      };
    
    case 'production':
      return {
        ...cloudinaryConfig,
        folder: 'ces-prod-attachments',
        maxFileSize: 25 * 1024 * 1024, // 25MB for production
      };
    
    default:
      return cloudinaryConfig;
  }
};

// Preset configurations for different use cases
export const cloudinaryPresets = {
  // For issue attachments
  issueAttachments: (): CloudinaryUploadConfig => ({
    ...getCloudinaryConfig(),
    folder: 'ces-issues',
    maxFiles: 3,
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
  }),

  // For response attachments
  responseAttachments: (): CloudinaryUploadConfig => ({
    ...getCloudinaryConfig(),
    folder: 'ces-responses',
    maxFiles: 5,
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'mp4', 'avi', 'mov', 'mp3', 'wav'],
  }),

  // For profile pictures
  profilePictures: (): CloudinaryUploadConfig => ({
    ...getCloudinaryConfig(),
    folder: 'ces-profiles',
    maxFiles: 1,
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif'],
    maxFileSize: 2 * 1024 * 1024, // 2MB for profile pictures
  }),

  // For announcement attachments
  announcementAttachments: (): CloudinaryUploadConfig => ({
    ...getCloudinaryConfig(),
    folder: 'ces-announcements',
    maxFiles: 10,
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'mp4', 'avi', 'mov', 'mp3', 'wav'],
  }),
};

// Helper function to create custom configuration
export const createCustomCloudinaryConfig = (
  overrides: Partial<CloudinaryUploadConfig>
): CloudinaryUploadConfig => ({
  ...getCloudinaryConfig(),
  ...overrides,
});
