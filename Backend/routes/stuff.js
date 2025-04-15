const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');

const auth = require('../middleware/auth');
const stuffCtrl = require('../controllers/stuff');

router.get('/', stuffCtrl.getAllBooks);
router.get('/bestrating',auth, stuffCtrl.getBestRatings);
router.post('/',auth, multer, stuffCtrl.createBook);
router.get('/:id',auth, stuffCtrl.getOneBook);
router.put('/:id',auth, multer,stuffCtrl.modifyBook);
router.delete('/:id',auth, stuffCtrl.deleteBook);
router.post('/:id/rating',auth, stuffCtrl.ratingBook);

  module.exports = router;

