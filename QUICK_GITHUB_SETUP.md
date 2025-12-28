# Quick GitHub Setup Guide

## Option 1: Use the Configuration Helper (Recommended)

1. **Open the configuration helper**: `configure-github.html`
2. **Follow the step-by-step instructions** in the helper
3. **It will generate the complete configuration** for you
4. **Copy and paste** the generated code into `github-storage.js`

## Option 2: Manual Configuration

If you already have your GitHub token and Gist ID, provide them and I'll configure it automatically:

### What I Need:
1. **GitHub Personal Access Token** (starts with `ghp_`)
2. **Gist ID** (the long string from your Gist URL)

### How to Get Them:

#### GitHub Token:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "Radhe Mart Data Sync"
4. Scopes: Check only "gist"
5. Copy the generated token

#### Gist ID:
1. Go to: https://gist.github.com/
2. Create new gist with filename: `radhe-mart-data.json`
3. Content: `{"orders":[],"refunds":[],"otps":[],"refundOtps":[],"payments":[]}`
4. Create the gist
5. Copy the ID from the URL (e.g., if URL is `https://gist.github.com/username/abc123`, then ID is `abc123`)

## Option 3: Test Without GitHub (Local Only)

If you want to test the system without GitHub setup:

1. The system will work with local storage only
2. Data will sync between browser tabs on the same device
3. Cross-device sync won't work until GitHub is configured
4. You'll see "Sync failed. Using local data only" - this is normal

## Benefits of GitHub Configuration:

✅ **Cross-device synchronization** - Data appears on all devices
✅ **Cloud backup** - Data is safely stored in GitHub
✅ **Real-time updates** - Changes sync within 5-10 seconds
✅ **Persistent storage** - Data survives browser clearing
✅ **Admin visibility** - See user data from any device instantly

## Testing After Configuration:

1. Submit a refund request on mobile
2. Open admin panel on computer
3. Click "Sync Data" button
4. Should see "Data synced with GitHub successfully!"
5. User data should appear immediately

---

**Choose your preferred option above and let me know if you need help with any step!**