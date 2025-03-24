const express = require('express');

const app = express();

app.use((req, res, next) => {
    console.log('Requete recue !');
    next();
});

app.use((req, res, next) => {
    res.json({ message: 'Requete a bien ete recu !' });
});

module.exports = app;