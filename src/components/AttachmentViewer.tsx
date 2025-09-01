import React, { useState } from 'react';
import { Download, Play, Pause, Volume2, VolumeX, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AttachmentResponseDto, AttachmentType } from '../types';

interface AttachmentViewerProps {
  attachments: AttachmentResponseDto[];
  className?: string;
  showDownloadButton?: boolean;
  maxPreviewSize?: 'sm' | 'md' | 'lg';
}

export const AttachmentViewer: React.FC<AttachmentViewerProps> = ({
  attachments,
  className = '',
  showDownloadButton = true,
  maxPreviewSize = 'md'
}) => {
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentResponseDto | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoStates, setVideoStates] = useState<{ [key: string]: { playing: boolean; muted: boolean } }>({});

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const getSizeClasses = () => {
    switch (maxPreviewSize) {
      case 'sm':
        return 'max-w-xs max-h-48';
      case 'lg':
        return 'max-w-2xl max-h-96';
      default:
        return 'max-w-lg max-h-64';
    }
  };

  const isMediaFile = (attachment: AttachmentResponseDto) => {
    return attachment.type === AttachmentType.PHOTO || attachment.type === AttachmentType.VIDEO;
  };

  const isAudioFile = (attachment: AttachmentResponseDto) => {
    return attachment.type === AttachmentType.AUDIO;
  };

  const isDownloadableFile = (attachment: AttachmentResponseDto) => {
    return attachment.type === AttachmentType.PDF;
  };

  const openFullscreen = (attachment: AttachmentResponseDto, index: number) => {
    setSelectedAttachment(attachment);
    setCurrentIndex(index);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setSelectedAttachment(null);
  };

  const navigateAttachment = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : attachments.length - 1;
      setCurrentIndex(newIndex);
      setSelectedAttachment(attachments[newIndex]);
    } else {
      const newIndex = currentIndex < attachments.length - 1 ? currentIndex + 1 : 0;
      setCurrentIndex(newIndex);
      setSelectedAttachment(attachments[newIndex]);
    }
  };

  const toggleVideoPlayback = (attachmentId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [attachmentId]: {
        ...prev[attachmentId],
        playing: !prev[attachmentId]?.playing
      }
    }));
  };

  const toggleVideoMute = (attachmentId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [attachmentId]: {
        ...prev[attachmentId],
        muted: !prev[attachmentId]?.muted
      }
    }));
  };

  // Helper function to check if description is meaningful (not just a filename)
  const hasMeaningfulDescription = (description?: string) => {
    if (!description) return false;
    
    // Check if description looks like a filename (contains extensions, timestamps, etc.)
    const filenamePatterns = [
      /\.(jpg|jpeg|png|gif|bmp|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|mp3|mp4|avi|mov|wav)$/i,
      /tempFileForShare_/i,
      /screenshot_/i,
      /image_/i,
      /file_/i,
      /\d{8}-\d{6}/, // YYYYMMDD-HHMMSS format
      /^\w+_\d{8}_\d{6}\./, // name_YYYYMMDD_HHMMSS.ext format
    ];
    
    return !filenamePatterns.some(pattern => pattern.test(description));
  };

  const handleDownload = (attachment: AttachmentResponseDto) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.description || `attachment-${attachment.id}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderAttachmentPreview = (attachment: AttachmentResponseDto, index: number) => {
    if (attachment.type === AttachmentType.PHOTO) {
      return (
        <div className="relative group">
          <img
            src={attachment.url}
            alt={hasMeaningfulDescription(attachment.description) ? attachment.description : `Photo ${index + 1}`}
            className={`w-full h-full object-cover rounded-lg cursor-pointer transition-transform hover:scale-105 ${getSizeClasses()}`}
            onClick={() => openFullscreen(attachment, index)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
            <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      );
    }

    if (attachment.type === AttachmentType.VIDEO) {
      const videoState = videoStates[attachment.id] || { playing: false, muted: true };
      
    return (
        <div className="relative group">
          <video
            src={attachment.url}
            className={`w-full h-full object-cover rounded-lg ${getSizeClasses()}`}
            muted={videoState.muted}
            loop
            onPlay={() => setVideoStates(prev => ({ ...prev, [attachment.id]: { ...prev[attachment.id], playing: true } }))}
            onPause={() => setVideoStates(prev => ({ ...prev, [attachment.id]: { ...prev[attachment.id], playing: false } }))}
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              if (videoState.playing) {
                video.play();
              }
            }}
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVideoPlayback(attachment.id);
                }}
                className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
              >
                {videoState.playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
                <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVideoMute(attachment.id);
                }}
                className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
              >
                {videoState.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openFullscreen(attachment, index);
                }}
                className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (attachment.type === AttachmentType.AUDIO) {
      return (
        <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
          <div className="text-center">
            <Volume2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            {hasMeaningfulDescription(attachment.description) && (
              <p className="text-sm text-gray-600 mb-2">{attachment.description}</p>
            )}
            <audio
              src={attachment.url}
              controls
              className="w-full max-w-xs"
              onPlay={() => setVideoStates(prev => ({ ...prev, [attachment.id]: { ...prev[attachment.id], playing: true } }))}
              onPause={() => setVideoStates(prev => ({ ...prev, [attachment.id]: { ...prev[attachment.id], playing: false } }))}
            />
          </div>
      </div>
    );
  }

    // PDF and other downloadable files
  return (
      <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <span className="text-red-600 font-bold text-lg">PDF</span>
          </div>
          {hasMeaningfulDescription(attachment.description) && (
            <p className="text-sm text-gray-600 mb-2">{attachment.description}</p>
          )}
          {showDownloadButton && (
            <button
              onClick={() => handleDownload(attachment)}
              className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderFullscreenView = () => {
    if (!selectedAttachment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-4xl max-h-full">
          {/* Close Button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {attachments.length > 1 && (
            <>
              <button
                onClick={() => navigateAttachment('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => navigateAttachment('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black bg-opacity-50 rounded-full text-white text-sm">
            {currentIndex + 1} / {attachments.length}
          </div>

          {/* Content */}
          <div className="w-full h-full">
            {selectedAttachment.type === AttachmentType.PHOTO && (
              <img
                src={selectedAttachment.url}
                alt={hasMeaningfulDescription(selectedAttachment.description) ? selectedAttachment.description : 'Fullscreen view'}
                className="w-full h-full object-contain"
              />
            )}
            {selectedAttachment.type === AttachmentType.VIDEO && (
              <video
                src={selectedAttachment.url}
                className="w-full h-full object-contain"
                controls
                autoPlay
                loop
              />
            )}
            {selectedAttachment.type === AttachmentType.AUDIO && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Volume2 className="w-24 h-24 text-white mx-auto mb-4" />
                  {hasMeaningfulDescription(selectedAttachment.description) && (
                    <p className="text-white text-lg mb-4">{selectedAttachment.description}</p>
                  )}
                  <audio
                    src={selectedAttachment.url}
                    controls
                    className="w-full max-w-md"
                  />
                </div>
              </div>
            )}
            {selectedAttachment.type === AttachmentType.PDF && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-24 h-24 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 font-bold text-2xl">PDF</span>
                  </div>
                  {hasMeaningfulDescription(selectedAttachment.description) && (
                    <p className="text-white text-lg mb-4">{selectedAttachment.description}</p>
                  )}
                  <button
                    onClick={() => handleDownload(selectedAttachment)}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                </div>
                </div>
              )}
            </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {attachments.map((attachment, index) => (
          <div key={attachment.id} className="relative">
            {renderAttachmentPreview(attachment, index)}
            
            {/* Attachment Info */}
            <div className="mt-2 text-center">
              {hasMeaningfulDescription(attachment.description) ? (
                <p className="text-sm text-gray-600 truncate">
                  {attachment.description}
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  {attachment.type === AttachmentType.PHOTO ? 'Photo' : 
                   attachment.type === AttachmentType.VIDEO ? 'Video' : 
                   attachment.type === AttachmentType.AUDIO ? 'Audio File' : 
                   attachment.type === AttachmentType.PDF ? 'Document' : 'Attachment'} {index + 1}
                </p>
              )}
              <p className="text-xs text-gray-400 capitalize">
                {attachment.type.toLowerCase()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {renderFullscreenView()}
    </>
  );
};

export default AttachmentViewer;
