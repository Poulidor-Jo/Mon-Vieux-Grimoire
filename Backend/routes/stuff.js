const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');

const auth = require('../middleware/auth');
const stuffCtrl = require('../controllers/stuff');

router.get('/',auth, stuffCtrl.getAllBooks);
router.get('/bestrating',auth, stuffCtrl.getBestRatings);
router.post('/',auth, multer.upload, multer.optimize, stuffCtrl.createBook);
router.get('/:id',auth, stuffCtrl.getOneBook);
router.put('/:id',auth, multer.upload, multer.optimize, stuffCtrl.modifyBook);
router.delete('/:id',auth, stuffCtrl.deleteBook);
router.post('/:id/rating',auth, stuffCtrl.ratingBook);

  module.exports = router;

