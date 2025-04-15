const multer = require('multer');
const sharp = require('sharp');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de téléchargement du fichier'});
    }

    if (!req.file) {
      return next();
    }

    const { buffer, originalname } = req.file;
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const ref = `${timestamp}-${originalname}.webp`;
    const path = "./images/" + ref;

    sharp(buffer)
      .webp({ quality: 20 })
      .toFile(path)
      .then(() => {
        req.file.filename = ref;
        next();
      })
      .catch(() => res.status(500).json({ error: 'Erreur dans le processus de traitement de l\'image'}));
  });
};