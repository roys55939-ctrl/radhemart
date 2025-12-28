# GitHub Configuration for Admin Data Visibility

## Step 1: Create GitHub Personal Access Token

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Click "Generate new token (classic)"
   - Give it a name: "Radhe Mart Data Sync"
   - Set expiration: "No expiration" (or 1 year)
   - Select scopes: **Check only "gist"** (to create and modify gists)
   - Click "Generate token"

3. **Copy Your Token**
   - **IMPORTANT**: Copy the token immediately (you won't see it again!)
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 2: Create GitHub Gist

1. **Go to GitHub Gist**
   - Visit: https://gist.github.com/

2. **Create New Gist**
   - Filename: `radhe-mart-data.json`
   - Content: Copy and paste this exactly:
   ```json
   {
     "orders": [],
     "refunds": [],
     "otps": [],
     "refundOtps": [],
     "payments": [],
     "lastSync": "2024-12-28T00:00:00.000Z"
   }
   ```

3. **Create the Gist**
   - Click "Create public gist" (recommended)
   - Or "Create secret gist" if you prefer private

4. **Copy Gist ID**
   - After creation, copy the Gist ID from the URL
   - Example: `https://gist.github.com/username/abc123def456ghi789`
   - The Gist ID is: `abc123def456ghi789`

## Step 3: Configure the Website

I'll now update the github-storage.js file with your credentials.

**You'll need to provide:**
- Your GitHub Personal Access Token
- Your Gist ID

Once you have these, I'll configure the system automatically.