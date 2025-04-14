const Book = require('../models/books');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        ratings: [],
        averageRating: 0,
        //get the image url from the request
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });
        book.save()
          .then(() => { res.status(201).json({ message: 'Objet enregistré !'})})
          .catch(error => { res.status(400).json({ error })});
};

exports.modifyBook = (req, res, next) => {
    //is there a new picture ?
    const bookObject = req.file ? {
      //process image if there is one
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/opt_${req.file.filename}`
  } : { ...req.body }; //if not, simply get the data
  Book.findOne({ _id: req.params.id })
      .then((book) => {
          //check user
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message: '401: unauthorized request' });
          } else {
              //update book corresponding to params id, with the data collected in bookObject
              Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                  .then(() => {
                      res.status(200).json({ message: 'book successfully updated' });
                      //delete old file
                      const oldFile = book.imageUrl.split('/images')[1];
                      req.file && fs.unlink(`images/${oldFile}`, (err => {
                          if (err) console.log(err);
                      }))
                  })
                  .catch(error => res.status(401).json({ error }));
          }
      })
      .catch(error => res.status(400).json({ error }));

};

    

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
  .then((book) => {
      //check if user is the owner of the book
      if (book.userId != req.auth.userId) {
          res.status(403).json({ message: '403: unauthorized request' });
      } else {
          Book.deleteOne({ _id: req.params.id })
              .then(() => {
                  res.status(200).json({ message: 'Deleted!' });
                  //get file name after path
                  const filename = book.imageUrl.split('/images/')[1];
                  //unlink from fs package delete the file then execute callback to delete the book in database
                  fs.unlink(`images/${filename}`, (err => {
                      if (err) console.log(err);
                  }))
              })
              .catch(error => res.status(401).json({ error }));
      }
  })
  .catch(error => res.status(500).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
  .then((book) => res.status(200).json(book))
  .catch(error => res.status(404).json({ error }));
};


exports.getAllBooks = (req, res, next) => {
    Book.find()
      .then((books) => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
};

exports.ratingBook = (req, res, next) => { 
  const updatedRating = {
    userId: req.auth.userId,
    grade: req.auth.rating
  };
  
  if (updatedRating.grade < 0 || updatedRating.grade > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' });
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.ratings.find(r => r.userId === req.auth.userId)) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
      } else { 
        //push new rating to array
        book.ratings.push(updatedRating);
        //calculate average rating
        book.averageRating = (book.averageRating * (book.ratings.length - 1) + updatedRating.grade) / book.ratings.length;
        return book.save();
      }
    })
    .then((updatedBook) => res.status(201).json(updatedBook))
    .catch(error =>  res.status(400).json({ error }));
}

// get best 3 best rated books 
exports.getBestRatings = (req, res, next) => {
  Book.find()
      //sort by descending order
      .sort({ averageRating: -1 })
      //keep the first 3 books (best)
      .limit(3)
      //return array of 3 best rated books
      .then((bestBooks) => res.status(200).json(bestBooks))
      .catch(error => res.status(400).json({ error }));
}