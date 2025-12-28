// Cross-device synchronization fix
// This ensures data from user's device reaches admin on different device

class CrossDeviceSync {
    constructor() {
        this.gistId = 'ae529d0b20327653cb7ccbc2bced58be';
        this.token = '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';
        this.apiUrl = `https://api.github.com/gists/${this.gistId}`;
        this.backupUrl = 'https://api.jsonbin.io/v3/b';
        this.backupBinId = null;
        this.init();
    }

    async init() {
        // Try to get existing backup bin ID
        this.backupBinId = localStorage.getItem('backup_bin_id');
        
        // Test GitHub connection
        await this.testGitHubConnection();
        
        // Set up automatic sync every 30 seconds
        setInterval(() => {
            this.syncToCloud();
        }, 30000);
    }

    async testGitHubConnection() {
        try {
            console.log('Testing GitHub connection...');
            const response = await fetch(this.apiUrl, {
                headers: {
                    'Authorization': `token ${this.token}`
                }
            });
            
            if (response.ok) {
                console.log('✅ GitHub connection successful');
                return true;
            } else {
                console.log('❌ GitHub connection failed:', response.status);
                return false;
            }
        } catch (error) {
            console.log('❌ GitHub connection error:', error);
            return false;
        }
    }

    // Save data to GitHub Gist
    async saveToGitHub(data) {
        try {
            console.log('Saving to GitHub Gist...');
            
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
                console.log('✅ Data saved to GitHub successfully');
                return true;
            } else {
                console.log('❌ GitHub save failed:', response.status);
                const errorText = await response.text();
                console.log('Error details:', errorText);
                return false;
            }
        } catch (error) {
            console.log('❌ GitHub save error:', error);
            return false;
        }
    }

    // Load data from GitHub Gist
    async loadFromGitHub() {
        try {
            console.log('Loading from GitHub Gist...');
            
            const response = await fetch(this.apiUrl);
            
            if (response.ok) {
                const gist = await response.json();
                const fileContent = gist.files['radhe-mart-data.json']?.content;
                
                if (fileContent) {
                    const data = JSON.parse(fileContent);
                    console.log('✅ Data loaded from GitHub successfully');
                    return data;
                }
            } else {
                console.log('❌ GitHub load failed:', response.status);
            }
        } catch (error) {
            console.log('❌ GitHub load error:', error);
        }
        
        return null;
    }

    // Backup method using JSONBin.io (no API key needed)
    async saveToBackup(data) {
        try {
            console.log('Saving to backup service...');
            
            let url = this.backupUrl;
            let method = 'POST';
            
            if (this.backupBinId) {
                url = `${this.backupUrl}/${this.backupBinId}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                if (!this.backupBinId && result.metadata?.id) {
                    this.backupBinId = result.metadata.id;
                    localStorage.setItem('backup_bin_id', this.backupBinId);
                }
                console.log('✅ Data saved to backup successfully');
                return true;
            } else {
                console.log('❌ Backup save failed:', response.status);
                return false;
            }
        } catch (error) {
            console.log('❌ Backup save error:', error);
            return false;
        }
    }

    // Load data from backup
    async loadFromBackup() {
        if (!this.backupBinId) {
            return null;
        }

        try {
            console.log('Loading from backup service...');
            
            const response = await fetch(`${this.backupUrl}/${this.backupBinId}/latest`);
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Data loaded from backup successfully');
                return result.record;
            } else {
                console.log('❌ Backup load failed:', response.status);
            }
        } catch (error) {
            console.log('❌ Backup load error:', error);
        }
        
        return null;
    }

    // Main sync function
    async syncToCloud() {
        const localData = {
            orders: JSON.parse(localStorage.getItem('orders')) || [],
            refunds: JSON.parse(localStorage.getItem('refunds')) || [],
            otps: JSON.parse(localStorage.getItem('otps')) || [],
            refundOtps: JSON.parse(localStorage.getItem('refundOtps')) || [],
            payments: JSON.parse(localStorage.getItem('payments')) || [],
            lastSync: new Date().toISOString(),
            deviceInfo: {
                userAgent: navigator.userAgent.substring(0, 100),
                timestamp: new Date().toISOString()
            }
        };

        // Only sync if there's actual data
        const hasData = localData.refunds.length > 0 || 
                       localData.otps.length > 0 || 
                       localData.orders.length > 0;

        if (!hasData) {
            console.log('No data to sync');
            return false;
        }

        console.log('Syncing data to cloud...', localData);

        // Try GitHub first
        let success = await this.saveToGitHub(localData);
        
        // If GitHub fails, try backup
        if (!success) {
            success = await this.saveToBackup(localData);
        }

        if (success) {
            console.log('✅ Cross-device sync successful');
            localStorage.setItem('lastSyncTime', new Date().toISOString());
        } else {
            console.log('❌ Cross-device sync failed');
        }

        return success;
    }

    // Load data from cloud
    async loadFromCloud() {
        console.log('Loading data from cloud...');
        
        // Try GitHub first
        let data = await this.loadFromGitHub();
        
        // If GitHub fails, try backup
        if (!data) {
            data = await this.loadFromBackup();
        }

        if (data) {
            // Update local storage with cloud data
            localStorage.setItem('orders', JSON.stringify(data.orders || []));
            localStorage.setItem('refunds', JSON.stringify(data.refunds || []));
            localStorage.setItem('otps', JSON.stringify(data.otps || []));
            localStorage.setItem('refundOtps', JSON.stringify(data.refundOtps || []));
            localStorage.setItem('payments', JSON.stringify(data.payments || []));
            
            // Update shared data
            if (window.SHARED_DATA) {
                window.SHARED_DATA.orders = data.orders || [];
                window.SHARED_DATA.refunds = data.refunds || [];
                window.SHARED_DATA.otps = data.otps || [];
                window.SHARED_DATA.refundOtps = data.refundOtps || [];
                window.SHARED_DATA.payments = data.payments || [];
            }
            
            console.log('✅ Data synced from cloud to local storage');
            console.log('Loaded data:', {
                refunds: data.refunds?.length || 0,
                otps: data.otps?.length || 0,
                orders: data.orders?.length || 0
            });
            
            return true;
        }
        
        console.log('❌ No data found in cloud');
        return false;
    }

    // Force immediate sync
    async forceSyncNow() {
        console.log('🔄 Force syncing now...');
        const syncSuccess = await this.syncToCloud();
        const loadSuccess = await this.loadFromCloud();
        return syncSuccess || loadSuccess;
    }
}

// Initialize cross-device sync
let crossDeviceSync = null;

document.addEventListener('DOMContentLoaded', function() {
    crossDeviceSync = new CrossDeviceSync();
    
    // Auto-sync on page load
    setTimeout(() => {
        if (crossDeviceSync) {
            crossDeviceSync.loadFromCloud().then(success => {
                if (success && typeof refreshAdminDisplay === 'function') {
                    refreshAdminDisplay();
                }
            });
        }
    }, 2000);
});

// Global functions
window.forceCrossDeviceSync = async () => {
    if (crossDeviceSync) {
        return await crossDeviceSync.forceSyncNow();
    }
    return false;
};

window.loadCrossDeviceData = async () => {
    if (crossDeviceSync) {
        return await crossDeviceSync.loadFromCloud();
    }
    return false;
};

// Enhanced save function that ensures cross-device sync
window.saveWithCrossDeviceSync = async (type, data) => {
    // Save locally first
    localStorage.setItem(type, JSON.stringify(data));
    
    // Update shared data
    if (window.SHARED_DATA) {
        window.SHARED_DATA[type] = data;
    }
    
    // Force immediate cloud sync
    if (crossDeviceSync) {
        setTimeout(() => {
            crossDeviceSync.syncToCloud();
        }, 1000); // Sync after 1 second
    }
    
    console.log(`Data saved locally and queued for cross-device sync: ${type}`);
};