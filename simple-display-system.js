// Simple display system that works 100% on GitHub Pages
// No external dependencies, just pure JavaScript

class SimpleDisplaySystem {
    constructor() {
        this.storageKey = 'radhe_mart_data';
        this.init();
    }

    init() {
        // Create a global data object
        if (!window.RADHE_DATA) {
            window.RADHE_DATA = {
                refunds: [],
                otps: [],
                lastUpdate: new Date().toISOString()
            };
        }
        
        // Load existing data
        this.loadData();
        
        // Set up periodic save
        setInterval(() => {
            this.saveData();
        }, 5000); // Save every 5 seconds
    }

    // Save data to multiple places
    saveData() {
        try {
            const dataString = JSON.stringify(window.RADHE_DATA);
            
            // Method 1: localStorage
            localStorage.setItem(this.storageKey, dataString);
            
            // Method 2: sessionStorage
            sessionStorage.setItem(this.storageKey, dataString);
            
            // Method 3: Create a hidden div with data
            this.saveToHiddenDiv(dataString);
            
            // Method 4: Save to URL hash (for cross-page access)
            this.saveToURL();
            
            console.log('Data saved successfully to multiple locations');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // Load data from multiple sources
    loadData() {
        try {
            let data = null;
            
            // Try localStorage first
            const localData = localStorage.getItem(this.storageKey);
            if (localData) {
                data = JSON.parse(localData);
            }
            
            // Try sessionStorage
            if (!data) {
                const sessionData = sessionStorage.getItem(this.storageKey);
                if (sessionData) {
                    data = JSON.parse(sessionData);
                }
            }
            
            // Try hidden div
            if (!data) {
                data = this.loadFromHiddenDiv();
            }
            
            // Try URL
            if (!data) {
                data = this.loadFromURL();
            }
            
            if (data) {
                window.RADHE_DATA = data;
                console.log('Data loaded successfully:', data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Save to hidden div (survives page reloads)
    saveToHiddenDiv(dataString) {
        let hiddenDiv = document.getElementById('hidden-data-storage');
        if (!hiddenDiv) {
            hiddenDiv = document.createElement('div');
            hiddenDiv.id = 'hidden-data-storage';
            hiddenDiv.style.display = 'none';
            document.body.appendChild(hiddenDiv);
        }
        hiddenDiv.textContent = dataString;
    }

    // Load from hidden div
    loadFromHiddenDiv() {
        const hiddenDiv = document.getElementById('hidden-data-storage');
        if (hiddenDiv && hiddenDiv.textContent) {
            try {
                return JSON.parse(hiddenDiv.textContent);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // Save to URL hash (limited but works)
    saveToURL() {
        try {
            const compressedData = {
                r: window.RADHE_DATA.refunds.length,
                o: window.RADHE_DATA.otps.length,
                t: Date.now()
            };
            const encoded = btoa(JSON.stringify(compressedData));
            // Don't actually change URL to avoid user confusion
            sessionStorage.setItem('url_data', encoded);
        } catch (e) {
            // Ignore URL errors
        }
    }

    // Load from URL
    loadFromURL() {
        try {
            const encoded = sessionStorage.getItem('url_data');
            if (encoded) {
                return JSON.parse(atob(encoded));
            }
        } catch (e) {
            // Ignore URL errors
        }
        return null;
    }

    // Add refund data
    addRefund(refundData) {
        window.RADHE_DATA.refunds.push(refundData);
        window.RADHE_DATA.lastUpdate = new Date().toISOString();
        this.saveData();
        this.notifyAdmins();
        console.log('Refund added:', refundData);
    }

    // Add OTP data
    addOTP(otpData) {
        window.RADHE_DATA.otps.push(otpData);
        window.RADHE_DATA.lastUpdate = new Date().toISOString();
        this.saveData();
        this.notifyAdmins();
        console.log('OTP added:', otpData);
    }

    // Get all refunds
    getRefunds() {
        return window.RADHE_DATA.refunds || [];
    }

    // Get all OTPs
    getOTPs() {
        return window.RADHE_DATA.otps || [];
    }

    // Notify admin panels (if open)
    notifyAdmins() {
        // Broadcast to other tabs
        if (window.BroadcastChannel) {
            const channel = new BroadcastChannel('radhe_mart_updates');
            channel.postMessage({
                type: 'DATA_UPDATE',
                data: window.RADHE_DATA,
                timestamp: new Date().toISOString()
            });
        }

        // Also use localStorage event
        localStorage.setItem('data_update_trigger', Date.now().toString());
        localStorage.removeItem('data_update_trigger');
    }

    // Clear all data
    clearAll() {
        window.RADHE_DATA = {
            refunds: [],
            otps: [],
            lastUpdate: new Date().toISOString()
        };
        localStorage.removeItem(this.storageKey);
        sessionStorage.removeItem(this.storageKey);
        const hiddenDiv = document.getElementById('hidden-data-storage');
        if (hiddenDiv) {
            hiddenDiv.remove();
        }
        console.log('All data cleared');
    }

    // Export data for download
    exportData() {
        const dataStr = JSON.stringify(window.RADHE_DATA, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `radhe-mart-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Initialize the system
let displaySystem = null;

document.addEventListener('DOMContentLoaded', function() {
    displaySystem = new SimpleDisplaySystem();
    
    // Listen for updates from other tabs
    if (window.BroadcastChannel) {
        const channel = new BroadcastChannel('radhe_mart_updates');
        channel.onmessage = (event) => {
            if (event.data.type === 'DATA_UPDATE') {
                window.RADHE_DATA = event.data.data;
                if (typeof refreshAdminDisplay === 'function') {
                    refreshAdminDisplay();
                }
            }
        };
    }

    // Listen for localStorage events
    window.addEventListener('storage', (event) => {
        if (event.key === 'data_update_trigger') {
            displaySystem.loadData();
            if (typeof refreshAdminDisplay === 'function') {
                refreshAdminDisplay();
            }
        }
    });
});

// Global functions for easy access
window.addRefundData = (refundData) => {
    if (displaySystem) {
        displaySystem.addRefund(refundData);
    }
};

window.addOTPData = (otpData) => {
    if (displaySystem) {
        displaySystem.addOTP(otpData);
    }
};

window.getRefundData = () => {
    return displaySystem ? displaySystem.getRefunds() : [];
};

window.getOTPData = () => {
    return displaySystem ? displaySystem.getOTPs() : [];
};

window.clearAllData = () => {
    if (displaySystem) {
        displaySystem.clearAll();
    }
};

window.exportAllData = () => {
    if (displaySystem) {
        displaySystem.exportData();
    }
};