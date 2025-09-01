# Regional Restrictions and Attachment Features

## New Features Implemented

### 1. Regional Restrictions for Topics

Topics can now have regional restrictions at three levels:
- **District Level**: Topic visible only to users in the same district
- **Sector Level**: Topic visible only to users in the same district and sector
- **Cell Level**: Topic visible only to users in the same district, sector, and cell

#### Implementation Details

**Type Definition:**
```typescript
interface Topic {
  // ... existing properties
  regionalRestriction?: {
    level: 'district' | 'sector' | 'cell';
    district?: string;
    sector?: string;
    cell?: string;
  };
}
```

**Regional Badge Component:**
- Color-coded badges indicating restriction level:
  - 🔵 Blue: District level ("Gasabo District Only")
  - 🟢 Green: Sector level ("Nyamirambo Sector Only") 
  - 🟠 Orange: Cell level ("Rweru Cell Only")
- MapPin icon for visual clarity

**Filtering Logic:**
- Automatic filtering based on user's location
- Only shows topics that match user's administrative level
- No regional restriction = visible to all users

### 2. Enhanced Attachment System for Announcements

Announcements now support rich media attachments with preview and download capabilities.

#### Supported File Types:
- **Images** (JPG, PNG): Inline preview with thumbnail
- **Videos** (MP4): Video player with thumbnail preview
- **PDFs**: Document preview with download option
- **Audio** (MP3): Audio player indication
- **Documents**: General document types

#### Features:
- **Compact View**: Shows attachments as badges in announcement cards
- **Full View**: Grid layout with thumbnails and file details
- **Preview Modal**: Full-screen viewing for images and videos
- **Download Support**: Direct download links for all file types
- **File Information**: Shows file size, type, and upload date

### 3. Updated Data Structure

#### Sample Topics with Regional Restrictions:
1. **BRT System Discussion** - Gasabo District Only
2. **Community Garden Project** - Nyamirambo Sector Only  
3. **Youth Football Tournament** - Rweru Cell Only
4. **Digital Literacy Training** - No restrictions (all users)

#### Sample Announcements with Attachments:
1. **Digital ID Registration**:
   - PDF registration guide
   - Sample ID card image
   
2. **Vaccination Campaign**:
   - Centers location map (image)
   - Information video
   - Schedule PDF
   
3. **Road Construction Project**:
   - Project overview video
   - Construction timeline PDF

## Components Created/Updated

### New Components:
- **RegionalBadge.tsx**: Displays regional restriction information
- **AttachmentViewer.tsx**: Handles attachment display and interaction

### Updated Components:
- **TopicCard.tsx**: Added regional badge display
- **TopicsSection.tsx**: Enhanced filtering for regional restrictions
- **AnnouncementCard.tsx**: Added compact attachment viewer
- **Types**: Enhanced Attachment and Topic interfaces

## User Experience Improvements

### Regional Restrictions:
- Users automatically see only relevant regional content
- Clear visual indicators showing restriction levels
- Better community engagement through location-based discussions

### Attachments:
- Visual previews for images and videos
- Easy download access for documents
- Professional presentation of government materials
- Mobile-responsive design

## Technical Implementation

### Regional Filtering Algorithm:
```typescript
const isTopicAccessible = (topic: Topic, user: User) => {
  if (!topic.regionalRestriction) return true;
  
  const { level, district, sector, cell } = topic.regionalRestriction;
  const userLocation = user.location;
  
  switch (level) {
    case 'district':
      return userLocation.district === district;
    case 'sector':
      return userLocation.district === district && 
             userLocation.sector === sector;
    case 'cell':
      return userLocation.district === district && 
             userLocation.sector === sector && 
             userLocation.cell === cell;
  }
};
```

### Attachment Handling:
- Thumbnail generation for videos and documents
- MIME type detection
- File size formatting
- Responsive grid layout
- Modal system for full-screen viewing

## Usage Examples

### Creating Regional Topics:
Topics are automatically filtered based on the user's location profile. Users in:
- Gasabo District can see district-wide BRT discussions
- Nyamirambo Sector can participate in local garden projects
- Rweru Cell can register for local football tournaments

### Viewing Announcements:
Government announcements now provide rich media experience:
- View vaccination center locations on embedded maps
- Watch instructional videos directly in the platform
- Download official documents and schedules
- Access forms and guides with one click

This implementation enhances community engagement through location-relevant content and improves information accessibility through rich media support.
