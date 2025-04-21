const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();


const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const rateLimit = require('express-rate-limit');


const app = express();

//rate limit prevents brute force attacks on all app
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false, 
})

//CORS

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  //res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

mongoose.connect(`mongodb+srv://jordanProject:${process.env.DB_PASSWORD}@cluster1.g8gke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`,
  { useNewUrlParser: true,
    useUnifiedTopology: true 
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use(express.json());

// Apply the rate limiting middleware to all API calls
app.use('/api/', limiter);

// routes urls
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;