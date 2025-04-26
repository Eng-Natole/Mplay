// Audio context and elements
let audioContext;
let audioElement;
let currentSong = null;
let isPlaying = false;

// Recently played data - now with audio URLs
const recentlyPlayed = [
  {
    ...musicLibrary[0],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    ...musicLibrary[2],
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    ...musicLibrary[4],
    audioUrl:
      "https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3",
  },
  {
    ...musicLibrary[6],
    audioUrl:
      "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
  },
];

// Add audio URLs to main library
musicLibrary.forEach((song, index) => {
  const urls = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3",
    "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
  ];
  song.audioUrl = urls[index % urls.length]; // cycle through URLs if more songs
});

// Generate music grid HTML - added data-audio attribute
let musicHtml = "";
musicLibrary.forEach((song) => {
  musicHtml += `
    <div class="music-item" data-id="${song.id}" data-audio="${song.audioUrl}">
      <div class="music-image-container">
        <img class="music-image" src="${song.image}" alt="${song.album}">
        <div class="play-button">▶</div>
      </div>
      <div class="music-title">${song.title}</div>
      <div class="music-artist">${song.artist}</div>
    </div>
  `;
});

// Generate recently played HTML
let recentHtml = "";
recentlyPlayed.forEach((song) => {
  recentHtml += `
    <div class="music-item" data-id="${song.id}" data-audio="${song.audioUrl}">
      <div class="music-image-container">
        <img class="music-image" src="${song.image}" alt="${song.album}">
        <div class="play-button">▶</div>
      </div>
      <div class="music-title">${song.title}</div>
      <div class="music-artist">${song.artist}</div>
    </div>
  `;
});

// Insert HTML into the page
document.querySelector(".js-music-grid").innerHTML = musicHtml;
document.querySelector(".js-recent-grid").innerHTML = recentHtml;

// Initialize audio
function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioElement = new Audio();

    // Create audio graph
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(audioContext.destination);

    console.log("Audio initialized successfully");
  } catch (error) {
    console.error("Error initializing audio:", error);
  }
}

// Play song function
async function playSong(song) {
  try {
    if (!audioContext) initAudio();

    // Pause current song if playing
    if (isPlaying) {
      audioElement.pause();
    }

    // Load new song
    audioElement.src = song.audioUrl;
    currentSong = song;

    // Attempt to play (may need user interaction on some browsers)
    await audioElement.play();
    isPlaying = true;
    playPauseButton.textContent = "⏸";

    // Update player UI
    updatePlayerUI(song);

    // Start progress updater
    startProgressUpdater();

    console.log("Now playing:", song.title);
  } catch (error) {
    console.error("Error playing song:", error);
    // Show error to user
    alert("Couldn't play song. Please try again.");
  }
}

// Update player UI
function updatePlayerUI(song) {
  const player = document.querySelector(".player-container");
  player.querySelector(".player-album-art").src = song.image;
  player.querySelector(".title").textContent = song.title;
  player.querySelector(".artist").textContent = song.artist;
}

// Progress bar updater
function startProgressUpdater() {
  // Clear any existing interval
  if (window.progressInterval) {
    clearInterval(window.progressInterval);
  }

  // Update progress every second
  window.progressInterval = setInterval(() => {
    if (audioElement.duration) {
      const progressPercent =
        (audioElement.currentTime / audioElement.duration) * 100;
      document.querySelector(".progress").style.width = `${progressPercent}%`;

      // Update time displays
      document.querySelector(".progress-time:first-child").textContent =
        formatTime(audioElement.currentTime);
      document.querySelector(".progress-time:last-child").textContent =
        formatTime(audioElement.duration);
    }
  }, 1000);
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Add event listeners to music items
document.querySelectorAll(".music-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    const songId = item.getAttribute("data-id");
    const song = musicLibrary.find((s) => s.id == songId);
    playSong(song);
  });
});

// Player controls
const playPauseButton = document.querySelector(".play-pause");
playPauseButton.addEventListener("click", togglePlayPause);

function togglePlayPause() {
  if (!currentSong) {
    // If nothing is playing, play the first song
    playSong(musicLibrary[0]);
    return;
  }

  if (isPlaying) {
    audioElement.pause();
    playPauseButton.textContent = "⏯";
    isPlaying = false;
  } else {
    audioElement
      .play()
      .then(() => {
        playPauseButton.textContent = "⏸";
        isPlaying = true;
      })
      .catch((error) => {
        console.error("Error resuming playback:", error);
      });
  }
}

// Progress bar click to seek
document.querySelector(".progress-bar").addEventListener("click", (e) => {
  if (!audioElement.duration) return;

  const progressBar = e.currentTarget;
  const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
  const progressBarWidth = progressBar.clientWidth;
  const seekPercentage = clickPosition / progressBarWidth;
  audioElement.currentTime = audioElement.duration * seekPercentage;
});

// Category navigation
document.querySelectorAll(".category-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelector(".category-item.active").classList.remove("active");
    item.classList.add("active");
    console.log("Category changed to:", item.textContent);

    // Here you would typically filter/load songs for this category
    // For now we'll just log it
  });
});

// Initialize audio when user first interacts (required by some browsers)
document.body.addEventListener(
  "click",
  function initOnClick() {
    if (!audioContext) {
      initAudio();
    }
    document.body.removeEventListener("click", initOnClick);
  },
  { once: true }
);
