const { google } = require('googleapis');
const apiKey = 'AIzaSyDK0DaukVPjG3W1HPy4kfCwni4Tp6UFZ4U'; // Google Cloud Console'dan aldığınız API anahtarını buraya ekleyin

const youtube = google.youtube('v3');

function getPlaylistIdFromUrl(url) {
    // URL'den parametreleri al
    const urlObject = new URL(url);
    const searchParams = new URLSearchParams(urlObject.search);
  
    // Playlist ID'sini çıkar
    const playlistId = searchParams.get('list');
  
    return playlistId;
  }

function convertDurationToSeconds(duration) {
  // "PT3M27S" formatındaki süreyi saniyeye çevirme
  const matches = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  const hours = matches[1] ? parseInt(matches[1], 10) : 0;
  const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
  const seconds = matches[3] ? parseInt(matches[3], 10) : 0;

  // Toplam süreyi saniyeye çevirme
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds;
}
  
async function getPlaylistItems(playlistId, cafe) {
    playlistId = getPlaylistIdFromUrl(playlistId);
    try {
      let nextPageToken = null;
      const videoDetails = [];
  
      do {
        const response = await youtube.playlistItems.list({
          key: apiKey,
          part: 'snippet',
          playlistId: playlistId,
          maxResults: 50,
          pageToken: nextPageToken,
        });
  
        const videos = response.data.items;
  
        for (const video of videos) {
          const videoId = video.snippet.resourceId.videoId;
  
          try {
            const videoInfo = await youtube.videos.list({
              key: apiKey,
              part: 'snippet,contentDetails',
              id: videoId,
            });
  
            // Kontrol: Eğer video kaldırılmış veya gizlenmişse, bu videoyu atla
            if (!videoInfo.data.items.length) {
              console.log(`Video ID ${videoId} kaldırılmış veya gizlenmiş. Atlanıyor.`);
              continue;
            }
  
            const videoDetailsItem = {
              songName: videoInfo.data.items[0].snippet.title,
              thumbnail: videoInfo.data.items[0].snippet.thumbnails.default.url,
              singer: videoInfo.data.items[0].snippet.channelTitle,
              songLink: `https://www.youtube.com/watch?v=${videoInfo.data.items[0].id}`,
              vote: 0,
              songDuration: convertDurationToSeconds(videoInfo.data.items[0].contentDetails.duration),
            };
  
            videoDetails.push(videoDetailsItem);
          } catch (error) {
            console.error(`Video ID ${videoId} bilgileri alınamadı. Hata:`, error.message);
          }
        }
  
        // Bir sonraki sayfa varsa nextPageToken'ı güncelle
        nextPageToken = response.data.nextPageToken;
  
      } while (nextPageToken);
  
      return videoDetails;
    } catch (error) {
      return error;
    }
  }

async function getPlaylistTitleFromUrl(url) {
    try {
      // Playlist ID'sini al
      const playlistId = getPlaylistIdFromUrl(url);
  
      // YouTube API'ye HTTP isteği yapın
      const response = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`);
      const data = await response.json();
  
      // Playlist ismini al
      const playlistTitle = data.items[0].snippet.title;
  
      return playlistTitle;
    } catch (error) {
      return error;
    }
  }

module.exports.plTitle = async function playlistTitle(playlistUrl) {    
    try {
      const playlistTitle = await getPlaylistTitleFromUrl(playlistUrl);
      return playlistTitle; 
    } catch (error) {
      throw new Error("Bu oynatma listesi bulunamadı veya geçersiz bir URL'dir.");
    }
  }

module.exports.plInfos = async function playlistInfos(playlistUrl, cafe) {
    try {
        const playlistInfo = getPlaylistItems(playlistUrl, cafe);
        return playlistInfo;
    }
    catch (error){
        throw new Error("Bu oynatma listesi bulunamadı veya geçersiz bir URL'dir.");
    }
}
  