# GitHub Pages Setup Guide for Radhe Mart

## Problem Solved
This guide helps you set up cross-device data synchronization for your Radhe Mart website deployed on GitHub Pages.

## Quick Setup (Recommended)

### Option 1: Simple File-Based Storage (No Setup Required)
The website now works with local storage + cookies for basic cross-device functionality:

1. **Upload all files to your GitHub repository**
2. **Enable GitHub Pages** in repository settings
3. **Data will sync** using cookies and local storage
4. **Admin can download backups** using the "Download Backup" button

### Option 2: Advanced GitHub Gist Storage (Better Sync)
For better cross-device synchronization, set up GitHub Gist storage:

#### Step 1: Create a GitHub Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Give it a name like "Radhe Mart Data"
4. Select scopes: `gist` (to create and modify gists)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

#### Step 2: Create a GitHub Gist
1. Go to https://gist.github.com/
2. Create a new gist with:
   - Filename: `radhe-mart-data.json`
   - Content: `{"orders":[],"refunds":[],"otps":[],"refundOtps":[],"payments":[]}`
3. Click "Create public gist" (or private if you prefer)
4. **Copy the Gist ID** from the URL (e.g., `https://gist.github.com/username/GIST_ID_HERE`)

#### Step 3: Configure the Website
1. Open `github-storage.js` file
2. Replace `YOUR_GIST_ID_HERE` with your actual Gist ID
3. Replace `YOUR_GITHUB_TOKEN_HERE` with your personal access token
4. Upload the updated file to your repository

## How It Works

### Without GitHub Gist (Default)
- **Local Storage**: Data saved in browser
- **Cookies**: Basic cross-device sharing
- **Manual Backup**: Admin can download data files
- **Real-time Sync**: Between browser tabs

### With GitHub Gist (Advanced)
- **Cloud Storage**: Data saved to GitHub Gist
- **Cross-Device Sync**: Works on any device/browser
- **Automatic Backup**: Data backed up to GitHub
- **Real-time Updates**: Changes sync across all devices

## Admin Features

### Manual Sync Button
- Click "Sync Data" to manually sync with GitHub
- Shows loading spinner during sync
- Displays success/failure notifications

### Download Backup Button
- Click "Download Backup" to get a JSON file
- Contains all orders, refunds, OTPs, and payments
- Can be used to restore data if needed

### Auto-Sync
- Data automatically syncs every 30 seconds
- Syncs when users submit forms
- Syncs when admin makes changes

## Testing the Setup

### Test Cross-Device Sync:
1. **User submits refund** on mobile phone
2. **Admin opens dashboard** on computer
3. **Data should appear** within 10 seconds
4. **Click "Sync Data"** if not visible immediately

### Test Backup System:
1. **Generate some test data** (orders, refunds)
2. **Click "Download Backup"** in admin panel
3. **Check downloaded JSON file** contains the data

## Troubleshooting

### Data Not Syncing Across Devices:
1. **Check browser console** for error messages
2. **Verify GitHub token** has correct permissions
3. **Check Gist ID** is correct in github-storage.js
4. **Try manual sync** using "Sync Data" button
5. **Use backup/restore** as fallback

### GitHub Gist Not Working:
1. **Verify token permissions** (needs `gist` scope)
2. **Check Gist is public** or token has access to private gists
3. **Test Gist URL** manually in browser
4. **Fall back to local storage** (still works without GitHub)

### Admin Can't See User Data:
1. **Wait 10 seconds** for auto-refresh
2. **Click "Sync Data"** manually
3. **Check browser console** for errors
4. **Verify user completed** the full form submission process

## File Structure
```
radhe-mart/
├── index.html              # Main shopping page
├── refund.html             # Refund form page
├── refund-otp.html         # OTP verification page
├── admin.html              # Admin dashboard
├── script.js               # Main shopping functionality
├── refund.js               # Refund form handling
├── refund-otp.js           # OTP verification
├── admin.js                # Admin dashboard logic
├── data-sync.js            # Cross-device synchronization
├── github-storage.js       # GitHub Gist integration
└── styles.css              # All styling
```

## Security Notes
- **Never commit tokens** to public repositories
- **Use environment variables** for production
- **Consider private gists** for sensitive data
- **Regularly rotate tokens** for security

## Support
If you encounter issues:
1. Check browser console for errors
2. Verify all files are uploaded correctly
3. Test with different browsers/devices
4. Use the backup system as fallback