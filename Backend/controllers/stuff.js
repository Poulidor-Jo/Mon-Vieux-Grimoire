// Importation du modèle Book et du module fs pour gérer les fichiers
const Book = require('../models/books');
const fs = require('fs');


// Création d'un nouveau livre
exports.createBook = (req, res, next) => {
    // Conversion de la chaîne JSON en objet
    const bookObject = JSON.parse(req.body.book);
    // Création d'une instance de Book avec les données reçues
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId, // Ajout de l'ID utilisateur
        ratings: [], // Initialisation des évaluations
        averageRating: 0, // Note moyenne initialisée à 0
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // URL de l'image
    });
    // Sauvegarde du livre dans la base de données
    book.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !'}) })
        .catch(error => { res.status(400).json({ error }) });
};

// Modification d'un livre existant
exports.modifyBook = (req, res, next) => {
    // Vérification de la présence d'une nouvelle image
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book), // Conversion des données JSON
        imageUrl: `${req.protocol}://${req.get('host')}/images/opt_${req.file.filename}` // Nouvelle URL de l'image
    } : { ...req.body }; // Sinon, utilisation des données existantes

    // Recherche du livre par son ID
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            // Vérification de l'utilisateur
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: '401: requête non autorisée' });
            } else {
                // Mise à jour du livre avec les nouvelles données
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => {
                        res.status(200).json({ message: 'Livre mis à jour avec succès' });
                        // Suppression de l'ancienne image si une nouvelle est fournie
                        const oldFile = book.imageUrl.split('/images')[1];
                        req.file && fs.unlink(`images/${oldFile}`, (err => {
                            if (err) console.log(err);
                        }));
                    })
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch(error => res.status(400).json({ error }));
};

// Suppression d'un livre
exports.deleteBook = (req, res, next) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }
            if (book.userId !== req.auth.userId) {
                return res.status(403).json({ message: 'Forbidden: You are not allowed to delete this book' });
            }

            Book.deleteOne({ _id: req.params.id })
                .then(() => {
                    const filename = book.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, (err) => {
                        if (err) console.error('Error deleting image:', err);
                    });
                    res.status(200).json({ message: 'Book deleted successfully' });
                })
                .catch((error) => res.status(500).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
};

// Récupération d'un livre par son ID
exports.getOneBook = (req, res, next) => {
    console.log(`Fetching book with ID: ${req.params.id}`); // Log the ID being fetched
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) {
                console.error(`Book with ID ${req.params.id} not found.`); // Log if book is not found
                return res.status(404).json({ message: 'Book not found' });
            }
            console.log(`Book found: ${JSON.stringify(book)}`); // Log the book details
            res.status(200).json(book);
        })
        .catch(error => {
            console.error(`Error fetching book with ID ${req.params.id}:`, error); // Log any errors
            res.status(500).json({ error });
        });
};

// Récupération de tous les livres
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => res.status(200).json(books)) // Envoi de tous les livres
        .catch(error => res.status(400).json({ error })); // Erreur en cas d'échec
};

// Ajout d'une évaluation à un livre
exports.ratingBook = (req, res, next) => {
    const updatedRating = {
        userId: req.auth.userId, // ID de l'utilisateur
        grade: req.auth.rating // Note donnée
    };

    // Vérification de la validité de la note
    if (updatedRating.grade < 0 || updatedRating.grade > 5) {
        return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' });
    }

    // Recherche du livre par son ID
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            // Vérification si l'utilisateur a déjà noté
            if (book.ratings.find(r => r.userId === req.auth.userId)) {
                return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
            } else {
                // Ajout de la nouvelle note
                book.ratings.push(updatedRating);
                // Calcul de la nouvelle note moyenne
                book.averageRating = (book.averageRating * (book.ratings.length - 1) + updatedRating.grade) / book.ratings.length;
                return book.save();
            }
        })
        .then((updatedBook) => res.status(201).json(updatedBook)) // Envoi du livre mis à jour
        .catch(error => res.status(400).json({ error })); // Erreur en cas d'échec
};

// Récupération des 3 livres les mieux notés
exports.getBestRatings = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 }) // Tri par note moyenne décroissante
        .limit(3) // Limitation à 3 livres
        .then((bestBooks) => res.status(200).json(bestBooks)) // Envoi des 3 meilleurs livres
        .catch(error => res.status(400).json({ error })); // Erreur en cas d'échec
};