// YouTube Data API Anahtarınızı buraya ekleyin
var API_KEY = "AIzaSyDK0DaukVPjG3W1HPy4kfCwni4Tp6UFZ4U";

// Google API Kütüphanesini yükle
gapi.load('client', start);

function start() {
  // YouTube API'yi yükle
  gapi.client.init({
    'apiKey': API_KEY,
    'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
  }).then(function() {
    // Çalma listesi oluştur
    createPlaylist("Yeni Çalma Listesi", "Bu çalma listesi için açıklama").then(function(playlistId) {
      // Çalma listesine videoları ekle
      var videoLinks = [
        "https://www.youtube.com/watch?v=VIDEO_ID_1",
        "https://www.youtube.com/watch?v=VIDEO_ID_2",
        // Buraya eklemek istediğiniz diğer video linklerini ekleyin
      ];
      addVideosToPlaylist(playlistId, videoLinks);
    }).catch(function(error) {
      console.error("Çalma listesi oluşturma hatası:", error);
    });
  });
}

function createPlaylist(title, description) {
  return gapi.client.youtube.playlists.insert({
    part: "snippet",
    resource: {
      snippet: {
        title: title,
        description: description
      }
    }
  }).then(function(response) {
    console.log("Çalma listesi oluşturuldu:", response.result);
    return response.result.id;
  });
}

function addVideosToPlaylist(playlistId, videoLinks) {
  videoLinks.forEach(function(link) {
    var videoId = link.split("v=")[1];
    gapi.client.youtube.playlistItems.insert({
      part: "snippet",
      resource: {
        snippet: {
          playlistId: playlistId,
          resourceId: {
            kind: "youtube#video",
            videoId: videoId
          }
        }
      }
    }).then(function(response) {
      console.log("Video başarıyla eklendi:", link);
    }).catch(function(error) {
      console.error("Video ekleme hatası:", error);
    });
  });
}
