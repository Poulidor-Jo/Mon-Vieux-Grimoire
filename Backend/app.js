const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

//CORS

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  //res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.g8gke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

// Apply the rate limiting middleware to all API calls
app.use('/api/', rateLimiter);

// routes urls
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;