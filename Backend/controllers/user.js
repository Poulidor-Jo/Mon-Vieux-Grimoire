const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');

exports.signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'email non valide' });
        }

        if (password.length < 5) {
            return res.status(400).json({ message: 'Le mot de passe doit avoir au minimum 5 caractères' });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hash });
        await user.save();
        res.status(201).json({ message: 'utilisateur créé' });
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Les informations de connection sont incorrectes.' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Les informations de connection sont incorrectes.' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.SECRET_TOKEN,
            { expiresIn: '24h' }
        );

        res.status(200).json({ userId: user._id, token });
    } catch (error) {
        res.status(500).json({ error });
    }
};