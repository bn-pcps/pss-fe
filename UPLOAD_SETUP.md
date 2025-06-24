# File Upload Setup

This document explains how to set up the file upload process for PlanarShare.

## Environment Variables

Add the following environment variable to your `.env` file:

```bash
# File Service URL - URL of the external file service
PUBLIC_FILE_SERVICE_URL="http://localhost:3001"
```

## How It Works

1. **Client sends metadata**: The upload handler component sends share metadata (without actual files) to `/api/upload`
2. **Server validation**: The API endpoint validates the metadata using the same validation logic as the client
3. **Database storage**: If valid, the server stores the share data in `ps_shares` and `ps_share_settings` tables
4. **Signature generation**: The server creates an upload signature and stores it in `ps_upload_signatures`
5. **File upload**: The client uses the returned signature to upload files to `FILE_SERVICE_URL/up/<signature>`

## API Endpoints

### POST /api/upload

Handles share metadata upload and returns upload signature.

**Request Body:**

```json
{
	"title": "My Share",
	"description": "Optional description",
	"extra_features": {
		"enabled_features": ["password", "expiry"],
		"password": "secret123",
		"expiry": "7"
	},
	"files": [
		{
			"name": "file1.txt",
			"size": 1024,
			"type": "text/plain"
		}
	],
	"total_size": 1024
}
```

**Response:**

```json
{
	"success": true,
	"share_id": "uuid",
	"signature": "base64-encoded-signature"
}
```

## Database Schema

The upload process uses these tables:

- `ps_shares`: Main share record
- `ps_share_settings`: Optional settings (password, expiry, etc.)
- `ps_upload_signatures`: Upload signatures for file service

## File Service Integration

The client uploads files to the external file service using:

```
POST ${FILE_SERVICE_URL}/up/${signature}
```

Where the signature is a base64-encoded string containing `userId:shareId:timestamp`.
