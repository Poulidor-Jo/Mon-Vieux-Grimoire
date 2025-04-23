const Book = require('../models/Books');
const fs = require('fs');

// Créer un nouveau livre
exports.createBook = async (req, res, next) => {
    try {
        const bookObject = JSON.parse(req.body.book);
        const initialRating = bookObject.ratings && bookObject.ratings[0] ? bookObject.ratings[0].grade : 0;

        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            ratings: bookObject.ratings || [{ userId: req.auth.userId, grade: initialRating }],
            averageRating: initialRating,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });

        await book.save();
        res.status(201).json({ message: 'Object saved!' });
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Modifier un livre existant
exports.modifyBook = async (req, res, next) => {
    try {
        const bookObject = req.file ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/opt_${req.file.filename}`
        } : { ...req.body };

        const book = await Book.findOne({ _id: req.params.id });
        if (book.userId != req.auth.userId) {
            return res.status(401).json({ message: '401: Unauthorized request' });
        }

        await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });

        if (req.file) {
            const oldFile = book.imageUrl.split('/images')[1];
            fs.unlink(`images/${oldFile}`, (err) => {
                if (err) console.log(err);
            });
        }

        res.status(200).json({ message: 'Book successfully updated' });
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Supprimer un livre
exports.deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        if (book.userId !== req.auth.userId) {
            return res.status(403).json({ message: 'Forbidden: You are not allowed to delete this book' });
        }

        await Book.deleteOne({ _id: req.params.id });
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, (err) => {
            if (err) console.error('Error deleting image:', err);
        });

        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Récupérer un livre par son ID
exports.getOneBook = async (req, res, next) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error });
    }
};

// Récupérer tous les livres
exports.getAllBooks = async (req, res, next) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Ajouter une évaluation à un livre
exports.ratingBook = async (req, res, next) => {
    try {
        const updatedRating = {
            userId: req.auth.userId,
            grade: req.body.rating
        };

        if (updatedRating.grade < 0 || updatedRating.grade > 5) {
            return res.status(400).json({ message: 'The rating must be between 0 and 5' });
        }

        const book = await Book.findOne({ _id: req.params.id });
        if (book.ratings.find(r => r.userId === req.auth.userId)) {
            return res.status(400).json({ message: 'You have already rated this book' });
        }

        book.ratings.push(updatedRating);
        book.averageRating = (book.averageRating * (book.ratings.length - 1) + updatedRating.grade) / book.ratings.length;
        const updatedBook = await book.save();

        res.status(201).json(updatedBook);
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Récupérer les 3 livres les mieux notés
exports.getBestRatings = async (req, res, next) => {
    try {
        const bestBooks = await Book.find().sort({ averageRating: -1 }).limit(3);
        res.status(200).json(bestBooks);
    } catch (error) {
        res.status(400).json({ error });
    }
};