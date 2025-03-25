const express = require('express');

const app = express();

app.use((req, res, next) => {
    console.log('Requete recue !');
    next();
});

app.use((req, res, next) => {
    res.status(201);
    next();
});

app.use((req, res, next) => {
    res.json({ message: 'Requete a bien ete recu !' });
    next();
});

app.use((req, res) => {
    console.log('Reponse envoyee avec succes !');
});

module.exports = app;