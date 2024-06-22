const jwt = require('jsonwebtoken');
const dbModel = require('../models/dbModel');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    // Check json web token exist & is verified
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            } else {
                console.log(decodedToken);
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
}

// Check current user
const checkUser = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            } else {
                console.log(decodedToken);
                var user = await dbModel.user.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}

const requireAuthAdmin = (req, res, next) => {
    const token = req.cookies.jwtAdmin;
    // Check json web token exist & is verified
    if (token) {
        jwt.verify(token, "!access^token*secret", (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/admin/login');
            } else {
                console.log(decodedToken);
                next();
            }
        });
    } else {
        res.redirect('/admin/login');
    }
}

// Check current admin
const checkAdmin = async (req, res, next) => {
    const token = req.cookies.jwtAdmin;
    // Check json web token exist & is verified
    if (token) {
        jwt.verify(token, "!access^token*secret", async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.admin = null;
                next();
            } else {
                console.log(decodedToken);
                var admin = await dbModel.admin.findById(decodedToken.id);
                res.locals.admin = admin;
                next();
            }
        });
    } else {
        res.locals.admin = null;
        next();
    }
}

module.exports = { requireAuth, checkUser, requireAuthAdmin, checkAdmin };
