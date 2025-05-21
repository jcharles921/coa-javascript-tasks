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
  new Product(3, "Headphones", 50),
];


function tenPercentOff(total) {
  return total * 0.9;
}

function buyTwoGetOneFree(total, products) {
  if (products.length >= 3) {
    const cheapestProduct = [...products].sort((a, b) => a.price - b.price)[0];
    return total - cheapestProduct.price;
  }
  return total;
}

// Cart object
const Cart = {
  products: [],
  
  addProduct: function(product) {
    
    const existingProduct = this.products.find(p => p.id === product.id);
    
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      this.products.push({...product});
    }
    
    this.updateCartDisplay();
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
  },
  
  updateQuantity: function(productId, quantity) {
    const product = this.products.find(p => p.id === productId);
    
    if (product) {
      product.quantity = Math.max(1, quantity); // Ensure quantity is at least 1
      this.updateCartDisplay();
    }
  },
  
  getSubtotal: function() {
    return this.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  },
  
  getTotalItems: function() {
    return this.products.reduce((sum, product) => sum + product.quantity, 0);
  },
  
  getTotal: function() {
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
  
  getDiscountAmount: function() {
    return this.getSubtotal() - this.getTotal();
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
  
  updateCartDisplay: function() {
    const tableBody = document.querySelector('tbody');
    
    // Clear existing rows except the header
    while (tableBody.rows.length > 0) {
      tableBody.deleteRow(0);
    }
    
    if (this.products.length === 0) {
      const emptyRow = tableBody.insertRow();
      const cell = emptyRow.insertCell(0);
      cell.colSpan = 5;
      cell.textContent = "Your cart is empty";
      cell.className = "text-center py-4";
      return;
    }
    
    // Add product rows
    this.products.forEach(product => {
      const row = tableBody.insertRow();
      
      // ID cell
      const idCell = row.insertCell(0);
      idCell.textContent = product.id;
      
      // Name cell
      const nameCell = row.insertCell(1);
      nameCell.textContent = product.name;
      nameCell.className = "product-name";
      
      // Price cell
      const priceCell = row.insertCell(2);
      priceCell.textContent = `$${product.price}`;
      
      // Quantity cell
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
    // Add initial products
    products.forEach(product => this.addProduct(product));
    
    this.updateCartDisplay();
  }
};

// Initialize the cart when the page loads
document.addEventListener('DOMContentLoaded', function() {
  Cart.init();
});