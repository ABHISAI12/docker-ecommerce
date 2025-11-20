const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const dbUrl = process.env.DB_URL;
let Product; 

const connectToDb = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');
    const productSchema = new mongoose.Schema({ name: String, price: Number });
    Product = mongoose.model('Product', productSchema);
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('No products found, adding initial data...');
      await Product.insertMany([
        { name: 'Laptop', price: 1200 },
        { name: 'Mouse', price: 45 },
      ]);
    }
  } catch (err) {
    console.error('Failed to connect to DB, retrying in 5 seconds...', err.message);
    setTimeout(connectToDb, 5000);
  }
};
connectToDb();
// --------------------------

// --- API Routes ---

// GET (Read) all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST (Create) a new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // Save to Database
    const newProduct = new Product({ name, price: Number(price) });
    await newProduct.save();
    console.log('New product saved to DB:', newProduct);

    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- NEW: DELETE Route ---
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('Deleted product:', deletedProduct);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// -------------------------

app.listen(port, () => {
  console.log(`Backend API listening at http://localhost:${port}`);
});