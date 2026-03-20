/**
 * BootyQuake Official - Site Interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
  const header = document.querySelector('.header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const socialHeader = document.querySelector('.social-header');

  // Header scroll effect
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check

  // Mobile menu toggle
  const navWrap = document.querySelector('.header-nav-wrap');
  menuToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    navWrap?.classList.toggle('open');
    const isOpen = navWrap?.classList.contains('open');
    menuToggle?.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on nav link click
  document.querySelectorAll('.nav a, .social-header a').forEach(link => {
    link.addEventListener('click', () => {
      navWrap?.classList.remove('open');
      menuToggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navWrap?.classList.contains('open') && !header?.contains(e.target)) {
      navWrap.classList.remove('open');
      menuToggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Smooth scroll for anchor links (enhance native behavior)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Contact form handler (placeholder - connect to your backend)
  document.querySelector('.contact-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    // TODO: Send to your API or form service (Formspree, Netlify Forms, etc.)
    console.log('Contact form submitted', Object.fromEntries(data));
    alert('Thanks! We\'ll get back to you soon.');
    form.reset();
  });

  // Newsletter form handler
  document.querySelector('.newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input[type="email"]');
    // TODO: Connect to your email service (Mailchimp, ConvertKit, etc.)
    console.log('Newsletter signup:', input?.value);
    alert('You\'re in! Check your inbox for drops.');
    e.target.reset();
  });

  // Video hub – thumbnails load videos in embed (no redirect to YouTube)
  const videoThumbnails = document.getElementById('video-thumbnails');
  const videoPlayerWrap = document.querySelector('.video-player-wrap');
  const ytPlayerEl = document.getElementById('yt-player');
  if (videoThumbnails && ytPlayerEl) {
    function getYoutubeId(url) {
      if (!url || typeof url !== 'string') return null;
      const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      return m ? m[1] : null;
    }
    let ytPlayer = null;
    let pendingVideoId = null;

    function ensureMuted() {
      try {
        if (ytPlayer?.mute) ytPlayer.mute();
        if (ytPlayer?.setVolume) ytPlayer.setVolume(0);
      } catch (_) {}
    }

    function loadYtVideo(videoId) {
      if (!videoId) return;
      if (typeof YT !== 'undefined' && YT.Player) {
        if (ytPlayer) {
          ytPlayer.loadVideoById(videoId);
          ensureMuted();
        } else {
          ytPlayer = new YT.Player('yt-player', {
            videoId: videoId,
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 1,
              mute: 1,
              rel: 0,
              modestbranding: 1,
              iv_load_policy: 3,
              enablejsapi: 1,
              origin: window.location.origin,
              playsinline: 1,
              fs: 1
            },
            events: {
              onReady: () => ensureMuted(),
              onStateChange: (e) => { if (e.data === 1) ensureMuted(); }
            }
          });
          window.__ytPlayer = ytPlayer;
        }
        videoPlayerWrap?.classList.add('has-video');
        const capture = document.getElementById('video-click-capture');
        const fullscreenEl = document.getElementById('hub-video-wrap') || videoPlayerWrap;
        const expandTarget = videoPlayerWrap?.closest('.hub-video-main') || videoPlayerWrap;
        const isMobileOrIOS = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth < 768);
        function toggleFullscreen() {
          if (!expandTarget) return;
          const isExpanded = expandTarget.classList.contains('video-expanded');
          const isNativeFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
          if (isExpanded || isNativeFs) {
            if (isNativeFs) (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
            expandTarget.classList.remove('video-expanded');
            return;
          }
          if (isMobileOrIOS) {
            expandTarget.classList.add('video-expanded');
            return;
          }
          try {
            if (fullscreenEl?.requestFullscreen) fullscreenEl.requestFullscreen();
            else if (fullscreenEl?.webkitRequestFullscreen) fullscreenEl.webkitRequestFullscreen();
            else expandTarget.classList.add('video-expanded');
          } catch (_) {
            expandTarget.classList.add('video-expanded');
          }
        }
        if (!window.__bootyquakeFullscreenListeners) {
          window.__bootyquakeFullscreenListeners = true;
          document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) document.querySelector('.hub-video-main.video-expanded')?.classList.remove('video-expanded');
          });
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') document.querySelector('.hub-video-main.video-expanded')?.classList.remove('video-expanded');
          });
        }
        if (capture) {
          capture.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isExpanded = expandTarget?.classList.contains('video-expanded');
            if (isMobileOrIOS) {
              if (isExpanded) {
                expandTarget?.classList.remove('video-expanded');
              } else {
                expandTarget?.classList.add('video-expanded');
              }
              return;
            }
            try {
              const s = window.__ytPlayer?.getPlayerState?.();
              if (s === 1) {
                window.__ytPlayer?.pauseVideo?.();
                document.getElementById('bootyquake-audio')?.pause();
              } else {
                window.__ytPlayer?.playVideo?.();
                document.getElementById('bootyquake-audio')?.play().catch(() => {});
              }
            } catch (_) {}
          };
        }
      } else {
        pendingVideoId = videoId;
      }
    }

    window.onYouTubeIframeAPIReady = function() {
      if (pendingVideoId) {
        loadYtVideo(pendingVideoId);
        pendingVideoId = null;
      }
    };

    function getThumbUrl(videoId) {
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    }

    function loadVideos() {
      if (window.__videosLoaded) return;
      window.__videosLoaded = true;
      fetch('./videos.json')
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(videos => {
          window.__bootyquakeVideos = videos;
          videoThumbnails.innerHTML = '';
          videos.forEach((v, videoIndex) => {
            const videoId = v.platform === 'youtube' ? getYoutubeId(v.url) : null;
            const thumbUrl = videoId ? getThumbUrl(videoId) : null;
            const trackId = v.trackId || null;
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'video-thumb-item';
            item.dataset.videoIndex = String(videoIndex);
            item.dataset.trackId = trackId || '';
            item.title = v.title || '';
            if (thumbUrl) {
              item.innerHTML = `<img src="${thumbUrl}" alt="" loading="lazy" decoding="async">`;
            } else {
              item.innerHTML = `<div class="thumb-placeholder">—</div>`;
            }
            item.addEventListener('click', (e) => {
              e.preventDefault();
              document.querySelectorAll('.video-thumb-item').forEach(el => el.classList.remove('active'));
              item.classList.add('active');
              const vid = v.platform === 'youtube' ? getYoutubeId(v.url) : null;
              const vidx = parseInt(item.dataset.videoIndex, 10) || 0;
              window.__bootyquakeCurrentVideoIndex = vidx;
              if (vid) loadYtVideo(vid);
              try { window.__ytPlayer?.playVideo?.(); } catch (_) {}
              const loadTrack = window.__bootyquakeLoadTrack;
              if (loadTrack && trackId) {
                const idx = playlist.findIndex(t => t.id === trackId);
                if (idx >= 0) {
                  loadTrack(idx);
                  const aud = document.getElementById('bootyquake-audio');
                  if (aud) aud.play().catch(() => {});
                }
              }
            });
            videoThumbnails.appendChild(item);
          });
          window.__bootyquakeSelectVideoByIndex = function(idx) {
            const vids = window.__bootyquakeVideos || [];
            if (idx < 0 || idx >= vids.length) return;
            const v = vids[idx];
            const videoId = v?.platform === 'youtube' ? getYoutubeId(v.url) : null;
            if (videoId) loadYtVideo(videoId);
            window.__bootyquakeCurrentVideoIndex = idx;
            document.querySelectorAll('.video-thumb-item').forEach((el) => el.classList.toggle('active', parseInt(el.dataset.videoIndex, 10) === idx));
          };
          if (videos.length && (window.__bootyquakeCurrentVideoIndex ?? 0) === 0) {
            window.__bootyquakeSelectVideoByIndex(0);
          }
        })
        .catch(() => {
          videoThumbnails.innerHTML = '<p class="videos-empty">Add videos to <code>videos.json</code>.</p>';
        });
    }
    const hubSection = document.getElementById('music');
    if (hubSection && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) loadVideos();
      }, { rootMargin: '200px' });
      io.observe(hubSection);
    } else {
      loadVideos();
    }
  }

  // ========== Music player (no lyrics) ==========
  const audio = document.getElementById('bootyquake-audio');
  const audioPlayBtn = document.getElementById('audio-play-pause');
  const trackDisplay = document.getElementById('track-display');
  const audioTimeDisplay = document.getElementById('audio-time');
  const audioSeekBar = document.getElementById('audio-seek-bar');
  const audioSeekFill = document.getElementById('audio-seek-fill');
  const audioSeekThumb = document.getElementById('audio-seek-thumb');

  const playlist = [
    { src: './audio/block-party-bootyquake.mp3', title: 'Block Party Bootyquake', id: 'block-party-bootyquake' },
    { src: './audio/Neon-Thong-Vision.mp3', title: 'Neon Thong Vision', id: 'neon-thong-vision' },
    { src: './audio/queens-of-the-shakes.mp3', title: 'Queen of the Quake', id: 'queens-of-the-shakes' },
    { src: './audio/bounce-back-booty.mp3', title: 'Bounce Back Booty', id: 'bounce-back-booty' },
    { src: './audio/scam-and-shake.mp3', title: 'Scam and Shake', id: 'scam-and-shake' },
    { src: './audio/strip-to-the-top.mp3', title: 'Strip to the Top', id: 'strip-to-the-top' },
    { src: './audio/rachet-earthquake.mp3', title: 'Rachet Earthquake', id: 'rachet-earthquake' },
    { src: './audio/precious-things.mp3', title: 'Precious Things', id: 'precious-things' },
    { src: './audio/boss-that-booty.mp3', title: 'Boss That Booty', id: 'boss-that-booty' },
    { src: './audio/royal-life.mp3', title: 'Royal Life', id: 'royal-life' },
    { src: './audio/loyal-love-righteous-life.mp3', title: 'Loyal Love / Righteous Life', id: 'loyal-love-righteous-life' },
    { src: './audio/life-is-amazing.mp3', title: 'LIFE IS AMAZING', id: 'life-is-amazing' },
    { src: './audio/billion-dollar-bitch-talk.mp3', title: 'Billion Dollar Bitch Talk', id: 'billion-dollar-bitch-talk' },
    { src: './audio/billionaire-daydreams.mp3', title: 'BILLIONAIRE DAYDREAMS', id: 'billionaire-daydreams' },
    { src: './audio/courtside-ass.mp3', title: 'Courtside Ass', id: 'courtside-ass' },
    { src: './audio/astro-booty.mp3', title: 'ASTRO BOOTY', id: 'astro-booty' },
    { src: './audio/fetch-that-monet.mp3', title: 'Fetch That Money', id: 'fetch-that-monet' },
    { src: './audio/shake-that-booty-please.mp3', title: 'Shake That Booty Please', id: 'shake-that-booty-please' },
    { src: './audio/ass-boost-party-anthem.mp3', title: 'Ass Boost Party Anthem', id: 'ass-boost-party-anthem' }
  ];

  let currentTrack = 0;

  function loadTrack(index) {
    if (!audio) return;
    if (index < 0 || index >= playlist.length) return;
    currentTrack = index;
    const track = playlist[index];
    if (!track) return;
    audio.src = track.src;
    trackDisplay.textContent = track.title;
    document.querySelectorAll('.track-list-item').forEach(el => {
      el.classList.toggle('active', el.dataset.track === track.id);
    });
    audio.load();
    audio.onerror = () => { trackDisplay.textContent = track.title + ' (add .mp3 to audio/)'; };
  }

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function updateTimeDisplay() {
    if (audioTimeDisplay && audio) {
      const d = audio.duration;
      audioTimeDisplay.textContent = formatTime(audio.currentTime) + ' / ' + (isFinite(d) && d > 0 ? formatTime(d) : '0:00');
    }
  }

  if (audio) {
    audio.addEventListener('play', () => {
      audioPlayBtn?.setAttribute('aria-label', 'Pause');
      audioPlayBtn && (audioPlayBtn.textContent = '⏸');
    });
    audio.addEventListener('pause', () => {
      audioPlayBtn?.setAttribute('aria-label', 'Play');
      audioPlayBtn && (audioPlayBtn.textContent = '▶');
    });
    audio.addEventListener('ended', () => {
      loadTrack((currentTrack + 1) % playlist.length);
      audio.play().catch(() => {});
    });
    audio.addEventListener('timeupdate', updateTimeDisplay);
    audio.addEventListener('loadedmetadata', () => { updateTimeDisplay(); updateSeekBar?.(); });
    audio.addEventListener('loadeddata', () => { updateTimeDisplay(); updateSeekBar?.(); });
    audio.addEventListener('canplay', () => { updateTimeDisplay(); updateSeekBar?.(); });
    audio.addEventListener('seeking', updateTimeDisplay);
    audio.addEventListener('seeked', updateTimeDisplay);

    audioPlayBtn?.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    });
  }

  document.getElementById('track-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.track-list-item');
    if (!btn) return;
    e.preventDefault();
    const trackId = btn.dataset.track;
    const idx = playlist.findIndex(t => t.id === trackId);
    if (idx >= 0 && audio) {
      loadTrack(idx);
      audio.play().catch(() => {});
      document.getElementById('music')?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  loadTrack(0);

  const seekDrag = { active: false };
  function seekTo(frac) {
    if (!audio) return;
    const d = audio.duration;
    if (!isFinite(d) || d <= 0) return;
    audio.currentTime = Math.max(0, Math.min(1, frac)) * d;
    updateTimeDisplay();
  }
  function updateSeekBar() {
    if (seekDrag.active) return;
    if (!audioSeekFill || !audio) return;
    const d = audio.duration;
    if (!isFinite(d) || d <= 0) return;
    const pct = (audio.currentTime / d) * 100;
    audioSeekFill.style.width = pct + '%';
    if (audioSeekThumb) audioSeekThumb.style.left = pct + '%';
    audioSeekBar?.setAttribute('aria-valuenow', Math.round(pct));
  }
  if (audioSeekBar && audioSeekFill) {
    function handleSeek(clientX) {
      const r = audioSeekBar.getBoundingClientRect();
      const frac = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      seekTo(frac);
      const pct = frac * 100;
      audioSeekFill.style.width = pct + '%';
      if (audioSeekThumb) audioSeekThumb.style.left = pct + '%';
      audioSeekBar?.setAttribute('aria-valuenow', Math.round(pct));
    }
    function handleTouchMove(e) {
      if (seekDrag.active && e.touches[0]) {
        e.preventDefault();
        handleSeek(e.touches[0].clientX);
      }
    }
    audioSeekBar.addEventListener('click', e => handleSeek(e.clientX));
    audioSeekBar.addEventListener('mousedown', e => { seekDrag.active = true; handleSeek(e.clientX); });
    audioSeekBar.addEventListener('touchstart', e => {
      seekDrag.active = true;
      if (e.touches[0]) handleSeek(e.touches[0].clientX);
    }, { passive: true });
    document.addEventListener('mousemove', e => { if (seekDrag.active && audioSeekBar) handleSeek(e.clientX); });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', () => { seekDrag.active = false; });
    document.addEventListener('touchend', () => { seekDrag.active = false; });
    audioSeekBar.addEventListener('keydown', (e) => {
      if (!audio || !audio.duration) return;
      const step = e.shiftKey ? 10 : 0.02;
      let frac = audio.currentTime / audio.duration;
      if (e.key === 'ArrowLeft' || e.key === 'Home') frac = e.key === 'Home' ? 0 : Math.max(0, frac - step);
      else if (e.key === 'ArrowRight' || e.key === 'End') frac = e.key === 'End' ? 1 : Math.min(1, frac + step);
      else return;
      e.preventDefault();
      seekTo(frac);
      updateSeekBar();
    });
  }
  if (audio) {
    audio.addEventListener('timeupdate', updateSeekBar);
    audio.addEventListener('loadedmetadata', updateSeekBar);
    audio.addEventListener('canplay', updateSeekBar);
  }

  window.__bootyquakeLoadTrack = loadTrack;

  document.getElementById('play-bootyquake')?.addEventListener('click', () => {
    document.getElementById('music')?.scrollIntoView({ behavior: 'smooth' });
    if (audio && audio.paused) {
      audio.play().catch(() => {});
    }
  });

  } catch (err) {
    console.error('BootyQuake init error:', err);
  }
});
