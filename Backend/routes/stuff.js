const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');
const StuffController = require('../controllers/stuff');

router.get('/', StuffController.getAllBooks);
router.get('/bestrating', auth, StuffController.getBestRatings);
router.post('/', auth, multer, StuffController.createBook);
router.get('/:id', auth, StuffController.getOneBook);
router.put('/:id', auth, multer, StuffController.modifyBook);
router.delete('/:id', auth, StuffController.deleteBook);
router.post('/:id/rating', auth, StuffController.ratingBook);

module.exports = router;

