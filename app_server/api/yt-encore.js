const { google } = require('googleapis');

const apiKey = 'AIzaSyDK0DaukVPjG3W1HPy4kfCwni4Tp6UFZ4U'; // Google Cloud Console'dan aldığınız API anahtarını buraya ekleyin
const youtube = google.youtube('v3');

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

async function getVideoInfoByTitle(title) {
  try {
    const response = await youtube.search.list({
      key: apiKey,
      part: 'snippet',
      q: title,
      type: 'video',
      maxResults: 1,
    });

    const video = response.data.items[0];

    if (!video) {
      throw new Error('Şarkı bulunamadı');
    }

    const videoId = video.id.videoId;
    const videoTitle = video.snippet.title;

    const videoDetails = await youtube.videos.list({
      key: apiKey,
      part: 'snippet,contentDetails',
      id: videoId,
    });

    const videoDuration = videoDetails.data.items[0].contentDetails.duration;
    const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

    return {
      songName: videoTitle,
      songLink: videoLink,
      songDuration: convertDurationToSeconds(videoDuration),
    };
  } catch (error) {
    throw new Error(`Şarkı bilgileri alınamadı. Hata: ${error.message}`);
  }
}

// Kullanım örneği
// const songTitle = 'Deustchland rammestain'; // Aranan şarkı adı
// getVideoInfoByTitle(songTitle)
//   .then(songInfo => {
//     console.log('Şarkı Bilgileri:', songInfo);
//   })
//   .catch(error => {
//     console.error('Hata:', error.message);
//   });


module.exports.nameToVideo = async function nameToVideo(videoName) {    
    try {
      const video = await getVideoInfoByTitle(videoName);
      return video; 
    } catch (error) {
      throw new Error("Bu şarkı bulunamadı veya yanlış bir şarkı adı girdin.");
    }
  }