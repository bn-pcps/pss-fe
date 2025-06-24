# Environment Setup for Share Functionality

## Required Environment Variables

Add these variables to your `.env` file:

### Database Configuration

```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Authentication

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BETTER_AUTH_SECRET=your_better_auth_secret_key
```

### File Service Configuration

```
PUBLIC_FILE_SERVICE_URL=http://localhost:3001
```

This is the URL of your file service that handles:

- `/s/{shareId}` for downloading entire shares
- `/f/{fileId}` for downloading individual files

The file service should accept an optional `password` query parameter for password-protected shares.

## Share Access Routes

The system supports two ways to access shares using a unified route:

1. **Custom Slug**: `/share/{customSlug}`

   - Uses the custom URL slug set by the user
   - Example: `/share/my-awesome-files`

2. **Share ID**: `/share/id?shareid={shareId}`
   - Uses the actual database share ID
   - The special slug "id" triggers share ID lookup
   - Example: `/share/id?shareid=550e8400-e29b-41d4-a716-446655440000`

Both access methods support password protection via URL parameter: `?password={password}`

**Note**: Custom slugs must be 6+ characters to avoid conflicts with the special "id" route.

## File Service Implementation Notes

The share system expects your file service to:

1. **Individual File Downloads**: `GET /f/{fileId}?password={optional}`

   - Validate the file exists and is accessible
   - Check password if the share is password-protected
   - Return the file for download

2. **Entire Share Downloads**: `GET /s/{shareId}?password={optional}`
   - Validate the share exists and is accessible
   - Check password if the share is password-protected
   - Return all files in the share (typically as a ZIP)

## Share Features Implemented

- ✅ **Password Protection**: Client-side validation (as requested for PoC)
- ✅ **Expiry Checking**: Server-side validation that fails fast
- ✅ **Download Limits**: Server-side validation that fails fast
- ✅ **Visit Analytics**: Tracks page views and downloads
- ✅ **Error Handling**: Proper error pages for expired/limited shares
- ✅ **Responsive UI**: Mobile-friendly design
- ✅ **File Listing**: Shows individual files with download buttons
- ✅ **Download All**: Button to download entire share
- ✅ **Unified Routes**: Both access methods use the same endpoint
- ✅ **Improved Error Messages**: Clear, specific error descriptions

## Error Handling

The system provides clear error messages for different scenarios:

- **404**: "Share doesn't exist" - Share not found or removed
- **410**: "Share expired" - Share has passed its expiration date
- **429**: "Download limit reached" - Share has hit its download limit
- **403**: "Access denied" - Share is not public
- **400**: "Invalid request" - Malformed share link or missing share ID
- **500**: "Share either expired, reached download limit, or doesn't exist" - General server errors

## Security Notes

- Expired shares return 410 errors without leaking data
- Download limit exceeded returns 429 errors without leaking data
- Password validation is done client-side (as requested for PoC)
- Actual file downloads are handled by your separate file service
- Share IDs are available to the client but not displayed in the UI
- Both access methods have the same security validations
- Single route handler reduces code duplication and maintenance
