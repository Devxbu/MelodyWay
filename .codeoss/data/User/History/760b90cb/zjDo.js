var socket = io.connect('https://melodyway-server.oa.r.appspot.com');

function menuClose() {
    var menu = document.getElementById('header-menu-div');
    var overlay = document.getElementById('header-bottom-overlay');
    var btn = document.getElementById('header-menu');
    menu.classList.remove('menu-active');
    overlay.classList.remove('overlay-active');
    btn.classList.remove('btn-deactive');
}

function menuOpen() {
    var menu = document.getElementById('header-menu-div');
    var overlay = document.getElementById('header-bottom-overlay');
    var btn = document.getElementById('header-menu');
    menu.classList.add('menu-active');
    overlay.classList.add('overlay-active');
    btn.classList.add('btn-deactive')
}

function faqControl() {
    var faq = document.getElementById('faq-box');

    // Kontrol et ve class ekleyip/çıkar
    if (!faq.classList.contains('faq-active')) {
        faq.classList.add('faq-active');
        faq.classList.remove('faq-deactive');
    } else {
        faq.classList.remove('faq-active');
        faq.classList.add('faq-deactive');
    }

}
function faqControl2() {
    var faq = document.getElementById('faq-box-2');

    // Kontrol et ve class ekleyip/çıkar
    if (!faq.classList.contains('faq-active')) {
        faq.classList.add('faq-active');
        faq.classList.remove('faq-deactive');
    } else {
        faq.classList.remove('faq-active');
        faq.classList.add('faq-deactive');
    }

}
function faqControl3() {
    var faq = document.getElementById('faq-box-3');

    // Kontrol et ve class ekleyip/çıkar
    if (!faq.classList.contains('faq-active')) {
        faq.classList.add('faq-active');
        faq.classList.remove('faq-deactive');
    } else {
        faq.classList.remove('faq-active');
        faq.classList.add('faq-deactive');
    }

}
function faqControl4() {
    var faq = document.getElementById('faq-box-4');

    // Kontrol et ve class ekleyip/çıkar
    if (!faq.classList.contains('faq-active')) {
        faq.classList.add('faq-active');
        faq.classList.remove('faq-deactive');
    } else {
        faq.classList.remove('faq-active');
        faq.classList.add('faq-deactive');
    }

}
function faqControl5() {
    var faq = document.getElementById('faq-box-5');

    // Kontrol et ve class ekleyip/çıkar
    if (!faq.classList.contains('faq-active')) {
        faq.classList.add('faq-active');
        faq.classList.remove('faq-deactive');
    } else {
        faq.classList.remove('faq-active');
        faq.classList.add('faq-deactive');
    }

}
function secondsToMinutes(seconds) {
    var minutes = Math.floor(seconds / 60); // Convert seconds to minutes
    var remainingSeconds = seconds % 60; // Find remaining seconds that cannot be fully expressed in minutes

    // Return the result as a string in the format of minutes:seconds
    return minutes + ":" + (remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds);
}

function addToEncore(song, user, inputs) {
    socket.emit('addToEncore', { song, user, name: inputs[0], note: inputs[1] });
}

// JavaScript dosyanızda bu kodu kullanarak encore kutularını oluşturabilirsiniz
const containerEncore = document.getElementById('filteredSongsEncore'); // Encore kutularının ekleneceği div
const userId = document.getElementById('userId').value;
const userCafe = document.getElementById('userCafe').value;

socket.on('connect', () => {
    socket.emit('startDatas', { userId, socketId: socket.id });
});


$(document).ready(() => {
    socket.on('encores', data => {
        console.log(data);
        containerEncore.innerHTML = '';
        data.forEach(song => {
            // Encore kutusu oluşturma
            const encoreCol = document.createElement('div');
            encoreCol.className = 'col-12 encores-col';

            const encoresBox = document.createElement('div');
            encoresBox.className = 'encores-box';

            const encores_col_flex = document.createElement('div');
            encores_col_flex.className = 'encores-col-flex';

            const span = document.createElement('span');
            span.style.display = 'flex';

            const encoreImg = document.createElement('div');
            encoreImg.className = 'encore-img';

            const img = document.createElement('img');
            img.src = song.thumbnail;
            img.alt = 'Song';

            encoreImg.appendChild(img);

            const encoresInfo = document.createElement('div');
            encoresInfo.className = 'encores-info';

            const title = document.createElement('h3');
            title.className = 'encore-title';
            title.textContent = song.songName;

            const customer = document.createElement('span');
            customer.innerHTML = song.name == undefined || song.name == '' ? '' : ' - ' + song.name;

            const artist = document.createElement('p');
            artist.className = 'encore-artist';
            artist.textContent = song.singer;

            encoresInfo.appendChild(title);
            encoresInfo.appendChild(artist);

            span.appendChild(encoreImg);
            span.appendChild(encoresInfo);

            const encoreTable = document.createElement('div');
            encoreTable.className = 'encore-table';

            const duration = document.createElement('p');
            duration.textContent = secondsToMinutes(song.songDuration);

            encoreTable.appendChild(duration);
            title.appendChild(customer);
            encores_col_flex.appendChild(span);
            encores_col_flex.appendChild(encoreTable);
            encoresBox.appendChild(encores_col_flex);
            encoreCol.appendChild(encoresBox);

            containerEncore.appendChild(encoreCol);
        });
    })
})

let nextVoting = document.getElementById('votingNext');
let encoreInput = document.getElementById('encore-input');
let userIdInput = document.getElementById('userIdInput');
const container = document.getElementById('filteredSongs'); // Encore kutularının ekleneceği div

$(document).ready(() => {

    socket.on("musics", data => {
        if (data.cafe == userCafe) {
            if (nextVoting) {
                console.log(data);
                nextVoting.innerHTML = '';
                for (let i = 0; i < 4; i++) {
                    // Yeni bir div elementi oluşturun ve class'ını ayarlayın
                    const col = document.createElement('div');
                    col.className = 'col-12 col-xl-3 col-lg-3 col-md-6 col-sm-6 col-xs-12';

                    // Yeni bir div elementi oluşturun ve class'ını ayarlayın
                    const songBox = document.createElement('div');
                    songBox.className = 'next-song-box';

                    // Yeni bir div elementi oluşturun ve class'ını ayarlayın
                    const nextSongImg = document.createElement('div');
                    nextSongImg.className = 'next-song-img';

                    // Yeni bir img elementi oluşturun, src ve alt özelliklerini ayarlayın
                    const img = document.createElement('img');
                    img.src = data.musics[i].thumbnail;
                    img.alt = 'Song';

                    // Yeni bir div elementi oluşturun ve class'ını ayarlayın
                    const nextSongInfo = document.createElement('div');
                    nextSongInfo.className = 'next-song-info';

                    // Yeni bir span elementi oluşturun
                    const span = document.createElement('span');

                    // Yeni bir h3 elementi oluşturun ve içeriğini ayarlayın
                    const nextSongTitle = document.createElement('h3');
                    nextSongTitle.className = 'next-song-title';
                    nextSongTitle.textContent = data.musics[i].songName;

                    // Yeni bir p elementi oluşturun ve içeriğini ayarlayın
                    const nextSongArtist = document.createElement('p');
                    nextSongArtist.className = 'next-song-artist';
                    nextSongArtist.textContent = data.musics[i].singer;

                    // Oluşturulan elementleri birbirine bağlayın
                    nextSongImg.appendChild(img);
                    span.appendChild(nextSongTitle);
                    span.appendChild(nextSongArtist);
                    nextSongInfo.appendChild(span);
                    songBox.appendChild(nextSongImg);
                    songBox.appendChild(nextSongInfo);
                    col.appendChild(songBox);

                    // Oluşturulan elementi belirli bir container'a ekleyin
                    nextVoting.appendChild(col);
                }

            }
            container.innerHTML = '';
            let i = 0;
            data.musics.forEach(song => {
                i += 1
                if (i <= 4) {
                    displaySongs(song, true);
                }
                else {
                    displaySongs(song, false);
                }
            });
            encoreInput.addEventListener('input', (event) => {
                container.innerHTML = '';
                const searchText = event.target.value.toLowerCase(); // Inputa yazılan metni küçük harfe dönüştür
                const matchingSongs = data.musics.filter(song => {
                    // Şarkı ismi veya sanatçı adı, aranan metni içeriyorsa true döndür
                    return song.songName.toLowerCase().includes(searchText) || song.singer.toLowerCase().includes(searchText);
                });
                for (let i = 0; i < matchingSongs.length; i++) {
                    displaySongs(matchingSongs[i]);
                }
            })

            // form olsun hepsi butona tiklayinca mainControllerla kullanicinin encore yerine ve encore tablosuna eklensin,
            // formla birlikte sockete de gitsin vote information sayfasi da socket ile alsin 
            // encore zamani gelmeyenler icin bolum gozukmesin, 


            function displaySongs(song, oylanacak) {
                // Encore kutusu oluşturma
                const encoreCol = document.createElement('div');
                encoreCol.className = 'col-12 encores-col';

                const encoresBox = document.createElement('div');
                encoresBox.className = 'encores-box';

                const encores_col_flex = document.createElement('div');
                encores_col_flex.className = 'encores-col-flex';

                const span = document.createElement('span');
                span.style.display = 'flex';

                const encoreImg = document.createElement('div');
                encoreImg.className = 'encore-img';

                const img = document.createElement('img');
                img.src = song.thumbnail;
                img.alt = 'Song';

                const songId = document.createElement('input');
                songId.type = 'hidden';
                songId.value = song._id;
                songId.name = "songId";

                const userId = document.createElement('input');
                userId.type = 'hidden';
                userId.value = userIdInput.value;
                userId.name = "userId";

                encoreImg.appendChild(img);

                const encoresInfo = document.createElement('div');
                encoresInfo.className = 'encores-info';

                const title = document.createElement('h3');
                title.className = 'encore-title';
                title.textContent = oylanacak ? song.songName + ' - Oylanacak' : song.songName;

                const artist = document.createElement('p');
                artist.className = 'encore-artist';
                artist.textContent = song.singer

                const encoreCustomerInputs = document.createElement('span');
                encoreCustomerInputs.className = 'encoreCustomerInput'

                const encoreCustomer = document.createElement('input')
                encoreCustomer.type = 'text';
                encoreCustomer.maxLength = 50;
                encoreCustomer.placeholder = 'Adınız: ';
                encoreCustomer.className = 'encoreCustomer';

                const encoreNote = document.createElement('input');
                encoreNote.type = 'text';
                encoreNote.maxLength = 250;
                encoreNote.placeholder = 'Notunuz: ';
                encoreNote.className = 'encoreCustomer';

                const button = document.createElement('button');
                button.className = 'encore-btn';
                button.type = 'submit';
                button.value = 'encoreSubmit';
                button.name = 'encoreSubmit';
                button.innerHTML = 'Gönder';
                button.onclick = function () { if (encoreCustomerInputs.classList.contains('encoreCustomerInputsActive')) { encoreCustomerInputs.classList.remove('encoreCustomerInputsActive'); addToEncore(song, userIdInput.value, [encoreCustomer.value, encoreNote.value]); } else { encoreCustomerInputs.classList.add('encoreCustomerInputsActive') } };
                encoresInfo.appendChild(title);
                encoresInfo.appendChild(artist);
                encoresInfo.appendChild(songId);
                encoresInfo.appendChild(userId);

                span.appendChild(encoreImg);
                span.appendChild(encoresInfo);

                const encoreTable = document.createElement('div');
                encoreTable.className = 'encore-table';

                const duration = document.createElement('p');
                duration.textContent = secondsToMinutes(song.songDuration);

                encoreTable.appendChild(duration);
                encoreTable.appendChild(button);

                encoresBox.appendChild(encores_col_flex);
                encores_col_flex.appendChild(span);
                encores_col_flex.appendChild(encoreTable);

                encoreCol.appendChild(encoresBox);

                container.appendChild(encoreCol);

                encoreCustomerInputs.appendChild(encoreCustomer);
                encoreCustomerInputs.appendChild(encoreNote);

                encoresBox.appendChild(encoreCustomerInputs)
            };
        }
    });
})

const encoreStatusDiv = document.getElementById('encoreStatusDiv');
const successAlert = document.getElementById('successAlert');
const encoreStatusP = document.getElementById('encoreStatusP');
function fire(ratio, opt) {
    confetti(Object.assign({}, opt, { origin: { y: .6 }, particleCount: Math.floor(200 * ratio) }))
}

socket.on("message", data => {
    let message = data.split(',');
    if (message[0] == 'encoreStatus') {
        encoreStatusDiv.style.display = 'block';
        encoreStatusP.innerHTML = message[1];
        if (message[2] == 'false') {
            encoreStatusDiv.children[0].classList = 'alert alert-dismissible fade show alert-danger';
        }
        else if(message[2] == 'true') {
            encoreStatusDiv.children[0].classList = 'alert alert-dismissible fade show alert-success';
            fire(.25, { spread: 30, startVelocity: 60, });
            fire(.2, { spread: 60 });
            fire(.35, { spread: 100, decay: .9, scalar: 1 });
            fire(.1, { spread: 130, startVelocity: 30, decay: .92, scalar: 1.2 })
            fire(.2, { spread: 120, startVelocity: 45 })
        }
    }
    if (message[0] == 'voteStatus') {
        if (message[1] == 'true') {
            fire(.25, { spread: 30, startVelocity: 60, });
            fire(.2, { spread: 60 });
            fire(.35, { spread: 100, decay: .9, scalar: 1 });
            fire(.1, { spread: 130, startVelocity: 30, decay: .92, scalar: 1.2 })
            fire(.2, { spread: 120, startVelocity: 45 })
        }
    }
})

socket.on('voting', data => {
    if (data.cafe == userCafe) {
        var container = document.getElementById("songsContainer");
        const voteInfo = document.getElementById('voteInfoSongs');
        if (container) {
            container.innerHTML = '';
        }
        if (voteInfo) {
            voteInfo.innerHTML = '';
        }
        var totalVote = 0;
        for (let i = 0; i < 4; i++) {
            totalVote += data.voteSongs[i].vote;
        }
        data.voteSongs.forEach((voting) => {
            if (container) {
                // Yeni div oluştur ve class'ını ayarla
                var colDiv = document.createElement("div");
                colDiv.className = "col-12 col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12";

                // Yeni div oluştur ve class'ını ayarla
                var songBoxDiv = document.createElement("div");
                songBoxDiv.className = "song-box";

                // Yeni div oluştur ve class'ını ayarla
                var songHeaderDiv = document.createElement("div");
                songHeaderDiv.className = "song-header";

                // Yeni div oluştur ve class'ını ayarla
                var songImgDiv = document.createElement("div");
                songImgDiv.className = "song-img";

                // Yeni img oluştur, src ve alt özelliklerini ayarla
                var img = document.createElement("img");
                img.src = voting.thumbnail;
                img.alt = "Song";

                // Yeni div oluştur ve class'ını ayarla
                var songInfoDiv = document.createElement("div");
                songInfoDiv.className = "song-info";

                // Yeni h3 başlığı oluştur ve içeriğini ayarla
                var songTitle = document.createElement("h3");
                songTitle.className = "song-title";
                songTitle.textContent = voting.songName;

                // Yeni p elementi oluştur ve içeriğini ayarla
                var songArtist = document.createElement("p");
                songArtist.className = "song-artist";
                songArtist.textContent = voting.singer;

                // Yeni div oluştur ve class'ını ayarla
                var songFooterDiv = document.createElement("div");
                songFooterDiv.className = "song-footer";

                // Yeni div oluştur ve class'ını ayarla
                var songPercentDiv = document.createElement("div");
                songPercentDiv.className = "song-precent";

                // Yeni p elementi oluştur ve içeriğini ayarla
                var surveyInfoPercent = document.createElement("p");
                // surveyInfoPercent.innerHTML = voting.vote;
                surveyInfoPercent.innerHTML = (totalVote != 0 ? parseInt((voting.vote / totalVote) * 100) : 0) + "%";

                // Yeni div oluştur ve class'ını ayarla
                var songVoteDiv = document.createElement("div");
                songVoteDiv.className = "song-vote";

                // Yeni buton oluştur ve özelliklerini ayarla
                var voteButton = document.createElement("button");
                voteButton.type = "button";
                voteButton.name = "songVote";
                voteButton.value = "songVote";
                voteButton.className = "vote-btn";
                voteButton.innerHTML = "Oyla!";

                // Buton tıklama olayına fonksiyon ekle
                voteButton.onclick = function () {
                    socket.emit('vote', { userId: userIdInput.value, songId: voting._id });
                };

                // Her bir elementi birbirine ekleyin
                songImgDiv.appendChild(img);
                songInfoDiv.appendChild(songTitle);
                songInfoDiv.appendChild(songArtist);
                songPercentDiv.appendChild(surveyInfoPercent);
                songVoteDiv.appendChild(voteButton);
                songFooterDiv.appendChild(songPercentDiv);
                songFooterDiv.appendChild(songVoteDiv);
                songHeaderDiv.appendChild(songImgDiv);
                songHeaderDiv.appendChild(songInfoDiv);
                songBoxDiv.appendChild(songHeaderDiv);
                songBoxDiv.appendChild(songFooterDiv);
                colDiv.appendChild(songBoxDiv);
                container.appendChild(colDiv);
            }
            if (voteInfo) {
                // Parent containerı seç
                const parentContainer = document.createElement('div');
                parentContainer.className = 'col-12 col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12 song-col';

                // Song box elementini oluştur
                const songBox = document.createElement('div');
                songBox.className = 'song-box';

                // Song img elementini oluştur
                const songImg = document.createElement('div');
                songImg.className = 'song-img';

                // Img elementini oluştur ve özelliklerini ayarla
                const img = document.createElement('img');
                img.src = voting.thumbnail;
                img.alt = 'Song';

                // Img elementini songImg içine ekle
                songImg.appendChild(img);

                // Song info elementini oluştur
                const songInfo = document.createElement('div');
                songInfo.className = 'song-info';

                // Span elementini oluştur
                const span = document.createElement('span');

                // Song title elementini oluştur ve içeriğini ayarla
                const songTitle = document.createElement('h3');
                songTitle.className = 'song-title';
                songTitle.textContent = voting.songName;

                // Song artist elementini oluştur ve içeriğini ayarla
                const songArtist = document.createElement('p');
                songArtist.className = 'song-artist';
                songArtist.textContent = voting.singer;

                // Song title ve song artist elementlerini span içine ekle
                span.appendChild(songTitle);
                span.appendChild(songArtist);

                // Song precent elementlerini oluştur
                const songPrecent = document.createElement('div');
                songPrecent.className = 'song-precent';

                const songPrecentBox = document.createElement('div');
                songPrecentBox.className = 'song-precent-box';

                const songInfoPrecent = document.createElement('span');
                songInfoPrecent.className = 'song-info-precent';
                songInfoPrecent.style.width = (totalVote != 0 ? parseInt((voting.vote / totalVote) * 100) : 0) + "%";

                const songPrecentText = document.createElement('p');
                songPrecentText.className = 'songPrecentText';
                songPrecentText.textContent = (totalVote != 0 ? parseInt((voting.vote / totalVote) * 100) : 0) + "%";

                // Song precent elementlerini birleştir
                songPrecentBox.appendChild(songInfoPrecent);
                songPrecent.appendChild(songPrecentBox);
                songPrecent.appendChild(songPrecentText);

                // Song info içine span ve song precent elementlerini ekle
                songInfo.appendChild(span);
                songInfo.appendChild(songPrecent);

                // Song box içine song img ve song info elementlerini ekle
                songBox.appendChild(songImg);
                songBox.appendChild(songInfo);

                // Parent container içine song box elementini ekle
                parentContainer.appendChild(songBox);

                // Oluşturulan elementi sayfaya ekle
                voteInfo.appendChild(parentContainer);

            }
        })
    }
})

let openedSong = document.getElementById('openedSong');
let openedSongEncore = document.getElementById('openedSongEncore');

socket.on('votedSong', data => {
    if (data.cafe == userCafe) {
        // Open the voted song in another tab
        console.log(data.votedSongs);
        if (data.status == 'voteEnd' || data.status == 'currentSong') {
            openedSong.innerHTML = `Çalınan Şarkı 🎵 ${data.votedSongs.songName} 🎵`
        }
        if (data.votedSongs.isEncore && data.votedSongs.name || data.votedSongs.text) {
            let text = "";
            if (data.votedSongs.name && data.votedSongs.text) {
                text = data.votedSongs.name + " - " + data.votedSongs.text;
            }
            else if (data.votedSongs.name) {
                text = data.votedSongs.name;
            }
            else if (data.votedSongs.text) {
                text = data.votedSongs.text;
            }
            else {
                text = "";
            }
            openedSongEncore.innerHTML = text;
        }
    }
})