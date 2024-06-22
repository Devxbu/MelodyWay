var socket = io('http://34.107.117.255/');
const playlistStatus = document.getElementById("playlistStatus");
const encoreStatusDiv = document.getElementById('encoreStatusDiv');
const successAlert = document.getElementById('successAlert');
const encoreStatusP = document.getElementById('encoreStatusP');

function closeTable() {
    document.getElementById('tableDetail').innerHTML = '';
    document.getElementById('tableDetail').style.zIndex = -10;
    document.getElementById('tableOverlay').style.display = 'none';
}

document.querySelectorAll('.table-col').forEach(table => {
    table.addEventListener('click', function () {
        document.getElementById('tableOverlay').style.display = 'block';
        var id = this.getElementsByTagName('input').id.value;
        var cafe = this.getElementsByTagName('input').cafe.value;
        var name = this.getElementsByTagName('input').name.value;
        var encoredTime = this.getElementsByTagName('input').encoredTime.value;
        var encoredSong = this.getElementsByTagName('input').encoredSong.value;
        var songName = this.getElementsByTagName('input').songName.value;
        var isEncored = this.getElementsByTagName('input').isEncored.value;
        console.log(id, name, encoredTime, encoredSong, songName, isEncored);

        // Yeni bir div oluştur
        const containerDiv = document.createElement('div');
        containerDiv.className = 'container my-auto';

        // Yeni bir div oluştur ve containerDiv'in alt öğesi olarak ekle
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        containerDiv.appendChild(rowDiv);

        // Yeni bir div oluştur ve rowDiv'in alt öğesi olarak ekle
        const colDiv = document.createElement('div');
        colDiv.className = 'col-10 home-form table-form';
        rowDiv.appendChild(colDiv);

        // Form elementini oluştur ve colDiv'in alt öğesi olarak ekle
        const formElement = document.createElement('form');
        formElement.action = `/admin/table/${cafe}/${id}`;
        formElement.method = 'post';
        colDiv.appendChild(formElement);

        // Form text elementini oluştur ve formElement'in alt öğesi olarak ekle
        const formTextDiv = document.createElement('div');
        formTextDiv.style.textAlign = 'right';
        formTextDiv.className = 'form-text';
        formElement.appendChild(formTextDiv);

        // Buton elementini oluştur, içeriği ve stilini ayarla ve formTextDiv'in alt öğesi olarak ekle
        const closeButton = document.createElement('span');
        closeButton.style.cursor = 'pointer';
        closeButton.innerHTML = '<i style="font-size: 18px;" class="bx bx-x"></i>';
        closeButton.onclick = closeTable; // closeTable fonksiyonunu butonun tıklanma olayına bağla
        formTextDiv.appendChild(closeButton);

        // Form row elementini oluştur ve formElement'in alt öğesi olarak ekle
        const formRowDiv = document.createElement('div');
        formRowDiv.className = 'form-row';
        formElement.appendChild(formRowDiv);

        // İlk form grubu oluştur
        const formGroup1Div = document.createElement('div');
        formGroup1Div.className = 'form-group mb-4';
        formRowDiv.appendChild(formGroup1Div);

        const label1 = document.createElement('label');
        label1.setAttribute('for', 'title');
        label1.textContent = 'Masa';
        formGroup1Div.appendChild(label1);

        const input1 = document.createElement('input');
        input1.value = name;
        input1.disabled = true;
        input1.className = 'form-input form-control form-control-lg';
        input1.id = 'title';
        input1.placeholder = 'Masa';
        formGroup1Div.appendChild(input1);

        // İkinci form grubu oluştur
        const formGroup2Div = document.createElement('div');
        formGroup2Div.className = 'form-group mb-4';
        formRowDiv.appendChild(formGroup2Div);

        const label2 = document.createElement('label');
        label2.setAttribute('for', 'title');
        label2.textContent = 'İstek Şarkı Miktarı';
        formGroup2Div.appendChild(label2);

        const input2 = document.createElement('input');
        input2.value = encoredTime;
        input2.disabled = true;
        input2.className = 'form-input form-control form-control-lg';
        input2.id = 'title';
        input2.placeholder = 'İstek Şarkı Miktarı';
        formGroup2Div.appendChild(input2);

        // İstek şarkı varsa üçüncü form grubunu oluştur
        if (isEncored == true) {
            const formGroup3Div = document.createElement('div');
            formGroup3Div.className = 'form-group mb-4';
            formRowDiv.appendChild(formGroup3Div);

            const label3 = document.createElement('label');
            label3.setAttribute('for', 'title');
            label3.textContent = 'İstek Şarkı';
            formGroup3Div.appendChild(label3);

            const input3 = document.createElement('input');
            input3.value = songName;
            input3.disabled = true;
            input3.className = 'form-input form-control form-control-lg';
            input3.id = 'title';
            input3.placeholder = 'Oylanan Şarkı';
            formGroup3Div.appendChild(input3);
        }

        // Sıfırla butonunu oluştur ve formElement'in alt öğesi olarak ekle
        const resetButton = document.createElement('button');
        resetButton.className = 'btn btn-outline-info';
        resetButton.name = 'resetTable';
        resetButton.value = 'resetTable';
        resetButton.textContent = 'Masayı Sıfırla';
        formElement.appendChild(resetButton);

        // Oluşturulan elementi sayfaya ekle
        document.getElementById('tableDetail').appendChild(containerDiv);
        document.getElementById('tableDetail').style.zIndex = 100

    });
});

const cafe = document.getElementById('cafeName').value;

socket.on('connect', () => {
    socket.emit('startDatasAdmin', { cafe, socketId: socket.id });
});


socket.on('votedSong', data => {
    // Open the voted song in another tab
    console.log(data, cafe);
    if(data.cafe.toLowerCase() == cafe.toLowerCase() ){
        if (data.status == 'voteEnd'){
            window.open(data.votedSongs.songLink, '_blank');
        }
    }
})

socket.on("voteStatus", data => {
    encoreStatusDiv.style.display = 'block';
    encoreStatusP.innerHTML = data.text;
    console.log(data.status);
    if (data.status == 'false') {
        encoreStatusDiv.children[0].classList = 'alert alert-dismissible fade show alert-danger';
    }
    else if (data.status == 'finish') {
        document.getElementById("voteButton").innerHTML = 'Oylamayı Başlat';
        document.getElementById("voteButton").classList.remove('btn-outline-danger');
        document.getElementById("voteButton").classList.add('btn-outline-info');
        encoreStatusDiv.children[0].classList = 'alert alert-dismissible fade show alert-danger';
    }
    else {
        encoreStatusDiv.children[0].classList = 'alert alert-dismissible fade show alert-success';
    }
})

socket.on("message", data => {
    let dataMessage = data.split(',');
    if (dataMessage[0] == 'voteStatus') {
        if (dataMessage[2] !== 'Starting') {
            encoreStatusDiv.style.display = 'block';
            encoreStatusP.innerHTML = dataMessage[2];
        }
        if (dataMessage[1] == "false") {
            document.getElementById("voteButton").innerHTML = 'Oylamayı Başlat';
            document.getElementById("voteButton").classList.remove('btn-outline-danger');
            document.getElementById("voteButton").classList.add('btn-outline-info');
            encoreStatusDiv.children[0].classList = 'alert alert-dismissible fade show alert-danger';
        }
        else if (dataMessage[1] == 'finish') {
            document.getElementById("voteButton").innerHTML = 'Oylamayı Başlat';
            document.getElementById("voteButton").classList.remove('btn-outline-danger');
            document.getElementById("voteButton").classList.add('btn-outline-info');
            encoreStatusDiv.children[0].classList = 'alert alert-dismissible fade show alert-danger';
        }
        else {
            encoreStatusDiv.children[0].classList = 'alert alert-dismissible fade show alert-success';
        }
    }
})

const votingSong = document.getElementById("votingSong");
const songOrder = document.getElementById("songOrder");

socket.on("voting", data => {
    if (data.cafe == cafe) {
        // console.log(data);
        votingSong.innerHTML = '';
        data.voteSongs.forEach(element => {
            const tableImg = document.createElement('td');
            tableImg.innerHTML = `<img src="${element.thumbnail}" width="175" height="175">`;

            const tableSongName = document.createElement('td');
            tableSongName.innerText = element.songName;

            const tableSinger = document.createElement('td');
            tableSinger.innerText = element.singer;

            const tableVote = document.createElement('td');
            tableVote.innerText = element.vote;

            const tbody = document.createElement('tr');
            tbody.appendChild(tableImg);
            tbody.appendChild(tableSongName);
            tbody.appendChild(tableSinger);
            tbody.appendChild(tableVote);
            votingSong.appendChild(tbody);
        });
    }
})

socket.on("songOrder", data => {
    if (data.cafe == cafe) {
        // console.log(data);
        songOrder.innerHTML = '';
        data.songOrder.forEach(element => {
            const tableImg = document.createElement('td');
            tableImg.innerHTML = `<img src="${element.thumbnail}" width="175" height="175">`;

            const tableSongName = document.createElement('td');
            tableSongName.innerText = element.songName;

            const tableSinger = document.createElement('td');
            tableSinger.innerText = element.singer;

            const tableBtn = document.createElement('button');
            tableBtn.innerText = "Şarkıyı Aç";
            tableBtn.classList = 'btn btn-outline-info';
            tableBtn.addEventListener("click", () => {
                window.open(element.songLink, '_blank');
                socket.emit("songOpened", { cafe, songId: element._id, encore: element.isEncore})
            });
            tableBtn.style.borderBottomWidth = 'var(--bs-border-width)';

            const tbody = document.createElement('tr');
            tbody.appendChild(tableImg);
            tbody.appendChild(tableSongName);
            tbody.appendChild(tableSinger);
            tbody.appendChild(tableBtn);
            songOrder.appendChild(tbody);
        });
    }
})

const body = document.querySelector("body"),
    sidebar = body.querySelector(".sidebar"),
    toggle = body.querySelector(".toggle"),
    searchBtn = body.querySelector(".search-box"),
    modeSwitch = body.querySelector(".toggle-switch"),
    modeText = body.querySelector(".mode-text")

toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
});
if (playlistStatus) {
    if (playlistStatus.value == true) {
        socket.emit("playlistAdd", { status: true, cafe })
    }
}

function voteStart() {
	if (document.getElementById("voteButton").classList.contains('btn-outline-danger')) {
        document.getElementById("voteButton").innerHTML = 'Oylamayı Başlat';
        document.getElementById("voteButton").classList.remove('btn-outline-danger');
        document.getElementById("voteButton").classList.add('btn-outline-info');
        socket.emit("voteStart", { status: false, cafe });
        console.log('voteStop');
    }
    else {
        document.getElementById("voteButton").innerHTML = 'Oylamayı Durdur';
        document.getElementById("voteButton").classList.add('btn-outline-danger');
        document.getElementById("voteButton").classList.remove('btn-outline-info');
        socket.emit("voteStart", { status: true, cafe });
        console.log('voteStart');
    }
}

