const dbModel = require('../models/dbModel');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nameToVideo } = require('../api/yt-encore');
const { song } = require('./adminController');
const nodeMailer = require('nodemailer');
const qr = require('qrcode');

async function mailSend(text) {
    const transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        post: 465,
        secure: true,
        // Gmail olsun!
        auth: {
            user: 'bhrcraft@gmail.com', // Burayi pixelmansanin mailiyle degistir
            pass: 'vckl itvn wpdx nsvo' // Burayi pixelmansanin app passworduyla degistir  
        }
    });
    const info = await transporter.sendMail({
        from: 'MelodyWay <melodyway.app@hotmail.com>',
        to: 'melodyway.app@hotmail.com',
        subject: 'İşletmeler İçin MelodyWay',
        html: text
    })

    console.log('Mesaj gonderildi' + info.messageId);
}

// Index Section
module.exports.index = async function (req, res) {
    let settings = await dbModel.settings.findOne({ settingID: 2 });
    res.render('index', { fetch: settings });
}

module.exports.indexPost = async function (req, res) {
    if (req.body.addMessage) {
        try {
            const newMessage = new dbModel.message({
                name: req.body.name,
                surname: req.body.surname,
                city: req.body.city,
                district: req.body.district,
                caffeName: req.body.caffeName,
                tableAmount: req.body.tableAmount,
                phone: req.body.phone,
                subject: req.body.subject,
                message: req.body.message,
            });
            await newMessage.save();
        } catch (error) {
            console.log(error);
        }
    }
    let text = `İşletme Sahibi Adı: ${req.body.name} İşletme Sahibi Soyadı: ${req.body.surname} İşletmenin Bulunduğu Şehir: ${req.body.city} İşletmenin Bulunduğu Mahalle: ${req.body.district} İşletme Adı: ${req.body.caffeName} İşletmedeki Masa Sayısı: ${req.body.tableAmount} İşletme Sahibi Telefon Numarası: ${req.body.phone} Konu: ${req.body.subject} Mesaj: ${req.body.message}`
    mailSend(text).catch(err => { console.log(err) })
    let settings = await dbModel.settings.findOne({ settingID: 2 });
    res.render('index', { fetch: settings });
}


module.exports.vote = function (req, res) {
    res.render('vote')
}

module.exports.votePost = function (req, res) {
    res.render('vote')
}

// Vote Information Section
module.exports.voteInfo = function (req, res) {
    res.render('voteInfo');
}

module.exports.voteInfoPost = function (req, res) {
    res.render('voteInfo');
}

// Login Section
const maxAge = 60 * 60
const createToken = function (id) {
    return jwt.sign({ id }, "!access^token*secret", {
        expiresIn: maxAge
    });
}

module.exports.login = async function (req, res) {
    if (req.body.userLogin) {
        const { email, password } = req.body;

        try {
            const user = await dbModel.user.login(email, password);
            const token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.json({ user })
        }
        catch (err) {
            res.status(400).json({ err });
        }
    }
    else {
        res.render('login', { layout: 'empty-layout' });
    }
}

module.exports.loginPost = async function (req, res) {
    const { email, password } = req.body;

    try {
        const user = await dbModel.user.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.json({ user })
    }
    catch (err) {
        res.status(400).json({ err });
    }
}

module.exports.qrLogin = async function (req, res) {
    let userInfos = await dbModel.user.find({ key: req.accessKey });
    console.log(userInfos, userInfos[0].email, userInfos[0].password);
    try {
        const user = await dbModel.user.login(userInfos[0].email, userInfos[0].password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.redirect('/vote');
    }
    catch (err) {
        res.redirect('/');
    }

}

module.exports.logout = function (req, res) {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}

module.exports.loginErr = function (req, res) {
    res.render('loginErr', { layout: 'empty-layout' });
}


module.exports.business = function (req, res) {
    res.render('business', { layout: 'empty-layout' });
}

module.exports.businessPost = async function (req, res) {
    try {
        const newMessage = new dbModel.message({
            name: req.body.name,
            surname: req.body.surname,
            city: req.body.city,
            district: req.body.district,
            caffeName: req.body.caffeName,
            tableAmount: req.body.tableAmount,
            phone: req.body.phone,
            subject: req.body.subject,
            message: req.body.message,
        });
        await newMessage.save();
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.render('business', { layout: 'empty-layout' });
    }
}