const http = require('http');
const express = require('express');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const socket = require('socket.io');
const dbModel = require('./app_server/models/dbModel');
const { log } = require('console');
const { google } = require('googleapis');
const { SocketAddress } = require('net');

dotenv.config();

const uri = "mongodb+srv://bahriurnl:<password>@melodyway.zrw2xyb.mongodb.net/?retryWrites=true&w=majority&appName=melodyWay";

async function run() {
  try {
    // Mongoose ile MongoDB'ye bağlan
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1, // Not: Bu seçenek mongoose.connect() ile direkt kullanılmaz, sadece MongoClient'ta kullanılır.
    });

    console.log("Mongoose ile MongoDB'ye başarıyla bağlandınız!");
  } catch (error) {
    console.error("Bağlantı hatası:", error);
  } finally {
    // İsteğe bağlı: Bağlantıyı kapatmak isterseniz
    // await mongoose.connection.close();
  }
}

run().catch(console.dir);

const app = express();
const server = http.createServer(app);
const io = socket(server);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/app_server/views'));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(ejsLayouts);
app.use(cookieParser());

app.use('/public', express.static(path.join(__dirname, 'public')))

require('./app_server/router/manageRouter')(app);

let musics = [];

async function getVote(cafe) {
    let cafeSongs = await dbModel.place.find({ cafe });
    return cafeSongs[0].votingSongs;
}

async function getMusics(cafe) {
    playlists = await dbModel.playlist.find({ cafe });
    musics = [];
    for (let i = 0; i < playlists.length; i++) {
        for (let j = 0; j < playlists[i].songs.length; j++) {
            musics.push(playlists[i].songs[j]);
        }
    }
}

async function addVote(userId, songId) {
    // Find song and increase vote count 1
    let user = await dbModel.user.findById(userId);
    const settings = await dbModel.place.findOne({ cafe: user.cafe });
    if (settings.voting) {
        let song = await dbModel.place.find({ cafe: user.cafe });

        // Add songName to user 
        for (let i = 0; i < 4; i++) {
            if (song[0].votingSongs[i]._id == songId) {
                song[0].votingSongs[i].vote += 1;
                await dbModel.place.updateOne({ cafe: user.cafe }, { votingSongs: song[0].votingSongs });
                await dbModel.user.updateOne({ _id: userId }, { $push: { votedSongs: { name: song[0].votingSongs[i].songName } } });
            }
        }
    }
}

async function getEncores(cafe) {
    return await dbModel.encore.find({ cafe });
}

function millisecondsToMinutesAndSeconds(milliseconds) {
    var totalSeconds = Math.floor(milliseconds / 1000); // Convert milliseconds to total seconds
    var minutes = Math.floor(totalSeconds / 60); // Convert total seconds to minutes
    var remainingSeconds = totalSeconds % 60; // Find remaining seconds that cannot be fully expressed in minutes

    // Return the result as a string in the format of minutes:seconds
    return minutes + " dakika " + remainingSeconds + " saniye";
}

async function addToEncore(song, user, name, note) {
    // Add new encore to encore section
    let userInfos = await dbModel.user.findById(user);
    const encore = new dbModel.encore({ thumbnail: song.thumbnail, songName: song.songName, songLink: song.songLink, songDuration: song.songDuration, singer: song.singer, cafe: userInfos.cafe, name: name, text: note });
    await encore.save();
    let logs = await dbModel.logs.findOne({ cafe: userInfos.cafe });
    if (logs) {
        await dbModel.logs.updateOne({ cafe: userInfos.cafe }, { $push: { encores: { songLink: song.songLink, time: new Date().getTime() } } });
    }
    else {
        let cafeLog = new dbModel.logs({ cafe: userInfos.cafe })
        await cafeLog.save();
        await dbModel.logs.updateOne({ cafe: userInfos.cafe }, { $push: { encores: { songLink: song.songLink, time: new Date().getTime() } } });
    }
    await dbModel.user.findByIdAndUpdate(user, { $inc: { encoredTime: 1 }, encoredSong: song });
    let place = await dbModel.place.findOne({ cafe: userInfos.cafe });
    if (place.songOrder.length != 0) {
        for (let i = 0; i < place.songOrder.length; i++) {
            if (place.songOrder[i].isEncore == false) {
                place.songOrder.splice(i, 0, encore);
                place.songOrder[i].isEncore = true;
                break;
            }
        }
    }
    else {
        place.songOrder.push(encore);
        place.songOrder[0].isEncore = true;
    }
    await dbModel.place.updateOne({ cafe: userInfos.cafe }, { $inc: { encoreTime: 1 } });
    await dbModel.place.updateOne({ cafe: userInfos.cafe }, { $set: { songOrder: place.songOrder } });
    // Playlisg icerisine eklenecek
}

async function musicGet(cafe) {
    let playlists = await dbModel.playlist.find({ cafe });
    let musics = [];
    for (let i = 0; i < playlists.length; i++) {
        for (let j = 0; j < playlists[i].songs.length; j++) {
            musics.push(playlists[i].songs[j]);
        }
    }
    return musics
}

async function getSongOrder(cafe) {
    let place = await dbModel.place.findOne({ cafe });
    return place.songOrder;
}

async function voteCheck(cafe) {
    const settings = await dbModel.place.findOne({ cafe });
    if (settings.voting && settings.intervalSecond != 1000) {
        if (settings.votingTime + settings.intervalSecond <= new Date().getTime()) {
            // Voting is ended
            console.log('vote Ended');
            // Find voted song
            const votingSongs = settings.votingSongs;
            let votingSongsLog = [];
            let votedSong = { vote: 0 };
            for (let i = 0; i < votingSongs.length; i++) {
                votingSongsLog.push({ songLink: votingSongs[i].songLink, vote: votingSongs[i].vote });
                if (votingSongs[i].vote >= votedSong.vote) {
                    votedSong = votingSongs[i];
                }
            }
            console.log(votedSong);
            let logs = await dbModel.logs.findOne({ cafe });
            if (logs) {
                await dbModel.logs.updateOne({ cafe }, { $push: { votes: { voting: votingSongsLog, time: new Date().getTime() } } });
            }
            else {
                await new dbModel.logs({ cafe }).save();
                await dbModel.logs.updateOne({ cafe }, { $push: { votes: { voting: votingSongsLog, time: new Date().getTime() } } });
            }
            // Update the selected song and voting informations
            // Seçilen şarkı ve oylama bilgilerini güncelle
            let placeInfo = await dbModel.place.findOne({ cafe });
            let orderedSong = placeInfo.songOrder;
            orderedSong.push(votedSong);
            await dbModel.place.updateOne({ cafe }, {
                $set: {
                    votedSong: votedSong,
                    votingTime: 0,
                    voting: false,
                    songOrder: orderedSong
                }
            });
            if(settings.autoPlay){
                // Şarkı sırasını güncelle
                let updatedPlaceInfo = await dbModel.place.findOne({ cafe });
                let temp = updatedPlaceInfo.songOrder[0];
                let openedSong = { songName: temp.songName, songLink: temp.songLink, songDuration: temp.songDuration, isEncore: temp.isEncore, name: temp.name, text: temp.text };
                if (temp.isEncore) {
                    await dbModel.encore.deleteOne({ _id: temp._id })
                }
                updatedPlaceInfo.songOrder.shift();
                await dbModel.place.updateOne({ cafe }, { $set: { songOrder: updatedPlaceInfo.songOrder, openedSong } });
                
                // Oylama zamanını güncelle
                await dbModel.place.updateOne({ cafe }, { $set: { intervalSecond: 1000 } });
                
                return openedSong;
            }
            else{
                await dbModel.place.updateOne({ cafe }, { $set: { intervalSecond: 1000 } });
                return 'voteEnded'
            }
        }
    }
    else if ((await musicGet(cafe)).length >= 4) {
        let voteMusics = await musicGet(cafe)
        console.log(voteMusics);
        console.log('vote Start');
        // Update the voting informations
        await dbModel.place.updateOne({ cafe }, { votingTime: new Date().getTime(), voting: true });
        if (settings.openedSong && settings.autoPlay) {
            let votingInterval = settings.openedSong.songDuration != 0 ? settings.openedSong.songDuration * 1000 + 5000 : 60000
            await dbModel.place.updateOne({ cafe }, { $set: { intervalSecond: votingInterval } });
        }
        else if(settings.autoPlay == false){
            await dbModel.place.updateOne({ cafe }, { $set: { intervalSecond: 60000 * 3 } });
        }
        else {
            await dbModel.place.updateOne({ cafe }, { $set: { intervalSecond: 60000 } });
        }
        // Delete the voted songs
        await dbModel.place.updateOne({ cafe }, votingSongs = []);

        await dbModel.user.updateMany({}, { $set: { isVoted: false, votedSongs: [] } });
        let votingSongsPlace = [];
        // Adding new songs to the voted song
        for (let i = 0; i < 4; i++) {
            votingSongsPlace.push({
                songName: voteMusics[i].songName, thumbnail: voteMusics[i].thumbnail, singer: voteMusics[i].singer, songLink: voteMusics[i].songLink,
                vote: 0, songDuration: voteMusics[i].songDuration
            })
            // Deleting songs from playlist
            let playlist = await dbModel.playlist.find({ cafe });
            if (playlist) {
                playlist[0].songs.shift();
                if (playlist[0].songs.length == 0) {
                    await dbModel.playlist.findByIdAndDelete(playlist[0]._id);
                } else {
                    await dbModel.playlist.findByIdAndUpdate(playlist[0]._id, { $set: { songs: playlist[0].songs } });
                }
            }
        }
        console.log(votingSongs);
        await dbModel.place.updateOne({ cafe }, { votingSongs: votingSongsPlace });
        getMusics(cafe);
        return "voteStart";

    }
    else {
        console.log("Musics", (await musicGet(cafe)));
        console.log(musics);
        console.log("There is no music in the playlist");
        await dbModel.place.updateOne({ cafe }, votingSongs = []);
        await dbModel.user.updateMany({ cafe }, { $set: { isVoted: false, votedSongs: [], votingSongs: [] } });
        return "MusicsEnded"
    }
}

io.on("connection", async socket => {

    socket.on("startDatas", async data => {
        const socketID = io.of('/').sockets.get(data.socketId);
        console.log('socket', data.socketId);
        let user = await dbModel.user.findById(data.userId);
        await getMusics(user.cafe);
        let votedSong = await dbModel.place.findOne({ cafe: user.cafe })
        votedSong = votedSong.openedSong ? votedSong.openedSong : null;
        console.log(votedSong)
        socketID.emit('votedSong', { status: "currentSong", votedSongs: votedSong, cafe: user.cafe });
        socketID.emit('musics', { musics, cafe: user.cafe });
        socketID.emit('encores', await getEncores(user.cafe));
        socketID.emit('voting', { status: 'voteStart', voteSongs: await getVote(user.cafe), cafe: user.cafe });
    })

    socket.on("startDatasAdmin", async data => {
        const socketID = io.of('/').sockets.get(data.socketId);
        await getMusics(data.cafe);
        socketID.emit('musics', { musics, cafe: data.cafe });
        socketID.emit('encores', await getEncores(data.cafe));
        socketID.emit('songOrder', { songOrder: await getSongOrder(data.cafe), cafe: data.cafe });
        socketID.emit('voting', { status: 'voteStart', voteSongs: await getVote(data.cafe), cafe: data.cafe });
        let voteStatus = await dbModel.place.findOne({ cafe: data.cafe });
        socket.send(`voteStatus,${!voteStatus.voting},Starting`);

    })

    // This is fired when the client places a color on the canvas
    socket.on("playlistAdd", async data => {
        if (data.status == true) {
            await getMusics(data.cafe);
            io.emit("musics", { musics, cafe: data.cafe });
        }
    })

    socket.on('vote', async data => {
        let user = await dbModel.user.findById(data.userId);
        if (user.amount > user.votedSongs.length) {
            await addVote(data.userId, data.songId);
            socket.send("voteStatus,true")
        }
        else {
            socket.send("voteStatus,false")
        }
        io.emit('voting', { status: 'voteStart', voteSongs: await getVote(user.cafe), cafe: user.cafe });
    })

    socket.on("songOpened", async data => {
        let place = await dbModel.place.findOne({cafe: data.cafe});
        for(let i = 0; i < place.songOrder.length; i++) {
            if(place.songOrder[i]._id == data.songId) {
                await dbModel.place.updateOne({cafe: data.cafe}, { $set: { openedSong: place.songOrder[i] } });
                place.songOrder.splice(i, 1);
                await dbModel.place.updateOne({ cafe: data.cafe }, { $set: { songOrder: place.songOrder } });
                if(data.encore){
                    console.log(data.songId);
                    await dbModel.encore.findByIdAndDelete(data.songId)
                }
                socket.emit('songOrder', { songOrder: await getSongOrder(data.cafe), cafe: data.cafe });
                break;
            }
        }
    })

    socket.on('addToEncore', async data => {
        let user = await dbModel.user.findById(data.user);
        if (user.isEncored) {
            if (user.encoreTime + 1800000 <= new Date().getTime()) {
                await dbModel.user.findByIdAndUpdate(data.user, { encoreTime: new Date().getTime(), isEncored: true });
                await addToEncore(data.song, data.user, data.name, data.note);
                socket.send("encoreStatus,İstek Şarkı Başarıyla Gönderildi,true");
            }
            else {
                socket.send(`encoreStatus,İstek Şarkı Göndermek İçin Beklemeniz Gereken Süre: ${millisecondsToMinutesAndSeconds(user.encoreTime + 1800000 - new Date().getTime())},false`);
            }
        }
        else {
            await dbModel.user.findByIdAndUpdate(data.user, { encoreTime: new Date().getTime(), isEncored: true });
            await addToEncore(data.song, data.user, data.name, data.note);
            socket.send("encoreStatus,İstek Şarkı Başarıyla Gönderildi,true");
        }
    })

    let intervalId;
    socket.on('voteStart', async data => {
        if (data.status == true) {
            intervalId = setInterval(async () => {
                let vote = await voteCheck(data.cafe);
                if (vote == 'voteStart') {
                    io.emit('voting', { status: 'voteStart', voteSongs: await getVote(data.cafe), cafe: data.cafe });
                    io.emit('musics', { musics, cafe: data.cafe });
                    socket.send('voteStatus,true,Oylama Başlatıldı');
                }
                else if (typeof vote == "object") {
                    io.emit('votedSong', { status: 'voteEnd', votedSongs: vote, cafe: data.cafe });
                    let songOrder = await getSongOrder(data.cafe);
                    io.emit('songOrder', { songOrder, cafe: data.cafe });
                    socket.send('voteStatus,true,Oylama Bitti');
                }
                else if(vote == 'voteEnded'){
                    // io.emit('votedSong', { status: 'voteEnd', votedSongs: vote, cafe: data.cafe });
                    let songOrder = await getSongOrder(data.cafe);
                    io.emit('songOrder', { songOrder, cafe: data.cafe });
                    socket.send('voteStatus,true,Oylama Bitti');
                }
                else if (vote == "MusicsEnded") {
                    clearInterval(intervalId);
                    socket.send('voteStatus,finish,Oylanacak Şarkı Kalmadı');
                }
            }, 1000);
        }
        else {
            clearInterval(intervalId);
            await dbModel.place.updateOne({ cafe: data.cafe }, { voting: false, votingTime: 0, votingSongs: [] });
            await dbModel.user.updateMany({ cafe: data.cafe }, { isVoted: false, })
            socket.send('voteStatus,false,Oylama Durduruldu');
        }
    })

})

const PORT = process.env.PORT || 8000;

server.listen(PORT);

