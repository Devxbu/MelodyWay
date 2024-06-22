const path = require('path');
const dbModel = require('../models/dbModel');
const plApi = require('../api/yt-playlist');
const { ObjectId } = require('mongodb');
const { set } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const date = new Date();
const { checkAdmin, requireAuthAdmin } = require('../middleware/authenticate');
const { get } = require('http');
const cafe = require('../middleware/cafe');
const qrCode = require('qrcode');
var voteTime;

function replaceTurkishCharacters(text) {
    const turkishChars = {
        'ğ': 'g', 'Ğ': 'G',
        'ü': 'u', 'Ü': 'U',
        'ş': 's', 'Ş': 'S',
        'ı': 'i', 'İ': 'I',
        'ö': 'o', 'Ö': 'O',
        'ç': 'c', 'Ç': 'C',
        ' ': '_'
    };

    return text.replace(/[ğüşıöçĞÜŞİÖÇ ]/g, function (match) {
        return turkishChars[match];
    });
}

function generateStrongPassword(length = 12) {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*_-+=';

    const allChars = lowercaseChars + uppercaseChars + numbers + symbols;

    let password = '';

    // Ensure inclusion of at least one character from each category
    password += getRandomChar(lowercaseChars);
    password += getRandomChar(uppercaseChars);
    password += getRandomChar(numbers);
    password += getRandomChar(symbols);

    // Generate the rest of the password
    for (let i = 0; i < length - 4; i++) {
        password += getRandomChar(allChars);
    }

    // Shuffle the password characters
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    return password;
}

function getRandomChar(characters) {
    return characters[Math.floor(Math.random() * characters.length)];
}

// SETTINGS SECTION
const renderIndexPage = async (res, status, fetch) => {
    try {
        let cafe = await dbModel.place.find({});
        const settings = await dbModel.settings.findOne({ settingID: 2 });
        res.render('admin/index', { layout: 'admin/layout', status, fetch: settings, cafe });
    }
    catch {
        res.render('admin/index', { layout: 'admin/layout', status, fetch: [{ title: "Error!", description: "Error!", keywords: "Error!" }], cafe: ["Error!"] });
    }
}

module.exports.index = function (req, res) {
    renderIndexPage(res);
};

function extractPlaylistIdFromUrl(url) {
    // YouTube playlist URL'sinin düzenli ifadesi
    const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:playlist\?|watch\?.*?&)?list=([a-zA-Z0-9_-]+)/;
    // URL'yi düzenli ifadeyle eşleştir ve playlist ID'sini al
    const match = url.match(regex);
    if (match) {
        return match[1]; // İlk eşleşen grup playlist ID'sini içerir
    } else {
        return null; // Eşleşme bulunamazsa null döndür
    }
}


module.exports.indexPost = async function (req, res) {
    try {
        if (req.body.tempCafe != 'Null') {
            await dbModel.admin.findByIdAndUpdate(req.body.adminId, { tempCafe: req.body.tempCafe });
        }
        var updateData = {
            title: req.body.title,
            description: req.body.description,
            keywords: req.body.keywords
        };
        var settingsID = req.body.id;

        await dbModel.settings.findByIdAndUpdate(settingsID, { $set: updateData });
        renderIndexPage(res, true);
    } catch (error) {
        console.log(error);
        renderIndexPage(res, false);
    }
}

const renderContactPage = async (res, status, fetch) => {
    try {
        const settings = await dbModel.settings.findOne({ settingID: 2 });
        res.render('admin/contact', { layout: 'admin/layout', status, fetch: settings });
    }
    catch {
        res.render('admin/contact', { layout: 'admin/layout', status, fetch: [{ phone: "Error!", email: "Error!", adress: "Error!" }] });
    }
}

module.exports.contact = function (req, res) {
    renderContactPage(res);
};

module.exports.contactPost = async function (req, res) {
    try {
        var updateData = {
            phone: req.body.phone,
            adress: req.body.adress,
            email: req.body.email
        };
        var settingsID = req.body.id;

        await dbModel.settings.findByIdAndUpdate(settingsID, { $set: updateData });
        renderContactPage(res, true);
    } catch (error) {
        renderContactPage(res, false);
    }
}

const renderSocialPage = async (res, status, fetch) => {
    try {
        const settings = await dbModel.settings.findOne({ settingID: 2 });
        res.render('admin/social', { layout: 'admin/layout', status, fetch: settings });
    }
    catch {
        res.render('admin/social', { layout: 'admin/layout', status, fetch: [{ instagram: "Error!", youtube: "Error!", twitter: "Error!", facebook: "Error!" }] });
    }
}

module.exports.social = function (req, res) {
    renderSocialPage(res)
};

module.exports.socialPost = async function (req, res) {
    try {
        var updateData = {
            instagram: req.body.instagram,
            youtube: req.body.youtube,
            twitter: req.body.twitter,
            facebook: req.body.facebook
        };
        var settingsID = req.body.id;

        await dbModel.settings.findByIdAndUpdate(settingsID, { $set: updateData });
        renderSocialPage(res, true);
    } catch (error) {
        renderSocialPage(res, false);
    }
}


// USER SECTION
async function generateQRCode(text) {
    try {
        // QR kodunu oluştur
        const qrDataURL = await qrCode.toDataURL("https://melodyway.app/qrLogin/" + text);
        return qrDataURL;
    } catch (error) {
        console.error('QR kodu oluşturulamadı:', error);
        return null;
    }
}

module.exports.user = function (req, res, next) {
    renderUserPage(req, res, null, next);
};

module.exports.addUser = async function (req, res) {
    let cafe = await dbModel.place.find({});
    res.render('admin/addUser', { layout: 'admin/layout', fetch: cafe });
};

const renderUserPage = async (req, res, status, next) => {
    try {
        let result = [];
        if (req.cafe == 'admin') {
            console.log('admin');
            result = await dbModel.user.find({});
        }
        else {
            console.log(req);
            result = await dbModel.user.find({ cafe: req.cafe });
        }
        let accesKeyQrs = [];
        for (let i = 0; i < result.length; i++) {
            console.log(result[i].key);
            let qr = await generateQRCode(result[i].key);
            accesKeyQrs.push(qr);
        }
        res.render('admin/user', { layout: 'admin/layout', status, fetch: result, qr: accesKeyQrs });
    } catch (error) {
        res.render('admin/user', { layout: 'admin/layout', status, fetch: [{ name: "Error!", email: "Error!" }] });
    }
    next();
};

module.exports.userPost = async function (req, res, next) {
    if (req.body.addUser) {
        let allUsers = await dbModel.user.find({ cafe: req.body.cafe });
        let settings = await dbModel.place.find({ cafe: req.body.cafe });
        console.log(settings);
        if (allUsers.length < settings[0].amount) {
            try {
                let email = replaceTurkishCharacters(req.body.name) + "@melodyway.app"
                const existingUser = await dbModel.user.findOne({ email });
                if (existingUser) {
                    renderUserPage(req, res, 'EmailUsing', next);
                } else {
                    const salt = await bcrypt.genSalt();
                    const hashedPass = await bcrypt.hash(generateStrongPassword(18), salt);

                    const combinedData = req.body.name + '_' + hashedPass;
                    const accessKey = (await bcrypt.hash(combinedData, salt)).replaceAll('/', '');

                    const newUser = new dbModel.user({
                        name: req.body.name,
                        email,
                        auth: req.body.auth,
                        key: accessKey,
                        password: hashedPass,
                        isVoted: false,
                        isEncored: false,
                        encoreTime: 0,
                        encoredTime: 0,
                        cafe: req.body.cafe,
                        amount: req.body.amount
                    });

                    await newUser.save();
                    renderUserPage(req, res, true, next);
                }
            } catch (error) {
                console.log(error);
                renderUserPage(req, res, false, next);
            }
        }
        else {
            renderUserPage(req, res, 'TableFull', next);
        }
    }
    if (req.body.deleteUser) {
        const userID = req.body.id;
        try {
            await dbModel.user.findByIdAndDelete(userID);
            renderUserPage(req, res, true, next);
        } catch (error) {
            renderUserPage(req, res, false, next);
        }
    }
};

// ADMIN SECTION

module.exports.addAdmin = async function (req, res) {
    let cafe = await dbModel.place.find({});
    res.render('admin/addAdmin', { layout: 'admin/layout', fetch: cafe });
};

const renderAdminPage = async (res, status, fetch) => {
    try {
        const result = await dbModel.admin.find({});
        res.render('admin/admin', { layout: 'admin/layout', status, fetch: result });
    } catch (error) {
        res.render('admin/admin', { layout: 'admin/layout', status, fetch: [{ name: "Error!", surname: "Error!", email: "Error!" }] });
    }
};

module.exports.admin = function (req, res) {
    renderAdminPage(res);
};

module.exports.adminPost = async function (req, res) {
    if (req.body.adminAdd) {
        try {
            const admin = await dbModel.admin.findOne({ email: req.body.email });
            if (admin) {
                renderAdminPage(res, 'EmailUsing');
            }
            else {
                const salt = await bcrypt.genSalt();
                const hashedPass = await bcrypt.hash(req.body.password, salt);
                let cafe = await dbModel.place.findOne({ cafe: req.body.cafe })
                const newAdmin = new dbModel.admin({
                    name: req.body.name,
                    surname: req.body.surname,
                    email: req.body.email,
                    password: hashedPass,
                    cafe: req.body.cafe,
                    autoPlay: cafe.autoPlay
                });

                await newAdmin.save();
                renderAdminPage(res, true);
            }
        } catch (error) {
            renderAdminPage(res, false);
        }
    }

    if (req.body.deleteAdmin) {
        const adminID = req.body.id;
        try {
            await dbModel.admin.findByIdAndDelete(adminID);
            renderAdminPage(res, true);
        } catch (error) {
            renderAdminPage(res, false);
        }
    }
};

// SONG SECTION

module.exports.addPlaylist = function (req, res) {
    res.render('admin/addPlaylist', { layout: 'admin/layout' });
};

module.exports.playlistPost = async function (req, res) {
    const playlistID = req.body.id;
    try {
        await dbModel.playlist.findByIdAndDelete(playlistID);
        renderPLPage(res, true);
    } catch (error) {
        renderPLPage(res, false);
    }
};


const renderPLPage = async (res, req, status, next) => {
    try {
        const result = await dbModel.playlist.find({ cafe: req.cafe });
        res.render('admin/playlist', { layout: 'admin/layout', status, fetch: result });
    } catch (error) {
        res.render('admin/playlist', { layout: 'admin/layout', status, fetch: [{ songName: "Error!", thumbnail: "Error!", singer: "Error!", vote: 'Error!' }] });
    }
    next();
};

module.exports.allSongsPost = async function (req, res, next) {
    if (req.body.playlistAdd) {
        try {
            const newPlaylist = new dbModel.playlist({
                link: req.body.link,
                playlistName: await plApi.plTitle(req.body.link),
                songs: await plApi.plInfos(req.body.link, req.cafe),
                cafe: req.cafe
            });
            await newPlaylist.save();
            renderPLPage(res, req, true, next);
        } catch (error) {
            renderPLPage(res, req, false, next);
        }
    }

    if (req.body.deletePlaylist) {
        try {
            console.log(req.body);
            await dbModel.playlist.findByIdAndDelete(req.body.id);
            renderPLPage(res, req, true, next);
        } catch (error) {
            console.log(error);
            renderPLPage(res, req, false, next);
        }
    }
}

module.exports.allSongs = async function (req, res) {
    try {
        const result = await dbModel.playlist.find({});
        res.render('admin/playlist', { layout: 'admin/layout', fetch: result });
    } catch (error) {
        res.render('admin/playlist', { layout: 'admin/layout', fetch: [{ songName: "Error!", thumbnail: "Error!", singer: "Error!", vote: 'Error!' }] });
    }
}

module.exports.playlist = async function (req, res, next) {
    try {
        console.log(req.cafe);
        const result = await dbModel.playlist.find({ cafe: req.cafe });
        res.render('admin/playlist', { layout: 'admin/layout', fetch: result });
    } catch (error) {
        res.render('admin/playlist', { layout: 'admin/layout', fetch: [{ plName: 'Error!', plLink: 'Error!', plId: 'Error!' }] });
    }
    next();
};

module.exports.songOrder = async function (req, res, next) {
    res.render('admin/order', { layout: 'admin/layout' });
    next();
};

// VOTING SECTION

const fetchSettings = async () => {
    return await dbModel.settings.findOne({ settingID: 2 });
};

const fetchPlaylists = async () => {
    return await dbModel.playlist.find({});
};

const fetchSongs = async () => {
    return await dbModel.votingSongs.find({});
};

function bubbleSort(arr) {
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Komşu elemanları karşılaştır ve yer değiştir (küçükten büyüğe)
            if (arr[j] > arr[j + 1]) {
                // Geçici değişken kullanarak yer değiştirme
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }

    return arr;
}
const updateVotingStatus = async () => {
    await dbModel.settings.findOneAndUpdate(
        { settingID: 2 },
        { $set: { voting: true, votingTime: date.getTime() } }
    );
    const updatedSettings = await fetchSettings();
    return { voting: updatedSettings.voting, votingTime: updatedSettings.votingTime };
};

const renderSongPage = async (response, statusCode, request) => {
    try {
        // Fetching settings and playlist informations
        const settings = await fetchSettings();
        const playlists = await fetchPlaylists();

        // Checking if the user started the voting 
        if (request.body.startVote && !settings.voting) {

            for (let i = 0; i < 3; i++) {
                if (playlists.length > 0) {
                    let dynamicPl = await fetchPlaylists();
                    let playlist = dynamicPl[0];
                    // Kontrol et playlist içinde 'songs' özelliği var mı
                    if (playlist && playlist.songs && playlist.songs.length > 0) {
                        let song = playlist.songs[0];

                        const newSong = new dbModel.votingSongs({
                            playlistID: playlist._id,
                            songName: song.songName,
                            thumbnail: song.thumbnail,
                            singer: song.singer,
                            songLink: song.songLink,
                            vote: 0,
                            songDuration: song.songDuration
                        });

                        await newSong.save();

                        try {
                            await dbModel.playlist.updateOne(
                                { _id: new ObjectId(playlist._id) },
                                { $pull: { songs: { _id: new ObjectId(song._id) } } }
                            );
                        } catch (error) {
                            console.log(error);
                        }

                        const updatedPlaylist = await dbModel.playlist.findOne({ _id: new ObjectId(playlist._id) });

                        if (!updatedPlaylist || updatedPlaylist.songs.length === 0) {
                            try {
                                await dbModel.playlist.deleteOne({ _id: new ObjectId(playlist._id) });
                                console.log(`Playlist "${playlist.playlistName}" içindeki tüm şarkılar kaldırıldığından playlist de kaldırıldı.`);
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    } else {
                        console.log('Playlist içinde şarkı bulunmuyor veya playlist tanımsız.');
                    }
                } else {
                    console.log('Playlist bulunmuyor.');
                    break;
                }
            }

            // Taking updated voting and voting values 
            const { voting, votingTime } = await updateVotingStatus();

            // Update the voting and votingTime value to current values
            settings.voting = voting;
            settings.votingTime = votingTime;

            console.log('Voting started.');
        }

        // Taking the current time
        const currentDate = new Date();

        // If the song duration is available take the duration and add 30 seconds if the song duration isn't available variable take 60 seconds
        var voteDuration = settings.votedSong != null ? settings.votedSong['songDuration'] + 30 : 60;
        voteDuration = voteDuration == 0 ? 60 : voteDuration;
        console.log(voteDuration, settings.votingTime, currentDate.getTime(), (currentDate.getTime() - settings.votingTime));
        // If the voting is true and the voting time is bigger than vote duration
        // 630000 13351356
        if ((currentDate.getTime() - settings.votingTime) >= voteDuration * 1000) {

            var songs = await fetchSongs();
            var voted = bubbleSort(songs.slice())[0]
            console.log(voted);
            // If the highest voted song is available update the voted song to the highest voted song
            if (voted) {
                await dbModel.settings.findOneAndUpdate(
                    { settingID: 2 },
                    { $set: { voting: false, votingTime: 0, votedSong: voted } }
                );
            }

            // If the highest voted song is not available update the voted song to null
            else {
                await dbModel.settings.findOneAndUpdate(
                    { settingID: 2 },
                    { $set: { voting: false, votingTime: 0, votedSong: null } }
                );
            }

            // Changing users isVoted property from true to false

            await dbModel.user.updateMany({}, { $set: { isVoted: false } });

            await dbModel.votingSongs.deleteMany({});

            // Voting information changing from the database
            await dbModel.settings.findOneAndUpdate({ settingID: 2 }, { $set: { voting: false, votingTime: 0 } });
            console.log('Voting ended.');
            response.render('admin/song', { layout: 'admin/layout', voting: false, votedSong: settings.votedSong, voting: settings.voting });
        }

        // If the voting is ongoing
        else if (settings.voting) {
            const songs = await fetchSongs();
            console.log((currentDate.getTime() - settings.votingTime), voteDuration * 1000);
            response.render('admin/song', { layout: 'admin/layout', statusCode, fetch: songs, voting: settings.voting, votedSong: settings.votedSong });
            console.log('Voting is ongoing.');
            console.log(voteDuration, settings.votingTime, currentDate.getTime(), (currentDate.getTime() - settings.votingTime), voteDuration * 1000);
        }

        // If the voting is not started or ended
        else {
            response.render('admin/song', { layout: 'admin/layout', voting: false });
        }
    }

    // If the fetch is not available
    catch (error) {
        console.log(error);
        await dbModel.settings.findOneAndUpdate(
            { settingID: 2 },
            { $set: { voting: false, votingTime: 0, votedSong: null } }
        );
        const settings = await fetchSettings();
        response.render('admin/song', {
            layout: 'admin/layout',
            fetch: [{ songName: "Error!", thumbnail: "Error!", singer: "Error!", vote: 'Error!', songLink: 'Error!' }],
            voting: settings.voting,
            votingTime: 'Error!'
        });
    }
};


module.exports.song = function (req, res) {
    res.render('admin/song', { layout: 'admin/layout' });
};

module.exports.songPost = async function (req, res) {
    renderSongPage(res, true, req);
}

// ENCORES SECTION

// encore fetch
const fetchEncore = async (cafe) => {
    return await dbModel.encore.find({ cafe });
};

const renderEncorePage = async function (req, res, next) {
    try {
        const encore = await fetchEncore(req.cafe);
        res.render('admin/encores', { layout: 'admin/layout', fetch: encore });
    } catch (error) {
        console.log(error);
        res.render('admin/encores', { layout: 'admin/layout', fetch: [{ songName: "Error!", songLink: "Error!" }] });
    }
    next();
}

module.exports.encores = function (req, res, next) {
    renderEncorePage(req, res, next);
};

module.exports.encorePost = async function (req, res) {
    renderEncorePage(req, res);
    console.log(req.body);
    if (req.body.addEncore) {
        // oylama sarkilarin oylari sifirlanacak
        const playlists = await fetchPlaylists();
        await dbModel.settings.findOneAndUpdate(
            { settingID: 2 },
            { $set: { votingTime: date.getTime(), votedSong: { songName: req.body.songName, thumbnail: 'Encore Song', singer: 'Encore Song', songLink: req.body.link, vote: 1, songDuration: req.body.songDuration } } }
        );
    }
}

// LOGIN SECTION
const maxAge = 3 * 24 * 60 * 60
const createToken = function (id) {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: maxAge
    });
}

module.exports.login = async function (req, res) {
    res.render('admin/login', { layout: 'empty-layout'});
};

module.exports.loginPost = async function (req, res) {
    const { email, password } = req.body;

    console.log(email, password);

    try {
        const admin = await dbModel.admin.login(email, password);
        console.log('gelenAdmin: ', admin)
        const token = createToken(admin._id);
        console.log('token',token, process.env.ACCESS_TOKEN_SECRET)
        res.cookie('jwtAdmin', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.json({ admin })
    }
    catch (err) {
        console.log('errAlindi', err)
        res.status(400).json({ err });
    }
};

// MESSAGES SECTION
module.exports.messages = async function (req, res) {
    let messages = await dbModel.message.find({});
    res.render('admin/messages', { layout: 'admin/layout', fetch: messages });
};

module.exports.logout = function (req, res) {
    res.cookie('jwtAdmin', '', { maxAge: 1 });
    res.redirect('/admin/login');
}

const fetchTable = async (cafe) => {
    return await dbModel.user.find({ cafe });
};

const renderTablePage = async function (req, res, next) {
    try {
        const table = await fetchTable(req.cafe);
        res.render('admin/tables', { layout: 'admin/layout', fetch: table });
    } catch (error) {
        console.log(error);
        res.render('admin/tables', { layout: 'admin/layout', fetch: 'err' });
    }
    next();
}

module.exports.table = function (req, res, next) {
    renderTablePage(req, res, next)
}

module.exports.tablePost = async function (req, res, next) {
    await dbModel.user.findByIdAndUpdate(req.tableDetailId, { isVoted: false, isEncored: false, encoreTime: 0, encoredTime: 0, votedSongs: [], encoredSong: {} })
    renderTablePage(req, res, next)
}

module.exports.cafes = async function (req, res) {
    let cafe = await dbModel.place.find({});
    res.render('admin/cafes', { layout: 'admin/layout', fetch: cafe });
}

module.exports.cafesPost = async function (req, res) {
    console.log(req.body);
    if (req.body.cafeAdd) {
        const newCafe = new dbModel.place({
            name: req.body.name,
            adress: req.body.address,
            amount: req.body.amount,
            encoreTime: 0,
            pinCode: 0,
            voting: false,
            votingTime: 0,
            votedSong: {},
            cafe: replaceTurkishCharacters(req.body.name).toLowerCase(),
            playlist: '',
            autoPlay: req.body.autoPlay == "0" ? false : true
        });

        for (let i = 0; i < req.body.amount; i++) {
            let email = replaceTurkishCharacters("Masa " + (i + 1)) + "@melodyway.app"
            const salt = await bcrypt.genSalt();
            const hashedPass = await bcrypt.hash(generateStrongPassword(18), salt);

            const combinedData = "Masa " + (i + 1) + '_' + hashedPass;
            const accessKey = (await bcrypt.hash(combinedData, salt)).replaceAll('/', '');

            const newUser = new dbModel.user({
                name: "Masa " + (i + 1),
                email,
                auth: 1,
                key: accessKey,
                password: hashedPass,
                isVoted: false,
                isEncored: false,
                encoreTime: 0,
                encoredTime: 0,
                cafe: req.body.name,
                amount: 2
            });

            await newUser.save();
        }

        await newCafe.save();
    }
    else {
        let cafe = await dbModel.place.findById(req.body.id);
        await dbModel.user.deleteMany({cafe: cafe.name});
        await dbModel.place.findByIdAndDelete(req.body.id);
    }
    let cafe = await dbModel.place.find({});
    res.render('admin/cafes', { layout: 'admin/layout', fetch: cafe });
}

module.exports.addCafe = async function (req, res) {
    res.render('admin/addCafe', { layout: 'admin/layout' });
}

module.exports.addCafePost = async function (req, res) {
    res.render('admin/addCafe', { layout: 'admin/layout' });
}
