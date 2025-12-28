// Global variables - now using shared data system
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let orders = [];
let otps = [];
let payments = [];

// Initialize shared data on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load shared data
    orders = loadSharedData('orders');
    otps = loadSharedData('otps');
    payments = loadSharedData('payments');
    
    displayProducts();
    updateCartUI();
    setupEventListeners();
});

// Sample products data
const products = [
    // Fruits & Vegetables
    {
        id: 1,
        name: "Fresh Bananas",
        description: "Sweet and ripe bananas - 1 dozen",
        price: 60,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop"
    },
    {
        id: 7,
        name: "Apples",
        description: "Fresh red apples - 1kg",
        price: 120,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop"
    },
    {
        id: 11,
        name: "Tomatoes",
        description: "Fresh tomatoes - 500g",
        price: 30,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1546470427-e5ac89cd0b31?w=300&h=300&fit=crop"
    },
    {
        id: 13,
        name: "Onions",
        description: "Fresh red onions - 1kg",
        price: 25,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop"
    },
    {
        id: 14,
        name: "Potatoes",
        description: "Fresh potatoes - 1kg",
        price: 20,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop"
    },
    {
        id: 15,
        name: "Green Chillies",
        description: "Fresh green chillies - 100g",
        price: 15,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1544047579-ac2ec8c82e4e?w=300&h=300&fit=crop"
    },
    {
        id: 16,
        name: "Ginger",
        description: "Fresh ginger - 200g",
        price: 40,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1599639832862-bd92c6222f92?w=300&h=300&fit=crop"
    },
    {
        id: 17,
        name: "Garlic",
        description: "Fresh garlic - 250g",
        price: 35,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&h=300&fit=crop"
    },
    {
        id: 18,
        name: "Lemons",
        description: "Fresh lemons - 500g",
        price: 25,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop"
    },
    {
        id: 19,
        name: "Carrots",
        description: "Fresh carrots - 500g",
        price: 30,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=300&h=300&fit=crop"
    },
    
    // Dairy & Bakery
    {
        id: 2,
        name: "Milk - 1L",
        description: "Fresh full cream milk",
        price: 55,
        category: "dairy",
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop"
    },
    {
        id: 3,
        name: "Bread Loaf",
        description: "Whole wheat bread",
        price: 35,
        category: "dairy",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop"
    },
    {
        id: 8,
        name: "Eggs",
        description: "Farm fresh eggs - 12 pieces",
        price: 75,
        category: "dairy",
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=300&fit=crop"
    },
    {
        id: 12,
        name: "Cheese",
        description: "Processed cheese slices",
        price: 95,
        category: "dairy",
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=300&fit=crop"
    },
    {
        id: 20,
        name: "Paneer",
        description: "Fresh cottage cheese - 200g",
        price: 80,
        category: "dairy",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&h=300&fit=crop"
    },
    {
        id: 21,
        name: "Curd/Dahi",
        description: "Fresh curd - 500g",
        price: 45,
        category: "dairy",
        image: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=300&h=300&fit=crop"
    },
    {
        id: 22,
        name: "Butter",
        description: "Salted butter - 100g",
        price: 55,
        category: "dairy",
        image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&h=300&fit=crop"
    },
    {
        id: 23,
        name: "Ghee",
        description: "Pure cow ghee - 500ml",
        price: 350,
        category: "dairy",
        image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300&h=300&fit=crop"
    },
    
    // Snacks & Beverages
    {
        id: 4,
        name: "Potato Chips",
        description: "Crispy salted chips - 100g",
        price: 25,
        category: "snacks",
        image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=300&fit=crop"
    },
    {
        id: 5,
        name: "Coca Cola",
        description: "Cold drink - 500ml",
        price: 40,
        category: "snacks",
        image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=300&h=300&fit=crop"
    },
    {
        id: 9,
        name: "Biscuits",
        description: "Chocolate cream biscuits",
        price: 45,
        category: "snacks",
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=300&fit=crop"
    },
    {
        id: 24,
        name: "Namkeen Mix",
        description: "Spicy Indian snack mix - 200g",
        price: 60,
        category: "snacks",
        image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300&h=300&fit=crop"
    },
    {
        id: 25,
        name: "Chai/Tea",
        description: "Premium tea leaves - 250g",
        price: 120,
        category: "snacks",
        image: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d362?w=300&h=300&fit=crop"
    },
    {
        id: 26,
        name: "Coffee Powder",
        description: "Instant coffee - 100g",
        price: 180,
        category: "snacks",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop"
    },
    {
        id: 27,
        name: "Maggi Noodles",
        description: "Instant noodles - 4 pack",
        price: 56,
        category: "snacks",
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=300&fit=crop"
    },
    {
        id: 28,
        name: "Kurkure",
        description: "Crunchy corn snacks - 90g",
        price: 20,
        category: "snacks",
        image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=300&fit=crop"
    },
    {
        id: 29,
        name: "Frooti",
        description: "Mango drink - 200ml",
        price: 15,
        category: "snacks",
        image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=300&h=300&fit=crop"
    },
    {
        id: 30,
        name: "Parle-G Biscuits",
        description: "Classic glucose biscuits - 200g",
        price: 25,
        category: "snacks",
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=300&fit=crop"
    },
    
    // Personal Care
    {
        id: 6,
        name: "Shampoo",
        description: "Hair care shampoo - 200ml",
        price: 180,
        category: "personal",
        image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300&h=300&fit=crop"
    },
    {
        id: 10,
        name: "Soap",
        description: "Antibacterial soap bar",
        price: 35,
        category: "personal",
        image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&h=300&fit=crop"
    },
    {
        id: 31,
        name: "Toothpaste",
        description: "Colgate toothpaste - 100g",
        price: 85,
        category: "personal",
        image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&h=300&fit=crop"
    },
    {
        id: 32,
        name: "Face Wash",
        description: "Gentle face wash - 150ml",
        price: 120,
        category: "personal",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop"
    },
    {
        id: 33,
        name: "Hair Oil",
        description: "Coconut hair oil - 200ml",
        price: 95,
        category: "personal",
        image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&h=300&fit=crop"
    },
    {
        id: 34,
        name: "Dettol",
        description: "Antiseptic liquid - 250ml",
        price: 110,
        category: "personal",
        image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=300&fit=crop"
    },
    {
        id: 35,
        name: "Tissue Paper",
        description: "Soft tissue paper - 100 sheets",
        price: 45,
        category: "personal",
        image: "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=300&h=300&fit=crop"
    },
    {
        id: 36,
        name: "Hand Sanitizer",
        description: "Alcohol-based sanitizer - 100ml",
        price: 65,
        category: "personal",
        image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=300&h=300&fit=crop"
    },
    
    // Indian Staples & Groceries
    {
        id: 37,
        name: "Basmati Rice",
        description: "Premium basmati rice - 1kg",
        price: 180,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop"
    },
    {
        id: 38,
        name: "Wheat Flour/Atta",
        description: "Whole wheat flour - 1kg",
        price: 45,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=300&fit=crop"
    },
    {
        id: 39,
        name: "Toor Dal",
        description: "Yellow lentils - 500g",
        price: 85,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=300&fit=crop"
    },
    {
        id: 40,
        name: "Cooking Oil",
        description: "Refined sunflower oil - 1L",
        price: 140,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop"
    },
    {
        id: 41,
        name: "Sugar",
        description: "White sugar - 1kg",
        price: 50,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=300&fit=crop"
    },
    {
        id: 42,
        name: "Salt",
        description: "Iodized salt - 1kg",
        price: 20,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1472162314594-a27637f1bf1f?w=300&h=300&fit=crop"
    },
    {
        id: 43,
        name: "Turmeric Powder",
        description: "Pure turmeric powder - 100g",
        price: 35,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=300&h=300&fit=crop"
    },
    {
        id: 44,
        name: "Red Chilli Powder",
        description: "Spicy red chilli powder - 100g",
        price: 40,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=300&fit=crop"
    },
    {
        id: 45,
        name: "Garam Masala",
        description: "Mixed spice powder - 50g",
        price: 45,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=300&fit=crop"
    },
    {
        id: 46,
        name: "Cumin Seeds",
        description: "Whole cumin seeds - 100g",
        price: 60,
        category: "fruits",
        image: "https://images.unsplash.com/photo-1599639832862-bd92c6222f92?w=300&h=300&fit=crop"
    }
];

// DOM elements
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const searchInput = document.getElementById('searchInput');
const adminBtn = document.getElementById('adminBtn');

// Modal elements
const paymentModal = document.getElementById('paymentModal');
const otpModal = document.getElementById('otpModal');
const successModal = document.getElementById('successModal');
const adminLoginModal = document.getElementById('adminLoginModal');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    updateCartUI();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Cart functionality
    cartBtn.addEventListener('click', () => cartSidebar.classList.add('open'));
    closeCart.addEventListener('click', () => cartSidebar.classList.remove('open'));
    checkoutBtn.addEventListener('click', openPaymentModal);
    
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    
    // Category filtering
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;
            filterProductsByCategory(category);
        });
    });
    
    // Admin login
    adminBtn.addEventListener('click', () => adminLoginModal.style.display = 'block');
    
    // Refund initiation
    document.getElementById('refundBtn').addEventListener('click', () => {
        window.location.href = 'refund.html';
    });
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    // Payment form
    document.getElementById('paymentForm').addEventListener('submit', handlePayment);
    
    // OTP form
    document.getElementById('otpForm').addEventListener('submit', handleOTPVerification);
    
    // Admin login form
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    
    // Success modal continue button
    document.getElementById('continueBtn').addEventListener('click', () => {
        successModal.style.display = 'none';
        cartSidebar.classList.remove('open');
    });
    
    // OTP input navigation
    setupOTPInputs();
    
    // Card number formatting
    setupCardFormatting();
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Display products
function displayProducts(productsToShow = products) {
    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x300/f0f0f0/666?text=No+Image'">
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-footer">
                    <div class="product-price">₹${product.price}</div>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add to cart functionality
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    
    // Show feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.style.background = '#27ae60';
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '#ff6b6b';
    }, 1000);
}

// Update cart UI
function updateCartUI() {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        checkoutBtn.disabled = true;
        cartTotal.textContent = '0';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total;
    checkoutBtn.disabled = false;
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60x60/f0f0f0/666?text=No+Image'">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price}</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
        </div>
    `).join('');
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

// Search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}

// Filter by category
function filterProductsByCategory(category) {
    const filteredProducts = products.filter(product => product.category === category);
    displayProducts(filteredProducts);
}

// Open payment modal
function openPaymentModal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('paymentAmount').textContent = total;
    paymentModal.style.display = 'block';
}

// Handle payment form submission
function handlePayment(e) {
    e.preventDefault();
    
    const paymentData = {
        cardholderName: document.getElementById('cardholderName').value,
        cardNumber: document.getElementById('cardNumber').value,
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value,
        amount: parseFloat(document.getElementById('paymentAmount').textContent),
        timestamp: new Date().toISOString(),
        orderId: generateOrderId()
    };
    
    // Save payment data using shared system
    payments.push(paymentData);
    saveSharedData('payments', payments);
    
    // Close payment modal and open OTP modal
    paymentModal.style.display = 'none';
    otpModal.style.display = 'block';
    
    // Generate and save OTP
    generateOTP();
}

// Generate OTP
function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpData = {
        otp: otp,
        timestamp: new Date().toISOString(),
        status: 'pending',
        orderId: generateOrderId()
    };
    
    otps.push(otpData);
    saveSharedData('otps', otps);
    
    return otp;
}

// Handle OTP verification
function handleOTPVerification(e) {
    e.preventDefault();
    
    const otpInputs = document.querySelectorAll('.otp-input');
    const enteredOTP = Array.from(otpInputs).map(input => input.value).join('');
    
    if (enteredOTP.length !== 6) {
        alert('Please enter complete OTP');
        return;
    }
    
    // Find the latest pending OTP
    const latestOTP = otps.filter(otp => otp.status === 'pending').pop();
    
    if (latestOTP && latestOTP.otp === enteredOTP) {
        // Mark OTP as verified
        latestOTP.status = 'verified';
        localStorage.setItem('otps', JSON.stringify(otps));
        
        // Create order
        const order = {
            id: generateOrderId(),
            items: [...cart],
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            timestamp: new Date().toISOString(),
            status: 'confirmed',
            otp: enteredOTP
        };
        
        orders.push(order);
        saveSharedData('orders', orders);
        
        // Clear cart
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        
        // Show success modal
        document.getElementById('orderId').textContent = order.id;
        otpModal.style.display = 'none';
        successModal.style.display = 'block';
        
        // Clear OTP inputs
        otpInputs.forEach(input => input.value = '');
        
    } else {
        alert('Invalid OTP. Please try again.');
        otpInputs.forEach(input => {
            input.value = '';
            input.style.borderColor = '#ff6b6b';
        });
        setTimeout(() => {
            otpInputs.forEach(input => input.style.borderColor = '#eee');
        }, 2000);
    }
}

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Encoded admin credentials for security (Base64 encoded)
    const validCredentials = {
        username: atob('QWRtaW4='), // 'Admin' encoded
        password: atob('QWRtaW5AODgwMA==') // 'Admin@8800' encoded
    };
    
    if (username === validCredentials.username && password === validCredentials.password) {
        adminLoginModal.style.display = 'none';
        
        // Set admin session with obfuscation
        sessionStorage.setItem('adminLoggedIn', btoa('true'));
        sessionStorage.setItem('adminLoginTime', btoa(Date.now().toString()));
        
        window.location.href = 'admin.html';
    } else {
        // Generic error message - don't reveal credentials
        alert('Invalid credentials. Please contact system administrator for access.');
        
        // Clear form
        document.getElementById('adminUsername').value = '';
        document.getElementById('adminPassword').value = '';
    }
}

// Setup OTP inputs
function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
        
        // Only allow numbers
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    });
}

// Setup card formatting
function setupCardFormatting() {
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryInput = document.getElementById('expiryDate');
    const cvvInput = document.getElementById('cvv');
    
    // Format card number
    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
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

// Generate order ID
function generateOrderId() {
    return 'RM' + Date.now() + Math.floor(Math.random() * 1000);
}

// Resend OTP functionality
document.getElementById('resendOtp').addEventListener('click', (e) => {
    e.preventDefault();
    generateOTP();
    alert('New OTP generated!');
});