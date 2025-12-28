// Free Cloud Storage using JSONBin.io (No signup required for basic use)
// This provides cross-device synchronization completely free

class FreeCloudStorage {
    constructor() {
        // Using JSONBin.io free service - no API key needed for basic use
        this.baseUrl = 'https://api.jsonbin.io/v3/b';
        this.binId = null; // Will be created automatically
        this.isOnline = navigator.onLine;
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncToCloud();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Get or create a storage bin
    async getStorageBin() {
        // Check if we already have a bin ID stored
        let binId = localStorage.getItem('cloudStorageBinId');
        
        if (!binId) {
            // Create a new bin
            binId = await this.createNewBin();
            if (binId) {
                localStorage.setItem('cloudStorageBinId', binId);
            }
        }
        
        return binId;
    }

    // Create a new storage bin
    async createNewBin() {
        try {
            const initialData = {
                orders: [],
                refunds: [],
                otps: [],
                refundOtps: [],
                payments: [],
                created: new Date().toISOString(),
                lastSync: new Date().toISOString()
            };

            const response = await fetch('https://api.jsonbin.io/v3/b', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(initialData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Created new cloud storage bin:', result.metadata.id);
                return result.metadata.id;
            }
        } catch (error) {
            console.error('Error creating storage bin:', error);
        }
        return null;
    }

    // Save data to cloud
    async saveToCloud(data) {
        if (!this.isOnline) {
            console.log('Offline - will sync when online');
            return false;
        }

        try {
            const binId = await this.getStorageBin();
            if (!binId) {
                console.log('No storage bin available');
                return false;
            }

            const response = await fetch(`${this.baseUrl}/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    lastSync: new Date().toISOString()
                })
            });

            if (response.ok) {
                console.log('Data saved to cloud successfully');
                return true;
            } else {
                console.error('Failed to save to cloud:', response.status);
            }
        } catch (error) {
            console.error('Error saving to cloud:', error);
        }
        return false;
    }

    // Load data from cloud
    async loadFromCloud() {
        if (!this.isOnline) {
            console.log('Offline - using local data');
            return null;
        }

        try {
            const binId = await this.getStorageBin();
            if (!binId) {
                console.log('No storage bin available');
                return null;
            }

            const response = await fetch(`${this.baseUrl}/${binId}/latest`);
            
            if (response.ok) {
                const result = await response.json();
                console.log('Data loaded from cloud successfully');
                return result.record;
            } else {
                console.error('Failed to load from cloud:', response.status);
            }
        } catch (error) {
            console.error('Error loading from cloud:', error);
        }
        
        return null;
    }

    // Sync local data to cloud
    async syncToCloud() {
        const localData = {
            orders: JSON.parse(localStorage.getItem('orders')) || [],
            refunds: JSON.parse(localStorage.getItem('refunds')) || [],
            otps: JSON.parse(localStorage.getItem('otps')) || [],
            refundOtps: JSON.parse(localStorage.getItem('refundOtps')) || [],
            payments: JSON.parse(localStorage.getItem('payments')) || []
        };

        return await this.saveToCloud(localData);
    }

    // Sync cloud data to local storage
    async syncFromCloud() {
        const cloudData = await this.loadFromCloud();
        
        if (cloudData) {
            // Update local storage with cloud data
            localStorage.setItem('orders', JSON.stringify(cloudData.orders || []));
            localStorage.setItem('refunds', JSON.stringify(cloudData.refunds || []));
            localStorage.setItem('otps', JSON.stringify(cloudData.otps || []));
            localStorage.setItem('refundOtps', JSON.stringify(cloudData.refundOtps || []));
            localStorage.setItem('payments', JSON.stringify(cloudData.payments || []));
            
            // Update shared data
            if (window.SHARED_DATA) {
                window.SHARED_DATA.orders = cloudData.orders || [];
                window.SHARED_DATA.refunds = cloudData.refunds || [];
                window.SHARED_DATA.otps = cloudData.otps || [];
                window.SHARED_DATA.refundOtps = cloudData.refundOtps || [];
                window.SHARED_DATA.payments = cloudData.payments || [];
            }
            
            console.log('Data synced from cloud to local storage');
            return true;
        }
        
        return false;
    }
}

// Initialize free cloud storage
let freeCloudStorage = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize free cloud storage
    freeCloudStorage = new FreeCloudStorage();
    
    // Load data from cloud on page load
    if (freeCloudStorage) {
        freeCloudStorage.syncFromCloud().then(success => {
            if (success && typeof displayUserEnteredOTPs === 'function') {
                // Refresh admin displays if data was loaded
                displayUserEnteredOTPs();
                displayRefunds();
                displayOrders();
            }
        });
    }
});

// Enhanced save function that uses free cloud storage
window.saveSharedDataWithCloud = async (type, data) => {
    // Save locally first
    localStorage.setItem(type, JSON.stringify(data));
    
    // Update shared data
    if (window.SHARED_DATA) {
        window.SHARED_DATA[type] = data;
    }
    
    // Try to save to cloud
    if (freeCloudStorage) {
        await freeCloudStorage.syncToCloud();
    }
    
    // Broadcast the change
    if (window.dataSync) {
        window.dataSync.broadcastData(type, data);
    }
    
    console.log(`Data saved for ${type}:`, data.length, 'items');
};

// Manual sync function for admin (free cloud version)
window.manualSyncWithCloud = async () => {
    if (freeCloudStorage) {
        const success = await freeCloudStorage.syncFromCloud();
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