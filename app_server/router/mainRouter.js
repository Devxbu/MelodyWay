const express = require('express');
var router = express.Router();
const controller = require('../controller/mainController');
const { requireAuth, checkUser } = require('../middleware/authenticate');
const userLogin = require('../middleware/userLogin');

// Selecting All Requests
router.get('*', checkUser);
router.post('*', checkUser);

// Index Section
router.get('/', controller.index);
router.post('/', controller.indexPost);

// Voting Section
router.get('/vote', requireAuth, controller.vote);
router.post('/vote', requireAuth, controller.votePost)

// Vote Info Section
router.get('/voteInfo', requireAuth, controller.voteInfo);
router.post('/voteInfo', requireAuth, controller.voteInfoPost);

// Login Section
router.get('/login', controller.login);
router.post('/login', controller.loginPost);
router.get('/logout', controller.logout);

router.get('/loginErr', controller.loginErr);

router.get('/business', controller.business);
router.post('/business', controller.businessPost);

router.get('/qrLogin/:id', userLogin, controller.qrLogin);

module.exports = router;