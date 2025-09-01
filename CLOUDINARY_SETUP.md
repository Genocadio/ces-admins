# Cloudinary Setup Guide

## Quick Setup

1. **Create a `.env` file** in your project root with the following variables:

```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

2. **Get your Cloudinary credentials:**
   - Sign up at [cloudinary.com](https://cloudinary.com/)
   - Go to Dashboard → Account Details
   - Copy your Cloud Name

3. **Create an Upload Preset:**
   - Go to Settings → Upload
   - Create a new upload preset
   - Set it to "Unsigned" for client-side uploads
   - Configure allowed formats and file sizes as needed

## Example Configuration

```env
VITE_CLOUDINARY_CLOUD_NAME=mycompany
VITE_CLOUDINARY_UPLOAD_PRESET=ces_uploads
```

## Security Notes

- Use "Unsigned" upload presets for client-side uploads
- Set appropriate file size and format restrictions
- Consider using signed uploads for sensitive content
- Always validate files on both client and server

## Supported File Types

The system supports the following attachment types that match your backend enum:

- **PHOTO**: jpg, jpeg, png, gif
- **PDF**: pdf files
- **VIDEO**: mp4, avi, mov
- **AUDIO**: mp3, wav

## Testing

1. Start your development server
2. Navigate to "Cloudinary Demo" in the main menu
3. Try uploading different file types
4. Check the browser console for upload results

## Troubleshooting

- **Upload fails**: Check your credentials and upload preset
- **File type not allowed**: Verify `allowedFormats` in configuration
- **File too large**: Check `maxFileSize` setting
- **CORS issues**: Ensure Cloudinary allows uploads from your domain
