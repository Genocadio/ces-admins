# Cloudinary Upload Components

This project includes reusable Cloudinary upload components that allow you to easily upload files to Cloudinary and integrate them with your backend API.

## Features

- ✅ **Reusable Hook**: `useCloudinaryUpload` for custom upload logic
- ✅ **Reusable Component**: `CloudinaryUpload` with drag & drop support
- ✅ **Configurable**: Easy to customize for different use cases
- ✅ **TypeScript Support**: Full type safety with your existing types
- ✅ **Progress Tracking**: Upload progress indication
- ✅ **Error Handling**: Comprehensive error handling and validation
- ✅ **File Validation**: File size, type, and count validation
- ✅ **Backend Integration**: Returns data in the format expected by your backend

## Setup

### 1. Environment Variables

Create a `.env` file in your project root:

```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### 2. Cloudinary Configuration

1. Sign up for a [Cloudinary account](https://cloudinary.com/)
2. Get your cloud name from the dashboard
3. Create an upload preset:
   - Go to Settings > Upload
   - Create a new upload preset
   - Set it to "Unsigned" for client-side uploads
   - Configure allowed formats and file sizes

## Usage

### Basic Usage

```tsx
import CloudinaryUpload from './components/CloudinaryUpload';
import { cloudinaryPresets } from './config/cloudinary';

function MyComponent() {
  const handleUploadSuccess = (attachment) => {
    console.log('File uploaded:', attachment);
    // attachment.url contains the Cloudinary URL
    // attachment.type contains the file type
    // attachment.description contains the filename
  };

  return (
    <CloudinaryUpload
      config={cloudinaryPresets.issueAttachments()}
      onUploadSuccess={handleUploadSuccess}
      multiple={true}
    />
  );
}
```

### Using the Hook

```tsx
import { useCloudinaryUpload } from './hooks/useCloudinaryUpload';
import { createCustomCloudinaryConfig } from './config/cloudinary';

function MyCustomComponent() {
  const customConfig = createCustomCloudinaryConfig({
    folder: 'my-custom-folder',
    maxFiles: 3,
    allowedFormats: ['pdf', 'doc', 'docx'],
  });

  const { uploadFile, uploadMultipleFiles, isUploading, progress } = useCloudinaryUpload(customConfig);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const result = await uploadFile(file);
      if (result.success) {
        console.log('Upload successful:', result.data);
      } else {
        console.error('Upload failed:', result.error);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      {isUploading && <div>Uploading... {progress}%</div>}
    </div>
  );
}
```

## Configuration Options

### CloudinaryUploadConfig

```tsx
interface CloudinaryUploadConfig {
  cloudName: string;           // Your Cloudinary cloud name
  uploadPreset: string;        // Your upload preset
  folder?: string;             // Optional folder in Cloudinary
  maxFileSize?: number;        // Max file size in bytes
  allowedFormats?: string[];   // Allowed file extensions
  maxFiles?: number;           // Maximum number of files
}
```

### Preset Configurations

The component comes with preset configurations for common use cases:

```tsx
import { cloudinaryPresets } from './config/cloudinary';

  // For issue attachments (PHOTO, PDF)
  const issueConfig = cloudinaryPresets.issueAttachments();

  // For response attachments (PHOTO, PDF, VIDEO, AUDIO)
  const responseConfig = cloudinaryPresets.responseAttachments();

  // For profile pictures (PHOTO only)
  const profileConfig = cloudinaryPresets.profilePictures();

  // For announcement attachments (PHOTO, PDF, VIDEO, AUDIO)
  const announcementConfig = cloudinaryPresets.announcementAttachments();
```

### Custom Configuration

```tsx
import { createCustomCloudinaryConfig } from './config/cloudinary';

const customConfig = createCustomCloudinaryConfig({
  folder: 'my-special-folder',
  maxFiles: 10,
  allowedFormats: ['jpg', 'png', 'pdf'],
  maxFileSize: 15 * 1024 * 1024, // 15MB
});
```

## Component Props

### CloudinaryUpload

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `config` | `CloudinaryUploadConfig` | ✅ | - | Cloudinary configuration |
| `onUploadSuccess` | `(attachment: AttachmentRequestDto) => void` | ✅ | - | Called when a file uploads successfully |
| `onUploadError` | `(error: string) => void` | ❌ | - | Called when upload fails |
| `onUploadComplete` | `(attachments: AttachmentRequestDto[]) => void` | ❌ | - | Called when all uploads complete |
| `multiple` | `boolean` | ❌ | `false` | Allow multiple file selection |
| `showPreview` | `boolean` | ❌ | `true` | Show uploaded files preview |
| `className` | `string` | ❌ | `''` | Additional CSS classes |
| `disabled` | `boolean` | ❌ | `false` | Disable the upload component |
| `accept` | `string` | ❌ | - | HTML accept attribute for file input |
| `placeholder` | `string` | ❌ | `'Click to upload or drag and drop'` | Custom placeholder text |
| `maxFiles` | `number` | ❌ | `5` | Maximum files to show in preview |

## Hook Return Values

### useCloudinaryUpload

```tsx
const {
  uploadFile,           // Upload a single file
  uploadMultipleFiles,  // Upload multiple files
  isUploading,         // Upload in progress
  progress,            // Upload progress (0-100)
  resetProgress,       // Reset progress to 0
} = useCloudinaryUpload(config);
```

## Backend Integration

The components return data in the format expected by your backend:

```tsx
interface AttachmentRequestDto {
  url: string;           // Cloudinary secure URL
  type: AttachmentType;  // PHOTO, PDF, VIDEO, or AUDIO
  description?: string;  // Original filename
}
```

### Example API Call

```tsx
const submitResponse = async (message: string, attachments: AttachmentRequestDto[]) => {
  const responseData = {
    postType: 'RESPONSE',
    postId: issueId,
    message,
    attachments,
  };

  try {
    const response = await fetch('/api/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(responseData),
    });

    if (response.ok) {
      console.log('Response submitted successfully');
    }
  } catch (error) {
    console.error('Error submitting response:', error);
  }
};
```

## File Validation

The components automatically validate files based on your configuration:

- **File Size**: Checks against `maxFileSize`
- **File Type**: Validates against `allowedFormats`
- **File Count**: Enforces `maxFiles` limit
- **MIME Type**: Automatically determines `AttachmentType` (PHOTO, PDF, VIDEO, AUDIO)

## Error Handling

The components provide comprehensive error handling:

- File validation errors
- Upload failures
- Network errors
- Cloudinary API errors

Errors are displayed to users and passed to your `onUploadError` callback.

## Styling

The components use Tailwind CSS classes and are fully customizable. You can:

- Override styles with custom CSS classes
- Modify the component's internal structure
- Use the `className` prop for additional styling

## Examples

See `src/components/examples/CloudinaryUploadExample.tsx` for comprehensive usage examples including:

- Issue attachments
- Response attachments
- Profile pictures
- Custom configurations
- Backend integration

## Security Considerations

1. **Upload Preset**: Use unsigned uploads for client-side uploads
2. **File Validation**: Always validate files on both client and server
3. **File Size Limits**: Set reasonable limits to prevent abuse
4. **Allowed Formats**: Restrict to only necessary file types
5. **Folder Structure**: Use organized folder structures in Cloudinary

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check your Cloudinary credentials and upload preset
2. **File Type Not Allowed**: Verify `allowedFormats` in your configuration
3. **File Too Large**: Check `maxFileSize` setting
4. **CORS Issues**: Ensure Cloudinary allows uploads from your domain

### Debug Mode

Enable console logging to debug upload issues:

```tsx
const config = createCustomCloudinaryConfig({
  // ... your config
  debug: true, // Add this for verbose logging
});
```

## Support

For issues or questions:

1. Check the example components
2. Review the TypeScript types
3. Check Cloudinary documentation
4. Review browser console for errors

## License

This component is part of your CES frontend project and follows the same license terms.
