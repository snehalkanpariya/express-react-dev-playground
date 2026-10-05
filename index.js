const express = require('express');
const app = express();
const dotenv = require('dotenv');
const port = 3000;

dotenv.config();
const connectDB = require('./config/db');
const productRoutes = require('./routes/ProductRoutes');

connectDB();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.use('/api/products', productRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);

  
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format'
    });
  }
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});