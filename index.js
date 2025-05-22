// Product constructor
function Product(id, name, price) {
  this.id = id;
  this.name = name;
  this.price = price;
  this.quantity = 1; 
}

const products = [
  new Product(1, "JavaScript Book", 30),
  new Product(2, "T-Shirt", 20),
  new Product(3, "Headphones", 55),
  new Product(4, "Smartphone", 20),
  new Product(5, "shoes", 40),
  new Product(6, "Table", 25),
];

function tenPercentOff(total) {
  return total * 0.9;
}

function buyTwoGetOneFree(total, products) {
  if (products.length >= 3) {
    // Sort products by price (highest to lowest)
    const sortedProducts = [...products].sort((a, b) => b.price - a.price);
    
    let freeAmount = 0;
    
    // Process products in groups of 3
    for (let i = 0; i < sortedProducts.length; i += 3) {
      // Get the group of up to 3 products
      const group = sortedProducts.slice(i, i + 3);
      
      // If we have at least 3 products in this group, the cheapest one is free
      if (group.length >= 3) {
        // Find the cheapest in this group (last item since sorted high to low)
        const cheapest = group[group.length - 1];
        freeAmount += cheapest.price;
      }
    }
    
    return total - freeAmount;
  }
  return total;
}

// Tax calculation callback
function calculateTax(subtotal, taxRate = 0.08) {
  return subtotal * taxRate;
}

// Cart object
const Cart = {
  products: [],
  isCheckingOut: false,
  checkoutTimeout: null,
  
  addProduct: function(product) {
    const existingProduct = this.products.find(p => p.id === product.id);
    
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      this.products.push({...product});
    }
    
    this.updateCartDisplay();
    this.triggerAsyncCheckout();
  },
  
  removeProduct: function(productId) {
    const initialLength = this.products.length;
    this.products = this.products.filter(product => product.id !== productId);
    
    if (initialLength > this.products.length) {
      console.log(`Product with ID ${productId} removed from cart`);
    } else {
      console.log(`Product with ID ${productId} not found in cart`);
    }
    
    this.updateCartDisplay();
    this.triggerAsyncCheckout();
  },
  
  updateQuantity: function(productId, quantity) {
    const product = this.products.find(p => p.id === productId);
    
    if (product) {
      product.quantity = Math.max(1, quantity);
      this.updateCartDisplay();
      this.triggerAsyncCheckout();
    }
  },
  
  getSubtotal: function() {
    return this.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  },
  
  getTotalItems: function() {
    return this.products.reduce((sum, product) => sum + product.quantity, 0);
  },
  
  getDiscountedTotal: function() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    
    // Get totals with different discount options
    const expandedProducts = [];
    this.products.forEach(product => {
      for (let i = 0; i < product.quantity; i++) {
        expandedProducts.push({...product, quantity: 1});
      }
    });
    
    const tenPercentTotal = tenPercentOff(subtotal);
    const bTGOFTotal = buyTwoGetOneFree(subtotal, expandedProducts);
    
    // Choose the best discount for the customer
    if (tenPercentTotal <= bTGOFTotal) {
      this.currentDiscount = "tenPercent";
      return tenPercentTotal;
    } else {
      this.currentDiscount = "buyTwoGetOneFree";
      return bTGOFTotal;
    }
  },
  
  getTax: function() {
    return calculateTax(this.getDiscountedTotal());
  },
  
  getTotal: function() {
    return this.getDiscountedTotal() + this.getTax();
  },
  
  getDiscountAmount: function() {
    return this.getSubtotal() - this.getDiscountedTotal();
  },
  
  getDiscountPercentage: function() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    
    return Math.round((this.getDiscountAmount() / subtotal) * 100);
  },
  
  getDiscountName: function() {
    if (this.currentDiscount === "tenPercent") {
      return "10% Off";
    } else if (this.currentDiscount === "buyTwoGetOneFree") {
      return "Buy 2 Get 1 Free";
    }
    return "None";
  },
  
  triggerAsyncCheckout: function() {
    // Clear any existing timeout
    if (this.checkoutTimeout) {
      clearTimeout(this.checkoutTimeout);
    }
    
    // Only trigger if cart is not empty
    if (this.products.length === 0) {
      this.isCheckingOut = false;
      return;
    }
    
    this.isCheckingOut = true;
    console.log("Starting async checkout process...");
    
    // Show loading state
    this.showCheckoutStatus();
    
    // Simulate async checkout with 2 second delay
    this.checkoutTimeout = setTimeout(() => {
      this.isCheckingOut = false; 
      setTimeout(() => {
        this.hideCheckoutStatus();
      }, 500);
    }, 500);
  },
  
  showCheckoutStatus: function() {
    let statusRow = document.querySelector('.checkout-status-row');
    
    if (!statusRow) {
      const tableBody = document.querySelector('tbody');
      statusRow = tableBody.insertRow();
      statusRow.className = 'checkout-status-row';
    }
    
    // Clear existing cells
    statusRow.innerHTML = '';
    
    const statusCell = statusRow.insertCell(0);
    statusCell.colSpan = 5;
    statusCell.textContent = 'Processing...';
    statusCell.className = 'checkout-status';
    statusCell.style.textAlign = 'center';
    statusCell.style.fontStyle = 'italic';
    statusCell.style.color = '#f59e0b' 
    statusCell.style.padding = '10px';
    statusCell.style.backgroundColor = '#fef3c7' 
  },
  
  hideCheckoutStatus: function() {
    const statusRow = document.querySelector('.checkout-status-row');
    if (statusRow) {
      statusRow.remove();
    }
  },
  
  updateCartDisplay: function() {
    const tableBody = document.querySelector('tbody');

    const statusRow = document.querySelector('.checkout-status-row');
    while (tableBody.rows.length > 0) {
      if (tableBody.rows[0] === statusRow) {
        break;
      }
      tableBody.deleteRow(0);
    }
    
    // If status row exists, remove it temporarily
    if (statusRow) {
      statusRow.remove();
    }
    
    if (this.products.length === 0) {
      const emptyRow = tableBody.insertRow();
      const cell = emptyRow.insertCell(0);
      cell.colSpan = 5;
      cell.textContent = "Your cart is empty";
      cell.className = "text-center py-4";
      return;
    }

    this.products.forEach(product => {
      const row = tableBody.insertRow();
      
      // ID cell
      const idCell = row.insertCell(0);
      idCell.textContent = product.id;

      const nameCell = row.insertCell(1);
      nameCell.textContent = product.name;
      nameCell.className = "product-name";

      const priceCell = row.insertCell(2);
      priceCell.textContent = `$${product.price}`;

      const quantityCell = row.insertCell(3);
      const quantityWrapper = document.createElement('div');
      quantityWrapper.className = 'quantity-wrapper';
      
      const decreaseBtn = document.createElement('button');
      decreaseBtn.textContent = '-';
      decreaseBtn.className = 'quantity-btn';
      decreaseBtn.onclick = () => this.updateQuantity(product.id, product.quantity - 1);
      
      const quantityInput = document.createElement('input');
      quantityInput.type = 'number';
      quantityInput.min = '1';
      quantityInput.value = product.quantity;
      quantityInput.className = 'quantity-input';
      quantityInput.onchange = (e) => this.updateQuantity(product.id, parseInt(e.target.value) || 1);
      
      const increaseBtn = document.createElement('button');
      increaseBtn.textContent = '+';
      increaseBtn.className = 'quantity-btn';
      increaseBtn.onclick = () => this.updateQuantity(product.id, product.quantity + 1);
      
      quantityWrapper.appendChild(decreaseBtn);
      quantityWrapper.appendChild(quantityInput);
      quantityWrapper.appendChild(increaseBtn);
      quantityCell.appendChild(quantityWrapper);
      
      // Delete cell
      const actionCell = row.insertCell(4);
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'delete-btn';
      deleteBtn.onclick = () => this.removeProduct(product.id);
      actionCell.appendChild(deleteBtn);
    });
    
    // Add subtotal row
    const subtotalRow = tableBody.insertRow();
    subtotalRow.className = 'subtotal-row';
    
    const subtotalLabelCell = subtotalRow.insertCell(0);
    subtotalLabelCell.textContent = 'Subtotal:';
    subtotalLabelCell.colSpan = 4;
    subtotalLabelCell.align = 'right';
    
    const subtotalValueCell = subtotalRow.insertCell(1);
    subtotalValueCell.textContent = `$${this.getSubtotal().toFixed(2)}`;
    
    // Add discount row if applicable
    if (this.getDiscountAmount() > 0) {
      const discountRow = tableBody.insertRow();
      discountRow.className = 'discount-row';
      
      const discountLabelCell = discountRow.insertCell(0);
      discountLabelCell.textContent = `Discount (${this.getDiscountName()}):`;
      discountLabelCell.colSpan = 4;
      discountLabelCell.align = 'right';
      
      const discountValueCell = discountRow.insertCell(1);
      discountValueCell.textContent = `-$${this.getDiscountAmount().toFixed(2)} (${this.getDiscountPercentage()}%)`;
      discountValueCell.className = 'discount-value';
    }
    
    // Add tax row
    const taxRow = tableBody.insertRow();
    taxRow.className = 'tax-row';
    
    const taxLabelCell = taxRow.insertCell(0);
    taxLabelCell.textContent = 'Tax (8%):';
    taxLabelCell.colSpan = 4;
    taxLabelCell.align = 'right';
    
    const taxValueCell = taxRow.insertCell(1);
    taxValueCell.textContent = `$${this.getTax().toFixed(2)}`;
    
    // Add total row
    const totalRow = tableBody.insertRow();
    totalRow.className = 'total-row';
    
    const totalLabelCell = totalRow.insertCell(0);
    totalLabelCell.textContent = 'Total:';
    totalLabelCell.colSpan = 4;
    totalLabelCell.align = 'right';
    
    const totalValueCell = totalRow.insertCell(1);
    totalValueCell.textContent = `$${this.getTotal().toFixed(2)}`;
  },
  
  init: function() {
    // Add products in the cart
    products.forEach(product => this.addProduct(product));
    
    this.updateCartDisplay();
    this.triggerAsyncCheckout();
  }
};

document.addEventListener('DOMContentLoaded', function() {
  Cart.init();
});