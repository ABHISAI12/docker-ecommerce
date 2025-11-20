document.addEventListener('DOMContentLoaded', () => {
  const addForm = document.getElementById('add-product-form');
  const productNameInput = document.getElementById('product-name');
  const productPriceInput = document.getElementById('product-price');

  // --- 1. Form Submission ---
  addForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Stop the form from reloading the page
    const name = productNameInput.value;
    const price = productPriceInput.value;

    if (!name || !price) {
      alert('Please enter both name and price');
      return;
    }

    try {
      // Send the POST request to the backend
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, price }),
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      // Clear the form and refresh the list
      productNameInput.value = '';
      productPriceInput.value = '';
      fetchProducts(); 
    } catch (error) {
      console.error('Error adding product:', error);
      displayError('Failed to add product');
    }
  });

  // --- 2. Fetch Products ---
  async function fetchProducts() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const products = await response.json();
      displayProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      displayError('Error loading products. Is the backend running?');
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error(response.statusText);
      const products = await response.json();
      displayProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      displayError('Error loading products.');
    }
  }

  // --- UPDATED: Render List with Delete Buttons ---
  function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; 

    if (products.length === 0) {
      productList.innerHTML = '<li>No products found.</li>';
      return;
    }

    products.forEach(product => {
      const li = document.createElement('li');
      li.className = 'product-item';
      
      // We store the ID in a data attribute or pass it to the handler
      li.innerHTML = `
        <div class="product-info">
            <span class="product-name">${product.name}</span>
            <span class="product-price">$${product.price}</span>
        </div>
        <button class="delete-btn" data-id="${product._id}">Delete</button>
      `;
      
      productList.appendChild(li);
    });

    // Add event listeners to all new delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            deleteProduct(id);
        });
    });
  }

  // --- NEW: Delete Function ---
  async function deleteProduct(id) {
      if(!confirm('Are you sure you want to delete this product?')) return;

      try {
          const response = await fetch(`/api/products/${id}`, {
              method: 'DELETE',
          });

          if (!response.ok) {
              throw new Error('Failed to delete');
          }

          // Refresh the list to show the item is gone
          fetchProducts();
      } catch (error) {
          console.error('Error deleting:', error);
          alert('Could not delete product');
      }
  }

  function displayError(message) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = `<li class="error">${message}</li>`;
  }

  fetchProducts(); 
});