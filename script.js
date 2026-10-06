document.body.classList.add('intro-active');

window.addEventListener('load', () => {
  const intro = document.getElementById('intro');
  window.setTimeout(() => intro.classList.add('open'), 1750);
  window.setTimeout(() => {
    intro.remove();
    document.body.classList.remove('intro-active');
  }, 3600);
});

// Основной обсервер для .reveal
const reveal = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      reveal.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal:not(.track-left):not(.track-right)').forEach((element) => {
  reveal.observe(element);
});

// Обсервер для треков
const trackObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      trackObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.track-left, .track-right').forEach((track) => {
  trackObserver.observe(track);
});

// Меню
const menuButton = document.getElementById('menuButton');
const menu = document.getElementById('menu');
menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('show');
  menuButton.setAttribute('aria-expanded', String(open));
});
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('show');
  menuButton.setAttribute('aria-expanded', 'false');
}));

// Кнопка "смотреть сначала"
document.getElementById('replay').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ========== АУДИО ПЛЕЕР ==========
const tracks = [
  {
    title: 'Буря, метель и мгла',
    artist: 'Mzlff, Канги',
    cover: 'track1.jpg',
    file: 'track1.mp3'
  },
  {
    title: 'Это не мой вайб',
    artist: 'СТИНТ',
    cover: 'track2.jpg',
    file: 'track2.mp3'
  },
  {
    title: 'Киношка',
    artist: 'Мелшер & 5орока',
    cover: 'track3.jpg',
    file: 'track3.mp3'
  }
];

const playerContainer = document.getElementById('playerContainer');
const playBtn = document.getElementById('playBtn');
const closePlayer = document.getElementById('closePlayer');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playerCover = document.getElementById('playerCover').querySelector('img');
const progressFill = document.getElementById('progressFill');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');

let audio = new Audio();
let currentTrackIndex = 0;
let isPlaying = false;
let isPlayerVisible = false;

function loadTrack(index) {
  const track = tracks[index];
  if (!track) return;

  audio.src = track.file;
  audio.load();

  playerTitle.textContent = track.title;
  playerArtist.textContent = track.artist;
  playerCover.src = track.cover;

  currentTrackIndex = index;

  document.querySelectorAll('.track').forEach((el, i) => {
    el.classList.toggle('active-track', i === index);
  });

  progressFill.style.width = '0%';
  currentTimeEl.textContent = '0:00';

  showPlayer();
}

function showPlayer() {
  if (!isPlayerVisible) {
    playerContainer.classList.add('active');
    isPlayerVisible = true;
  }
}

function hidePlayer() {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    playBtn.textContent = '▶';
  }
  playerContainer.classList.remove('active');
  isPlayerVisible = false;
}

function togglePlay() {
  if (!audio.src) {
    loadTrack(0);
    setTimeout(() => audio.play(), 100);
    isPlaying = true;
    playBtn.textContent = '⏸';
    return;
  }

  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    playBtn.textContent = '▶';
  } else {
    audio.play();
    isPlaying = true;
    playBtn.textContent = '⏸';
  }
}

function updateProgress() {
  if (audio.duration) {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${progress}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    totalTimeEl.textContent = formatTime(audio.duration);
  }
}

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function seekTrack(e) {
  const rect = progressBar.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  if (audio.duration) {
    audio.currentTime = percent * audio.duration;
  }
}

function nextTrack() {
  const next = (currentTrackIndex + 1) % tracks.length;
  loadTrack(next);
  if (isPlaying) {
    setTimeout(() => audio.play(), 100);
  } else {
    audio.play();
    isPlaying = true;
    playBtn.textContent = '⏸';
  }
}

// ===== СОБЫТИЯ =====
document.querySelectorAll('.track-content').forEach((element) => {
  element.addEventListener('click', function () {
    const trackIndex = parseInt(this.closest('.track').dataset.track);
    if (isNaN(trackIndex)) return;

    if (currentTrackIndex === trackIndex && isPlaying) {
      togglePlay();
      return;
    }

    loadTrack(trackIndex);
    audio.play();
    isPlaying = true;
    playBtn.textContent = '⏸';
  });
});

playBtn.addEventListener('click', togglePlay);
closePlayer.addEventListener('click', hidePlayer);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
  totalTimeEl.textContent = formatTime(audio.duration);
});
audio.addEventListener('ended', nextTrack);
progressBar.addEventListener('click', seekTrack);

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && isPlayerVisible) {
    e.preventDefault();
    togglePlay();
  }
  if (e.code === 'ArrowRight' && isPlayerVisible) {
    e.preventDefault();
    nextTrack();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && isPlaying) {
    audio.pause();
    isPlaying = false;
    playBtn.textContent = '▶';
  }
});

// ========== ЗАЩИТА ОТ КОПИРОВАНИЯ ==========
document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'a') e.preventDefault();
  if ((e.ctrlKey || e.metaKey) && e.key === 'c') e.preventDefault();
  if ((e.ctrlKey || e.metaKey) && e.key === 'x') e.preventDefault();
  if ((e.ctrlKey || e.metaKey) && e.key === 's') e.preventDefault();
  if ((e.ctrlKey || e.metaKey) && e.key === 'u') e.preventDefault();
  if (e.key === 'F12') e.preventDefault();
});
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());
document.addEventListener('selectstart', (e) => e.preventDefault());

console.log('🔒 Защита от копирования включена');