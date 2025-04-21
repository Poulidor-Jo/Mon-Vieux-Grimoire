const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');
const BooksController = require('../controllers/books');

router.get('/', BooksController.getAllBooks);
router.get('/bestrating', auth, BooksController.getBestRatings);
router.post('/', auth, multer, BooksController.createBook);
router.get('/:id', auth, BooksController.getOneBook);
router.put('/:id', auth, multer, BooksController.modifyBook);
router.delete('/:id', auth, BooksController.deleteBook);
router.post('/:id/rating', auth, BooksController.ratingBook);

module.exports = router;

