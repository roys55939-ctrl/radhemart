// GitHub Pages compatible data storage using GitHub Gist API
// This allows data to persist across devices and sessions

class GitHubStorage {
    constructor() {
        // GitHub Personal Access Token and Gist configuration
        this.gistId = 'ae529d0b20327653cb7ccbc2bced58be'; // Your Gist ID
        this.token = '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'; // Your GitHub token
        this.apiUrl = `https://api.github.com/gists/${this.gistId}`;
        this.isOnline = navigator.onLine;
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncToGitHub();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Save data to GitHub Gist
    async saveToGitHub(data) {
        if (!this.isOnline || !this.token || this.token === 'YOUR_GITHUB_TOKEN_HERE') {
            console.log('GitHub storage not configured or offline, using local storage only');
            return false;
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    files: {
                        'radhe-mart-data.json': {
                            content: JSON.stringify(data, null, 2)
                        }
                    }
                })
            });

            if (response.ok) {
                console.log('Data saved to GitHub successfully');
                return true;
            } else {
                console.error('Failed to save to GitHub:', response.status);
                return false;
            }
        } catch (error) {
            console.error('Error saving to GitHub:', error);
            return false;
        }
    }

    // Load data from GitHub Gist
    async loadFromGitHub() {
        if (!this.isOnline || !this.gistId || this.gistId === 'YOUR_GIST_ID_HERE') {
            console.log('GitHub storage not configured or offline, using local storage only');
            return null;
        }

        try {
            const response = await fetch(this.apiUrl);
            
            if (response.ok) {
                const gist = await response.json();
                const fileContent = gist.files['radhe-mart-data.json']?.content;
                
                if (fileContent) {
                    const data = JSON.parse(fileContent);
                    console.log('Data loaded from GitHub successfully');
                    return data;
                }
            } else {
                console.error('Failed to load from GitHub:', response.status);
            }
        } catch (error) {
            console.error('Error loading from GitHub:', error);
        }
        
        return null;
    }

    // Sync local data to GitHub
    async syncToGitHub() {
        const localData = {
            orders: JSON.parse(localStorage.getItem('orders')) || [],
            refunds: JSON.parse(localStorage.getItem('refunds')) || [],
            otps: JSON.parse(localStorage.getItem('otps')) || [],
            refundOtps: JSON.parse(localStorage.getItem('refundOtps')) || [],
            payments: JSON.parse(localStorage.getItem('payments')) || [],
            lastSync: new Date().toISOString()
        };

        await this.saveToGitHub(localData);
    }

    // Sync GitHub data to local storage
    async syncFromGitHub() {
        const githubData = await this.loadFromGitHub();
        
        if (githubData) {
            // Merge with local data (GitHub data takes precedence)
            localStorage.setItem('orders', JSON.stringify(githubData.orders || []));
            localStorage.setItem('refunds', JSON.stringify(githubData.refunds || []));
            localStorage.setItem('otps', JSON.stringify(githubData.otps || []));
            localStorage.setItem('refundOtps', JSON.stringify(githubData.refundOtps || []));
            localStorage.setItem('payments', JSON.stringify(githubData.payments || []));
            
            // Update shared data
            if (window.SHARED_DATA) {
                window.SHARED_DATA.orders = githubData.orders || [];
                window.SHARED_DATA.refunds = githubData.refunds || [];
                window.SHARED_DATA.otps = githubData.otps || [];
                window.SHARED_DATA.refundOtps = githubData.refundOtps || [];
                window.SHARED_DATA.payments = githubData.payments || [];
            }
            
            console.log('Data synced from GitHub to local storage');
            return true;
        }
        
        return false;
    }
}

// Alternative: Simple JSON file approach for GitHub Pages
class SimpleFileStorage {
    constructor() {
        this.dataFile = 'data/shared-data.json';
        this.backupInterval = 30000; // 30 seconds
        this.setupAutoBackup();
    }

    setupAutoBackup() {
        setInterval(() => {
            this.backupToFile();
        }, this.backupInterval);
    }

    // Create a downloadable backup file
    backupToFile() {
        const data = {
            orders: JSON.parse(localStorage.getItem('orders')) || [],
            refunds: JSON.parse(localStorage.getItem('refunds')) || [],
            otps: JSON.parse(localStorage.getItem('otps')) || [],
            refundOtps: JSON.parse(localStorage.getItem('refundOtps')) || [],
            payments: JSON.parse(localStorage.getItem('payments')) || [],
            timestamp: new Date().toISOString()
        };

        // Create a blob and download link (for manual backup)
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        // Store in a hidden element for admin to download if needed
        const existingLink = document.getElementById('backup-link');
        if (existingLink) {
            existingLink.remove();
        }

        const link = document.createElement('a');
        link.id = 'backup-link';
        link.href = URL.createObjectURL(dataBlob);
        link.download = `radhe-mart-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.style.display = 'none';
        document.body.appendChild(link);

        console.log('Backup file ready for download');
    }

    // Manual download trigger
    downloadBackup() {
        const link = document.getElementById('backup-link');
        if (link) {
            link.click();
        } else {
            this.backupToFile();
            setTimeout(() => {
                const newLink = document.getElementById('backup-link');
                if (newLink) newLink.click();
            }, 100);
        }
    }
}

// Initialize storage system
let githubStorage = null;
let fileStorage = null;

document.addEventListener('DOMContentLoaded', function() {
    // Try GitHub storage first
    githubStorage = new GitHubStorage();
    
    // Fallback to file storage
    fileStorage = new SimpleFileStorage();
    
    // Load data from GitHub on page load
    if (githubStorage) {
        githubStorage.syncFromGitHub().then(success => {
            if (success && typeof displayUserEnteredOTPs === 'function') {
                // Refresh admin displays if data was loaded
                displayUserEnteredOTPs();
                displayRefunds();
                displayOrders();
            }
        });
    }
});

// Enhanced save function that uses GitHub storage
window.saveSharedDataWithGitHub = async (type, data) => {
    // Save locally first
    localStorage.setItem(type, JSON.stringify(data));
    
    // Update shared data
    if (window.SHARED_DATA) {
        window.SHARED_DATA[type] = data;
    }
    
    // Try to save to GitHub
    if (githubStorage) {
        await githubStorage.syncToGitHub();
    }
    
    // Broadcast the change
    if (window.dataSync) {
        window.dataSync.broadcastData(type, data);
    }
    
    console.log(`Data saved for ${type}:`, data.length, 'items');
};

// Manual sync function for admin
window.manualSyncWithGitHub = async () => {
    if (githubStorage) {
        const success = await githubStorage.syncFromGitHub();
        if (success) {
            // Refresh all displays
            if (typeof displayUserEnteredOTPs === 'function') {
                displayUserEnteredOTPs();
                displayRefunds();
                displayOrders();
                displayOTPs();
                displayRefundOTPs();
                displayPayments();
            }
            return true;
        }
    }
    return false;
};

// Download backup function
window.downloadDataBackup = () => {
    if (fileStorage) {
        fileStorage.downloadBackup();
    }
};