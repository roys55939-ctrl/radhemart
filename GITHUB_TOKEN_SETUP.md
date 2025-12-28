# GitHub Token Setup Instructions

## Your Gist is Ready! ✅
- **Gist ID**: `ae529d0b20327653cb7ccbc2bced58be`
- **Gist URL**: https://gist.github.com/roys55939-ctrl/ae529d0b20327653cb7ccbc2bced58be

## Next Step: Get Your GitHub Token

### 1. Create Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `Radhe Mart Data Sync`
4. Expiration: `No expiration` or `1 year`
5. **Scopes: Check ONLY "gist"** ✅
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)

### 2. Update github-storage.js
Replace this line in `github-storage.js`:
```javascript
this.token = 'YOUR_GITHUB_TOKEN_HERE';
```

With your actual token:
```javascript
this.token = 'ghp_your_actual_token_here';
```

### 3. Test the Setup
1. Upload updated files to GitHub Pages
2. Submit a test refund request
3. Open admin panel
4. Click "Sync Data" button
5. Should see "Data synced with GitHub successfully!"

## Alternative: Quick Setup Script

If you provide me your GitHub token, I can update the file automatically for you.

Just reply with your token (starts with `ghp_`) and I'll configure everything instantly!

## Security Note
- Never share your token publicly
- Only use it in your own code
- You can regenerate it anytime if needed