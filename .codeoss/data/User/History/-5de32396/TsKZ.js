const express = require('express');
const router = express.Router();
const controller = require('../controller/adminController');
const { requireAuthAdmin, checkAdmin } = require('../middleware/authenticate');
const table = require('../middleware/table');
const cafe = require('../middleware/cafe');

// Selecting All Requests
router.get('*', checkAdmin);
router.post('*', checkAdmin);

// Index Section
router.get('/', requireAuthAdmin, controller.index);
router.post('/', requireAuthAdmin, controller.indexPost);

// Admin Section
router.get('/addAdmin', requireAuthAdmin, controller.addAdmin);
router.get('/admin', requireAuthAdmin, controller.admin);
router.post('/admin', requireAuthAdmin, controller.adminPost);

// User Section
router.get('/addUser', requireAuthAdmin, controller.addUser);
router.get('/user/:id', requireAuthAdmin, cafe, controller.user);
router.post('/user/:id', requireAuthAdmin, cafe, controller.userPost);

//Song - Playlist Section 
router.get('/addPlaylist/:cafe', requireAuthAdmin, cafe, controller.addPlaylist);
router.get('/playlist/:cafe', requireAuthAdmin, cafe, controller.playlist);
router.post('/playlist/:cafe', requireAuthAdmin, cafe, controller.allSongsPost);
router.get('/song/:cafe', requireAuthAdmin, cafe, controller.song);
router.post('/song/:cafe', requireAuthAdmin, cafe, controller.songPost);
router.get('/order/:cafe', requireAuthAdmin, cafe, controller.songOrder);

// Contact Section
router.get('/contact', requireAuthAdmin, controller.contact);
router.post('/contact', requireAuthAdmin, controller.contactPost);

// Social Section
router.get('/social', requireAuthAdmin, controller.social);
router.post('/social', requireAuthAdmin, controller.socialPost);

// Encores Section
router.get('/encores/:cafe', requireAuthAdmin, cafe, controller.encores);
router.post('/encores/:cafe', requireAuthAdmin, cafe, controller.encorePost);

// Messages Section
router.get('/messages', requireAuthAdmin, controller.messages);

// Table Section
router.get('/table/:cafe', requireAuthAdmin, cafe, controller.table);
router.post('/table/:cafe/:id', requireAuthAdmin, cafe, table, controller.tablePost);

router.get('/login', controller.login);
router.get('/logout', controller.logout);
router.post('/login', controller.loginPost);

router.get('/cafes', controller.cafes);
router.post('/cafes', controller.cafesPost);

router.get('/addCafe', requireAuthAdmin, controller.addCafe);
router.post('/addCafe', requireAuthAdmin, controller.addCafePost);

module.exports = router;