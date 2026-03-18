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

    function onYtStateChange(event) {
      window.__ytPlayerState = event.data;
      if (event.data === 1) ensureMuted();
      const videoBtn = document.getElementById('video-play-pause');
      if (videoBtn) {
        videoBtn.setAttribute('aria-label', event.data === 1 ? 'Pause video' : 'Play video');
        videoBtn.textContent = event.data === 1 ? '⏸' : '▶';
      }
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
              loop: 1,
              playlist: videoId,
              modestbranding: 1,
              iv_load_policy: 3,
              enablejsapi: 1,
              origin: window.location.origin,
              playsinline: 1,
              fs: 1
            },
            events: {
              onStateChange: onYtStateChange,
              onReady: () => ensureMuted()
            }
          });
          window.__ytPlayer = ytPlayer;
        }
        videoPlayerWrap?.classList.add('has-video');
        const capture = document.getElementById('video-click-capture');
        if (capture) {
          capture.onclick = () => {
            try {
              const p = window.__ytPlayer;
              if (!p || !p.getPlayerState) return;
              const s = p.getPlayerState();
              if (s === 1) p.pauseVideo?.();
              else p.playVideo?.();
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
            { src: './audio/booty-bag.mp3', title: 'BOOTY BAG', id: 'booty-bag' },
            { src: './audio/fetch-that-monet.mp3', title: 'Fetch That Money', id: 'fetch-that-monet' },
            { src: './audio/shake-that-booty-please.mp3', title: 'Shake That Booty Please', id: 'shake-that-booty-please' },
            { src: './audio/ass-boost-party-anthem.mp3', title: 'Ass Boost Party Anthem', id: 'ass-boost-party-anthem' }
          ];
          const audio = document.getElementById('bootyquake-audio');
          const videoPlayBtn = document.getElementById('video-play-pause');
          const audioPlayBtn = document.getElementById('audio-play-pause');
          videos.forEach((v, videoIndex) => {
            const videoId = v.platform === 'youtube' ? getYoutubeId(v.url) : null;
            const thumbUrl = videoId ? getThumbUrl(videoId) : null;
            const trackId = v.trackId || null;
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'video-thumb-item';
            item.dataset.trackId = trackId || '';
            item.dataset.videoIndex = String(videoIndex);
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
              const tid = item.dataset.trackId;
              const vidx = parseInt(item.dataset.videoIndex, 10) || 0;
              window.__bootyquakeCurrentVideoIndex = vidx;
              if (vid) loadYtVideo(vid);
              if (audio) {
                let idx = tid ? playlist.findIndex(t => t.id === tid) : -1;
                if (idx < 0) idx = vidx % playlist.length;
                if (idx >= 0) {
                  const loadTrack = window.__bootyquakeLoadTrack;
                  if (loadTrack) loadTrack(idx);
                  audio.play().catch(() => {});
                  videoPlayBtn?.setAttribute('aria-label', 'Pause video');
                  videoPlayBtn && (videoPlayBtn.textContent = '⏸');
                  audioPlayBtn?.setAttribute('aria-label', 'Pause');
                  audioPlayBtn && (audioPlayBtn.textContent = '⏸');
                  document.getElementById('hub-cta-bar')?.classList.add('playing');
                  try { window.__ytPlayer?.playVideo?.(); } catch (_) {}
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

  // Bootyquake Radio - Play music (no affiliate links)
  const playlist = [
    { src: './audio/block-party-bootyquake.mp3', title: 'Block Party Bootyquake', id: 'block-party-bootyquake', lyrics: true },
    { src: './audio/Neon-Thong-Vision.mp3', title: 'Neon Thong Vision', id: 'neon-thong-vision', lyrics: true },
    { src: './audio/queens-of-the-shakes.mp3', title: 'Queen of the Quake', id: 'queens-of-the-shakes', lyrics: true },
    { src: './audio/bounce-back-booty.mp3', title: 'Bounce Back Booty', id: 'bounce-back-booty', lyrics: true },
    { src: './audio/scam-and-shake.mp3', title: 'Scam and Shake', id: 'scam-and-shake', lyrics: true },
    { src: './audio/strip-to-the-top.mp3', title: 'Strip to the Top', id: 'strip-to-the-top', lyrics: true },
    { src: './audio/rachet-earthquake.mp3', title: 'Rachet Earthquake', id: 'rachet-earthquake', lyrics: true },
    { src: './audio/precious-things.mp3', title: 'Precious Things', id: 'precious-things', lyrics: true },
    { src: './audio/boss-that-booty.mp3', title: 'Boss That Booty', id: 'boss-that-booty', lyrics: true },
    { src: './audio/royal-life.mp3', title: 'Royal Life', id: 'royal-life', lyrics: true },
    { src: './audio/loyal-love-righteous-life.mp3', title: 'Loyal Love / Righteous Life', id: 'loyal-love-righteous-life', lyrics: true },
    { src: './audio/life-is-amazing.mp3', title: 'LIFE IS AMAZING', id: 'life-is-amazing', lyrics: true },
    { src: './audio/billion-dollar-bitch-talk.mp3', title: 'Billion Dollar Bitch Talk', id: 'billion-dollar-bitch-talk', lyrics: true },
    { src: './audio/billionaire-daydreams.mp3', title: 'BILLIONAIRE DAYDREAMS', id: 'billionaire-daydreams', lyrics: true },
    { src: './audio/courtside-ass.mp3', title: 'Courtside Ass', id: 'courtside-ass', lyrics: true },
    { src: './audio/astro-booty.mp3', title: 'ASTRO BOOTY', id: 'astro-booty', lyrics: true },
    { src: './audio/booty-bag.mp3', title: 'BOOTY BAG', id: 'booty-bag', lyrics: true },
    { src: './audio/fetch-that-monet.mp3', title: 'Fetch That Money', id: 'fetch-that-monet', lyrics: true },
    { src: './audio/shake-that-booty-please.mp3', title: 'Shake That Booty Please', id: 'shake-that-booty-please', lyrics: true },
    { src: './audio/ass-boost-party-anthem.mp3', title: 'Ass Boost Party Anthem', id: 'ass-boost-party-anthem', lyrics: true }
  ];

  // Block Party Bootyquake - Karaoke lyrics (timestamps in seconds, estimated)
  const blockPartyLyrics = [
    { time: 6, text: "Aye… We outside…" },
    { time: 10, text: "From the hood to the club to the front porch, we lit." },
    { time: 14, text: "Turn that block into a earthquake." },
    { time: 20, text: "Pop out fresh, lil' wig, big step," },
    { time: 23, text: "Hood bitch walk, got the whole block swept." },
    { time: 26, text: "Speaker in the trunk, on the porch, in the grass," },
    { time: 29, text: "Soon as beat drop, everybody see ass." },
    { time: 34, text: "Kids on the bikes, aunties on the stoop," },
    { time: 37, text: "Grannies in the window tryna watch the whole group." },
    { time: 40, text: "We ain't got much but the vibe on ten," },
    { time: 43, text: "We'll turn one street light to a full-time sin." },
    { time: 48, text: "Broke lil' check but my heart real rich," },
    { time: 51, text: "We don't need no club, we gon' twerk in the ditch." },
    { time: 54, text: "Gas tank low, but the spirits all hit," },
    { time: 57, text: "When the homie hit play, we forget that shit." },
    { time: 62, text: "Best friend single, other friend stressed," },
    { time: 65, text: "One just lost her job, she still came dressed." },
    { time: 68, text: "We gon' shake anyway, even if life mess," },
    { time: 71, text: "'Cause the bass too loud, can't feel that stress." },
    { time: 77, text: "Hands on ya knees if you ever felt stuck," },
    { time: 80, text: "If your life been hard but you still show up." },
    { time: 83, text: "Shake for the pain that you hold in your chest," },
    { time: 86, text: "Now shake 'cause you here and you still so blessed." },
    { time: 92, text: "Block party bootyquake, shake the concrete," },
    { time: 96, text: "From the porch to the street, feel it under your feet." },
    { time: 100, text: "If you broke, if you paid, if you hurt, if you straight," },
    { time: 104, text: "We gon' dance all night, make the block vibrate." },
    { time: 109, text: "Bootyquake, bootyquake, let the whole hood roar," },
    { time: 113, text: "We ain't rich, but we rich 'cause we got each other more." },
    { time: 117, text: "From the projects to the suburbs, same 808," },
    { time: 121, text: "Everybody got problems, this the great escape." },
    { time: 128, text: "Section 8 baby with a million-dollar bounce," },
    { time: 131, text: "Turn a sad lil' day to a joy bank account." },
    { time: 134, text: "Neighbor call cops, we just turn it up more," },
    { time: 137, text: "If the bass too low, what we livin' life for?" },
    { time: 142, text: "Homegirl pregnant, still hittin' lil' sway," },
    { time: 145, text: "Only two months in, so it's cool, they say." },
    { time: 148, text: "Other friend gay, her girl front row," },
    { time: 151, text: "Both throwin' that thang, let the whole block know." },
    { time: 156, text: "Homies on the dice, tryna double they lot," },
    { time: 159, text: "Ain't no bottles on ice, just a cooler on the spot." },
    { time: 162, text: "But the way that we move, you would swear we on top," },
    { time: 165, text: "Any lil' empty street, that's our own rooftop." },
    { time: 171, text: "Hands on ya knees if you ever felt stuck," },
    { time: 174, text: "If your life been hard but you still show up." },
    { time: 177, text: "Shake for the pain that you hold in your chest," },
    { time: 180, text: "Now shake 'cause you here and you still so blessed." },
    { time: 186, text: "Block party bootyquake, shake the concrete," },
    { time: 190, text: "From the porch to the street, feel it under your feet." },
    { time: 194, text: "If you broke, if you paid, if you hurt, if you straight," },
    { time: 198, text: "We gon' dance all night, make the block vibrate." },
    { time: 203, text: "Bootyquake, bootyquake, let the whole hood roar," },
    { time: 207, text: "We ain't rich, but we rich 'cause we got each other more." },
    { time: 211, text: "From the projects to the suburbs, same 808," },
    { time: 215, text: "Everybody got problems, this the great escape." },
    { time: 222, text: "Left cheek, right cheek, let it go dumb," },
    { time: 225, text: "(\"Go dumb!\")" },
    { time: 228, text: "Shake for the times you ain't have no funds," },
    { time: 231, text: "(\"No funds!\")" },
    { time: 234, text: "Drop for the homies that ain't see this year," },
    { time: 237, text: "(\"This year!\")" },
    { time: 240, text: "Now clap 'cause you made it, you still right here." },
    { time: 243, text: "(\"Right here!\")" },
    { time: 249, text: "Block party bootyquake, shake the concrete," },
    { time: 253, text: "From the porch to the street, feel it under your feet." },
    { time: 257, text: "If you broke, if you paid, if you hurt, if you straight," },
    { time: 261, text: "We gon' dance all night, make the block vibrate." },
    { time: 266, text: "Bootyquake, bootyquake, let the whole hood roar," },
    { time: 270, text: "We ain't rich, but we rich 'cause we got each other more." },
    { time: 274, text: "From the projects to the suburbs, same 808," },
    { time: 278, text: "Everybody got problems, this the great escape." },
    { time: 285, text: "Aye… We outside, 'member that…" },
    { time: 289, text: "Bootyquake on every block." }
  ];

  // Big Booty Hustle - Karaoke lyrics (timestamps in seconds, estimated)
  const bigBootyHustleLyrics = [
    { time: 6, text: "Big body… Big dreams…" },
    { time: 10, text: "If you ever got curves and a grind, this for you." },
    { time: 14, text: "Ayy, run that." },
    { time: 20, text: "Big body, big bag, yeah, they go together," },
    { time: 23, text: "Ass sit pretty like it wrote a love letter." },
    { time: 26, text: "Touch a lil' stage and the whole spot wetter," },
    { time: 29, text: "When I walk past, broke hoes get jealous." },
    { time: 34, text: "Gym in the morning, then I clock my shift," },
    { time: 37, text: "Clock out, clock in, let the waistline lift." },
    { time: 40, text: "Bills on the table, but the faith don't dip," },
    { time: 43, text: "I can twerk for the bag and still talk my shit." },
    { time: 48, text: "Boss in the daytime, thick at night," },
    { time: 51, text: "I don't need a BBL, this my birthright." },
    { time: 54, text: "Haters in the comments tryna dim my light," },
    { time: 57, text: "But my shape and my hustle both built for fight." },
    { time: 62, text: "She a full-time snack, part-time CEO," },
    { time: 65, text: "Got a side lil' show at the club for the dough." },
    { time: 68, text: "Ain't no shame in the shake when your dreams need glow," },
    { time: 71, text: "Big body, big plan, that's the combo." },
    { time: 77, text: "If you ever felt \"too much,\" baby, that's a lie," },
    { time: 80, text: "You just too much woman for a low-grade guy." },
    { time: 83, text: "Hands on ya knees, let the real you shine," },
    { time: 86, text: "We gon' turn every curve to a dollar sign." },
    { time: 92, text: "Big body hustle, every jiggle worth gold," },
    { time: 96, text: "Every stretch, every roll, that's a story untold." },
    { time: 100, text: "If the world ever tried to make you feel too thick," },
    { time: 104, text: "Turn around, let it clap, tell 'em \"choke on this.\"" },
    { time: 109, text: "Big body hustle, let it move on beat," },
    { time: 113, text: "You a blessing in the flesh from your head to your feet." },
    { time: 117, text: "From the clock-in shifts to the late-night stage," },
    { time: 121, text: "You a walking investment, not a minimum wage." },
    { time: 128, text: "She got thighs like a throne, hips like a boat," },
    { time: 131, text: "When she slide to the beat, everybody stay float." },
    { time: 134, text: "Lil' waist, big plate, yeah, she still gon' eat," },
    { time: 137, text: "She ain't starving for a man, she just star on the beat." },
    { time: 142, text: "Manager at work, then a menace in the club," },
    { time: 145, text: "Turn a nine-to-five stress to a midnight dub." },
    { time: 148, text: "HR voice when she send that mail," },
    { time: 151, text: "But her OnlyFans pics got a whole town pale." },
    { time: 156, text: "If a dude talk slick 'bout her size, that's dead," },
    { time: 159, text: "He in her DMs, still beggin' for the head." },
    { time: 162, text: "Confidence heavy, can't fit in his bed," },
    { time: 165, text: "She need a king-size check, not a clown in her thread." },
    { time: 170, text: "Every jiggle say \"so what?\" to the hate," },
    { time: 173, text: "Every clap say \"I'm enough\" to her fate." },
    { time: 176, text: "When she drop to the floor, that's a self-love quake," },
    { time: 179, text: "Thick body, thick faith, big moves, no break." },
    { time: 185, text: "If you ever felt \"too much,\" baby, that's a lie," },
    { time: 188, text: "You just too much woman for a low-grade guy." },
    { time: 191, text: "Hands on ya knees, let the real you shine," },
    { time: 194, text: "We gon' turn every curve to a dollar sign." },
    { time: 200, text: "Big body hustle, every jiggle worth gold," },
    { time: 204, text: "Every stretch, every roll, that's a story untold." },
    { time: 208, text: "If the world ever tried to make you feel too thick," },
    { time: 212, text: "Turn around, let it clap, tell 'em \"choke on this.\"" },
    { time: 217, text: "Big body hustle, let it move on beat," },
    { time: 221, text: "You a blessing in the flesh from your head to your feet." },
    { time: 225, text: "From the clock-in shifts to the late-night stage," },
    { time: 229, text: "You a walking investment, not a minimum wage." },
    { time: 236, text: "All my thick girls, put your hands up high," },
    { time: 239, text: "We ain't shrinkin' who we are just to please one guy." },
    { time: 242, text: "From the dressing room tears to the main floor lights," },
    { time: 245, text: "Now we dance for ourselves and our future nights." },
    { time: 251, text: "Big body hustle, every jiggle worth gold," },
    { time: 255, text: "Every stretch, every roll, that's a story untold." },
    { time: 259, text: "If the world ever tried to make you feel too thick," },
    { time: 263, text: "Turn around, let it clap, tell 'em \"choke on this.\"" },
    { time: 268, text: "Big body hustle, let it move on beat," },
    { time: 272, text: "You a blessing in the flesh from your head to your feet." },
    { time: 276, text: "From the clock-in shifts to the late-night stage," },
    { time: 280, text: "You a walking investment, not a minimum wage." },
    { time: 287, text: "Big body… big bag…" },
    { time: 290, text: "Big life." }
  ];

  // Bounce Back Booty - Karaoke lyrics (timestamps in seconds, estimated)
  const bounceBackBootyLyrics = [
    { time: 6, text: "Yeah… I took L's, I took hits…" },
    { time: 10, text: "But every time that bass drop, I feel rich." },
    { time: 14, text: "Bounce back season." },
    { time: 20, text: "Had days no gas, ride slow in the rain," },
    { time: 23, text: "Stomach on E, whole life on pain." },
    { time: 26, text: "Now I walk in, pockets heavy, no chain," },
    { time: 29, text: "Still the same hood nigga, just a different lane." },
    { time: 34, text: "Lil' brat in my lap, she gon' shake for the gang," },
    { time: 37, text: "Same block that was cold, now we lit off the flame." },
    { time: 40, text: "We was broke last year, now we poppin' champagne," },
    { time: 43, text: "We ain't change, just the numbers on the bank app changed." },
    { time: 48, text: "She a thick lil' vibe with a nine-to-five," },
    { time: 51, text: "But her side hustle lit when the club come alive." },
    { time: 54, text: "I respect how she move, how she work, how she strive," },
    { time: 57, text: "Ass clap to the beat, that's a \"we still alive.\"" },
    { time: 63, text: "If you ever been down bad, hands in the air," },
    { time: 66, text: "If you ever lost everything, still pulled up here." },
    { time: 69, text: "We gon' dance through the trial, through the mud, through the rain," },
    { time: 72, text: "Let that booty and the bass shake the weight off your brain." },
    { time: 78, text: "Bounce back booty, let it move on beat," },
    { time: 82, text: "Shake off pain, let it drop to your feet." },
    { time: 86, text: "If you ever took a loss, now you back in the mix," },
    { time: 90, text: "Every clap say \"fuck that, I'm lit.\"" },
    { time: 95, text: "Bounce back booty, every jiggle, every shake," },
    { time: 99, text: "Represent all the times you ain't break." },
    { time: 103, text: "From the trap to the club, from the block to the stage," },
    { time: 107, text: "We gon' turn every L to a wave." },
    { time: 114, text: "I remember lil' shorty used to cry in the dark," },
    { time: 117, text: "Now she twerk in the light, got a flame in her heart." },
    { time: 120, text: "She got kids, got bills, got rent, got scars," },
    { time: 123, text: "But the way she hit the floor put her pain in the stars." },
    { time: 128, text: "I'm just tryna run it up, never go back broke," },
    { time: 131, text: "But I still like throwin' ones just to laugh at the jokes." },
    { time: 134, text: "She ain't shakin' for my love, she just shakin' for hope," },
    { time: 137, text: "I'ma tip 'cause I know what it's like with no rope." },
    { time: 142, text: "Whole gang took hits, lost folks, lost time," },
    { time: 145, text: "But we all came out, now we all gon' shine." },
    { time: 148, text: "Let the DJ spin pain, let the bartender pour," },
    { time: 151, text: "We'll be bouncin' back bodies 'til we feel it no more." },
    { time: 157, text: "If you ever been down bad, hands in the air," },
    { time: 160, text: "If you ever lost everything, still pulled up here." },
    { time: 163, text: "We gon' dance through the trial, through the mud, through the rain," },
    { time: 166, text: "Let that booty and the bass shake the weight off your brain." },
    { time: 172, text: "Bounce back booty, let it move on beat," },
    { time: 176, text: "Shake off pain, let it drop to your feet." },
    { time: 180, text: "If you ever took a loss, now you back in the mix," },
    { time: 184, text: "Every clap say \"fuck that, I'm lit.\"" },
    { time: 189, text: "Bounce back booty, every jiggle, every shake," },
    { time: 193, text: "Represent all the times you ain't break." },
    { time: 197, text: "From the trap to the club, from the block to the stage," },
    { time: 201, text: "We gon' turn every L to a wave." },
    { time: 208, text: "Left cheek, right cheek, that's a comeback move," },
    { time: 211, text: "(\"Comeback move!\")" },
    { time: 214, text: "Shake it for the times you ain't know what to do," },
    { time: 217, text: "(\"What to do!\")" },
    { time: 220, text: "Drop low once, now rise up smooth," },
    { time: 223, text: "(\"Rise up!\")" },
    { time: 226, text: "Every bounce say \"I can't lose.\"" },
    { time: 232, text: "Bounce back booty, let it move on beat," },
    { time: 236, text: "Shake off pain, let it drop to your feet." },
    { time: 240, text: "If you ever took a loss, now you back in the mix," },
    { time: 244, text: "Every clap say \"fuck that, I'm lit.\"" },
    { time: 249, text: "Bounce back booty, every jiggle, every shake," },
    { time: 253, text: "Represent all the times you ain't break." },
    { time: 257, text: "From the trap to the club, from the block to the stage," },
    { time: 261, text: "We gon' turn every L to a wave." },
    { time: 268, text: "Yeah… We still here." },
    { time: 272, text: "Bounce back season forever." }
  ];

  // Scam and Shake - Karaoke lyrics (timestamps in seconds, estimated)
  const scamAndShakeLyrics = [
    { time: 6, text: "Ayy…" },
    { time: 10, text: "Where the scammers at? Where the ballers at?" },
    { time: 14, text: "If the card hittin' and the ass sittin'…" },
    { time: 18, text: "Yeah, this your song." },
    { time: 24, text: "I don't work jobs, baby, I work plans," },
    { time: 27, text: "Turn a weak lil' check to some big boy bands." },
    { time: 30, text: "If that nigga got a bag, I'ma make that dance," },
    { time: 33, text: "Shake it on his lap 'til he can't sit down." },
    { time: 38, text: "Walk in broke, leave out with a stash," },
    { time: 41, text: "Make a rich nigga cry when I dip with the cash." },
    { time: 44, text: "Ass so fat, I should tax this ass," },
    { time: 47, text: "Make him Zelle three times just to grab this ass." },
    { time: 52, text: "Ratchet lil' diva, I finesse with grace," },
    { time: 55, text: "He think he runnin' game, I'm just runnin' his Chase." },
    { time: 58, text: "If his card decline, he can move from my space," },
    { time: 61, text: "I need unlimited swipe when I shake this waist." },
    { time: 66, text: "Bad bitch manners with a scammer mentality," },
    { time: 69, text: "Turn a bottle to a bill, that's a club fatality." },
    { time: 72, text: "He say he love me, I say \"Where's your salary?\"" },
    { time: 75, text: "If it ain't six figures, he just boostin' my calorie." },
    { time: 81, text: "Where the niggas who spend that money? (Where?)" },
    { time: 84, text: "Where the ballers that don't move funny? (Huh?)" },
    { time: 87, text: "If you broke, take a seat in the back," },
    { time: 90, text: "This for racks on racks and ass on clap." },
    { time: 96, text: "Scam & shake, make his whole check break," },
    { time: 100, text: "If the card go through, let the whole club quake." },
    { time: 104, text: "Bend it over, hands down, let the fraud run wild," },
    { time: 108, text: "I'm a City Girl baby, I'ma do him foul." },
    { time: 113, text: "Scam & shake, we don't love no tricks," },
    { time: 117, text: "Just swipe, throw bands, then we hit that split." },
    { time: 121, text: "If you came for the free, boy, that's your mistake," },
    { time: 125, text: "This a money-only zone, we scam & shake." },
    { time: 132, text: "He a lil' scammer, I'm turnin' to a dancer," },
    { time: 135, text: "I make it clap like he got the right answer." },
    { time: 138, text: "Sit on it proper, got his brain on cancel," },
    { time: 141, text: "He wanna wife, I just want that transfer." },
    { time: 146, text: "Tap on the phone while I tap on the floor," },
    { time: 149, text: "He sendin' CashApp while I drop it some more." },
    { time: 152, text: "Blue strips flyin', I'm the chokehold whore," },
    { time: 155, text: "If the bank call back, I'ma be out the door." },
    { time: 160, text: "I don't date dudes, I just date these accounts," },
    { time: 163, text: "Big zips, big flips, big boy amounts." },
    { time: 166, text: "If he talk too much, then he must not rich," },
    { time: 169, text: "I need a quiet lil' flex, big spender type niche." },
    { time: 174, text: "I'm a nasty lil' freak, but the mind on stocks," },
    { time: 177, text: "Got a thong in the club and a safe with locks." },
    { time: 180, text: "If his wallet on swole, then my ass gon' rock," },
    { time: 183, text: "He say, \"Damn, girl,\" I say, \"Screenshot the doc.\"" },
    { time: 189, text: "Where the niggas who spend that money? (Where?)" },
    { time: 192, text: "Where the ballers that don't move funny? (Huh?)" },
    { time: 195, text: "If you broke, take a seat in the back," },
    { time: 198, text: "This for racks on racks and ass on clap." },
    { time: 204, text: "Scam & shake, make his whole check break," },
    { time: 208, text: "If the card go through, let the whole club quake." },
    { time: 212, text: "Bend it over, hands down, let the fraud run wild," },
    { time: 216, text: "I'm a City Girl baby, I'ma do him foul." },
    { time: 221, text: "Scam & shake, we don't love no tricks," },
    { time: 225, text: "Just swipe, throw bands, then we hit that split." },
    { time: 229, text: "If you came for the free, boy, that's your mistake," },
    { time: 233, text: "This a money-only zone, we scam & shake." },
    { time: 240, text: "Where the scammers at? (Here!)" },
    { time: 243, text: "Where the big spenders? (Here!)" },
    { time: 246, text: "If the money look right," },
    { time: 249, text: "Make that ass disappear." },
    { time: 255, text: "Scam & shake, make his whole check break," },
    { time: 259, text: "If the card go through, let the whole club quake." },
    { time: 263, text: "Bend it over, hands down, let the fraud run wild," },
    { time: 267, text: "I'm a City Girl baby, I'ma do him foul." },
    { time: 272, text: "Scam & shake, we don't love no tricks," },
    { time: 276, text: "Just swipe, throw bands, then we hit that split." },
    { time: 280, text: "If you came for the free, boy, that's your mistake," },
    { time: 284, text: "This a money-only zone, we scam & shake." },
    { time: 291, text: "Scam… and… shake…" },
    { time: 295, text: "Period." }
  ];

  // Strip to the Top - Karaoke lyrics (timestamps in seconds, estimated)
  const stripToTheTopLyrics = [
    { time: 6, text: "Yeah…" },
    { time: 10, text: "From the back of the club to the top of the charts…" },
    { time: 14, text: "We gon' shake for the bag and the comeback." },
    { time: 18, text: "Run that beat." },
    { time: 24, text: "Came in broke with my toes in the cold," },
    { time: 27, text: "Now I walk in lit, whole fit on gold." },
    { time: 30, text: "Name on the flyer, I was once on the pole," },
    { time: 33, text: "Same lil' ass, just a whole new role." },
    { time: 38, text: "Talk slick, baby, but the rent got due," },
    { time: 41, text: "Boss up hips, make the bands come through." },
    { time: 44, text: "Bounce for the lights, for the pain, for the crew," },
    { time: 47, text: "Every clap say \"bitch, I'm new.\"" },
    { time: 52, text: "Section in the back, we was waitin' in line," },
    { time: 55, text: "Now we own whole tables, pourin' shots on time." },
    { time: 58, text: "From the busted lace front to the frontal shine," },
    { time: 61, text: "From the bus stop nights to the first-class wine." },
    { time: 67, text: "If you ever had to dance for the lights to stay on," },
    { time: 70, text: "If you ever used the club 'cause your hope felt gone," },
    { time: 73, text: "If they ever called you \"hoe\" while you fed your home," },
    { time: 76, text: "Shake once for the tears, now shake 'cause you grown." },
    { time: 82, text: "Strip to the top, we ain't goin' back down," },
    { time: 86, text: "Ass movin' up while they talk in the crowd." },
    { time: 90, text: "Shake that pain, turn the broke to a flex," },
    { time: 94, text: "Turn that stage to a check, turn that check to respect." },
    { time: 99, text: "Strip to the top, let 'em laugh, we gon' win," },
    { time: 103, text: "Every twerk, every spin, that's a whole new begin." },
    { time: 107, text: "If they only see the thong, let 'em sleep on the plot," },
    { time: 111, text: "We was down on the floor just to rise to the top." },
    { time: 118, text: "She a bartender, dancer, mom and a nurse," },
    { time: 121, text: "Make the whole club happy, then she pray in the church." },
    { time: 124, text: "World say \"pick one,\" but she do every verse," },
    { time: 127, text: "Got a double-D grind for a double-shift curse." },
    { time: 132, text: "Broke boy typin' from his mama couch," },
    { time: 135, text: "Judgin' how she move while his lights go out." },
    { time: 138, text: "She payin' for her school, for her crib, for her clout," },
    { time: 141, text: "He payin' for Wi-Fi just to run his mouth." },
    { time: 146, text: "Hood girl, rich girl, both got bills," },
    { time: 149, text: "Both hit the floor just to chase them thrills." },
    { time: 152, text: "One shake trauma, one shake chills," },
    { time: 155, text: "Same bassline fixin' different ills." },
    { time: 161, text: "If you ever had to dance for the lights to stay on," },
    { time: 164, text: "If you ever used the club 'cause your hope felt gone," },
    { time: 167, text: "If they ever called you \"hoe\" while you fed your home," },
    { time: 170, text: "Shake once for the tears, now shake 'cause you grown." },
    { time: 176, text: "Strip to the top, we ain't goin' back down," },
    { time: 180, text: "Ass movin' up while they talk in the crowd." },
    { time: 184, text: "Shake that pain, turn the broke to a flex," },
    { time: 188, text: "Turn that stage to a check, turn that check to respect." },
    { time: 193, text: "Strip to the top, let 'em laugh, we gon' win," },
    { time: 197, text: "Every twerk, every spin, that's a whole new begin." },
    { time: 201, text: "If they only see the thong, let 'em sleep on the plot," },
    { time: 205, text: "We was down on the floor just to rise to the top." },
    { time: 212, text: "Hands on ya knees if you came from the mud," },
    { time: 215, text: "(\"From the mud!\")" },
    { time: 218, text: "Shake for the nights when you cried in the tub," },
    { time: 221, text: "(\"In the tub!\")" },
    { time: 224, text: "Drop for the fam that you hold on your back," },
    { time: 227, text: "(\"On your back!\")" },
    { time: 230, text: "Now clap for yourself 'cause you never did crack." },
    { time: 233, text: "(\"Never crack!\")" },
    { time: 239, text: "Strip to the top, we ain't goin' back down," },
    { time: 243, text: "Ass movin' up while they talk in the crowd." },
    { time: 247, text: "Shake that pain, turn the broke to a flex," },
    { time: 251, text: "Turn that stage to a check, turn that check to respect." },
    { time: 256, text: "Strip to the top, let 'em laugh, we gon' win," },
    { time: 260, text: "Every twerk, every spin, that's a whole new begin." },
    { time: 264, text: "If they only see the thong, let 'em sleep on the plot," },
    { time: 268, text: "We was down on the floor just to rise to the top." },
    { time: 275, text: "Yeah… Keep talkin'… we keep risin'." }
  ];

  // Rachet Earthquake - Karaoke lyrics (timestamps in seconds, estimated)
  const rachetEarthquakeLyrics = [
    { time: 6, text: "Aye…" },
    { time: 10, text: "Whole hood in this bitch…" },
    { time: 14, text: "If your ass fat, you an instrument tonight." },
    { time: 20, text: "Walk in ratchet, lace front lit," },
    { time: 23, text: "Ass so dumb, make a nerd talk spit." },
    { time: 26, text: "Thong up high, let it cut that waist," },
    { time: 29, text: "Pussy so loud, make the bass feel chased." },
    { time: 34, text: "Broke baby daddy in the back, look sick," },
    { time: 37, text: "He ain't payin' child support but he throwin' one brick." },
    { time: 40, text: "Hood hoes laughin', we don't want that man," },
    { time: 43, text: "We just want the blue strips, rubber band in hand." },
    { time: 49, text: "Club smell like Henny and exotic pack," },
    { time: 52, text: "Ratchet in the front, all the lames in the back." },
    { time: 55, text: "Hands on ya knees, let that hood shit clap," },
    { time: 58, text: "If you too pretty, still shake that ass." },
    { time: 64, text: "Ratchet earthquake, make the block go dumb," },
    { time: 68, text: "Bounce that ass 'til the neighbors go numb." },
    { time: 72, text: "Whole trap house feel the floor get weak," },
    { time: 76, text: "Every shake, every jiggle, that's a hood heartbeat." },
    { time: 81, text: "Ratchet earthquake, fuck bein' polite," },
    { time: 85, text: "We came here drunk, we gon' leave on sight." },
    { time: 89, text: "If you got a lil' ass, make it act real bad," },
    { time: 93, text: "Make the whole world say, \"damn, she mad.\"" },
    { time: 100, text: "Lil' ho tipsy, but the form on ten," },
    { time: 103, text: "Shakin' for the rent and her cousin in the pen." },
    { time: 106, text: "Section full of baddies, we don't dance for free," },
    { time: 109, text: "If the wallet look slim, tell him move from me." },
    { time: 114, text: "Nails on fleek, but the mind on stack," },
    { time: 117, text: "Ratchet with a plan, we ain't goin' back." },
    { time: 120, text: "Hood rich dreams in a Dollar Tree fit," },
    { time: 123, text: "But the way that she throw it, that's a million-dollar hit." },
    { time: 129, text: "Club smell like Henny and exotic pack," },
    { time: 132, text: "Ratchet in the front, all the lames in the back." },
    { time: 135, text: "Hands on ya knees, let that hood shit clap," },
    { time: 138, text: "If you too pretty, still shake that ass." },
    { time: 144, text: "Ratchet earthquake, make the block go dumb," },
    { time: 148, text: "Bounce that ass 'til the neighbors go numb." },
    { time: 152, text: "Whole trap house feel the floor get weak," },
    { time: 156, text: "Every shake, every jiggle, that's a hood heartbeat." },
    { time: 161, text: "Ratchet earthquake, fuck bein' polite," },
    { time: 165, text: "We came here drunk, we gon' leave on sight." },
    { time: 169, text: "If you got a lil' ass, make it act real bad," },
    { time: 173, text: "Make the whole world say, \"damn, she mad.\"" },
    { time: 180, text: "Drop it for the Section 8, shake it for the bills," },
    { time: 184, text: "Twerk it for the problems that been breakin' your will." },
    { time: 188, text: "Pop it for the homies that ain't never comin' home," },
    { time: 192, text: "We gon' make the block dance 'til we never feel alone." },
    { time: 198, text: "Ratchet… earthquake…" },
    { time: 202, text: "Let that ass talk, let the pain take a break." }
  ];

  // Precious Things - Karaoke lyrics (timestamps in seconds, estimated)
  const preciousThingsLyrics = [
    { time: 8, text: "You more than just that glamorous booty in them jeans" },
    { time: 12, text: "You a precious thing, queen living out her dreams" },
    { time: 16, text: "Beauty and wealth, but your soul stay clean" },
    { time: 20, text: "Girl, the way you light the room feel better than bling" },
    { time: 24, text: "All this life, all this love, all this shine on you" },
    { time: 28, text: "Fine face, fine body, but your mind fine too" },
    { time: 32, text: "If the world ever treat you like you less than true" },
    { time: 36, text: "Just remember God took his time making you" },
    { time: 44, text: "Yeah, I see the way you step, lil' glamorous walk" },
    { time: 48, text: "Curves in that dress, got the whole room stuck" },
    { time: 52, text: "But I listen when you speak, how you think, how you talk" },
    { time: 56, text: "That's the part that make me feel like I ain't ever had enough" },
    { time: 62, text: "You a 10 on the 'Gram, but in real life more" },
    { time: 66, text: "'Cause you still you fresh face at the corner store" },
    { time: 70, text: "Natural hair, sweatpants, that's my favorite form" },
    { time: 74, text: "You the type a J. Cole write a whole tape for" },
    { time: 80, text: "You love good food, we hit the spots in town" },
    { time: 84, text: "Laugh loud at the table, ain't just posing around" },
    { time: 88, text: "You want peace, want faith, want a righteous route" },
    { time: 92, text: "Want a man that see your value when the lights go out" },
    { time: 98, text: "You more than just that glamorous booty in them jeans" },
    { time: 102, text: "You a precious thing, queen living out her dreams" },
    { time: 106, text: "Beauty and wealth, but your soul stay clean" },
    { time: 110, text: "Girl, the way you light the room feel better than bling" },
    { time: 114, text: "All this life, all this love, all this shine on you" },
    { time: 118, text: "Fine face, fine body, but your mind fine too" },
    { time: 122, text: "If the world ever treat you like you less than true" },
    { time: 126, text: "Just remember God took his time making you" },
    { time: 134, text: "We talk money, but we talk about healing too" },
    { time: 138, text: "Like, what's a big house if it's cold in the room?" },
    { time: 142, text: "You said, \"I want wealth that my kids feel too" },
    { time: 146, text: "Not just bags, but a world they can build into.\"" },
    { time: 152, text: "You got goals, you got hustle, you ain't just look good" },
    { time: 156, text: "You invest, read books, still reppin' the hood" },
    { time: 160, text: "Type to pray 'fore we eat, then dance to the hook" },
    { time: 164, text: "Type to cry with your friends when they feeling overlooked" },
    { time: 170, text: "I could brag on your body 'til the beat run out" },
    { time: 174, text: "But I'd rather let 'em know what your heart about" },
    { time: 178, text: "How you love when it's hard, how you ride through doubt" },
    { time: 182, text: "How you stay when it's storm and you still reach out" },
    { time: 188, text: "You a diamond in a world tryna profit off pain" },
    { time: 192, text: "But you walk through the mess still staying the same" },
    { time: 196, text: "If they judge off looks, they ain't seeing your range" },
    { time: 200, text: "You a blessing in a dress, not a number or name" }
  ];

  // Boss That Booty - Karaoke lyrics (timestamps in seconds, estimated)
  const bossThatBootyLyrics = [
    { time: 6, text: "Yeah…" },
    { time: 10, text: "From the pole to the penthouse, we up now…" },
    { time: 14, text: "Aye, run that." },
    { time: 20, text: "Came from the back of the back, now the front row," },
    { time: 23, text: "Ass so mean, turn a lame to a John Doe." },
    { time: 26, text: "Clocked in days, now I clock in nights," },
    { time: 29, text: "Turn my stress to a check under neon lights." },
    { time: 34, text: "Boss in the morning, I sign my name," },
    { time: 37, text: "Bad in the evening, I bend that frame." },
    { time: 40, text: "Haters talk cheap, but the rent not low," },
    { time: 43, text: "So I shake what I got, let the whole club know." },
    { time: 49, text: "If you ever had nothin', put your hands in the air," },
    { time: 52, text: "If you ever paid bills off the sweat back there." },
    { time: 55, text: "We don't beg, we don't wait, we just get to it," },
    { time: 58, text: "808 hit, watch a real bitch do it." },
    { time: 64, text: "Boss up that booty, get your bag, lil' baby," },
    { time: 68, text: "Shake off the stress, let 'em call you crazy." },
    { time: 72, text: "Rent due soon? Make the floor go wild," },
    { time: 76, text: "Every clap, every bounce feed your inner child." },
    { time: 81, text: "Boss up that booty, we don't do no shame," },
    { time: 85, text: "Everybody got pain, we just flip that game." },
    { time: 89, text: "If life been hard, make the club your stage," },
    { time: 93, text: "Bad bitch energy, turn the page." },
    { time: 100, text: "She a single mom, still fine as hell," },
    { time: 103, text: "Kids sleep tight while she ring that bell." },
    { time: 106, text: "College loan heavy, but the booty got bail," },
    { time: 109, text: "Shake for the dreams, let the worries exhale." },
    { time: 114, text: "IG poppin', but the grind off-screen," },
    { time: 117, text: "Clockin' overtime just to live that dream." },
    { time: 120, text: "From the fryer, from the scrub, from the retail scene," },
    { time: 123, text: "Now she throw it on the beat like a money machine." },
    { time: 129, text: "If you ever had nothin', put your hands in the air," },
    { time: 132, text: "If you ever paid bills off the sweat back there." },
    { time: 135, text: "We don't beg, we don't wait, we just get to it," },
    { time: 138, text: "808 hit, watch a real bitch do it." },
    { time: 144, text: "Boss up that booty, get your bag, lil' baby," },
    { time: 148, text: "Shake off the stress, let 'em call you crazy." },
    { time: 152, text: "Rent due soon? Make the floor go wild," },
    { time: 156, text: "Every clap, every bounce feed your inner child." },
    { time: 161, text: "Boss up that booty, we don't do no shame," },
    { time: 165, text: "Everybody got pain, we just flip that game." },
    { time: 169, text: "If life been hard, make the club your stage," },
    { time: 173, text: "Bad bitch energy, turn the page." },
    { time: 180, text: "Hands on ya knees if you ever felt broke," },
    { time: 183, text: "(\"Felt broke!\")" },
    { time: 186, text: "Bounce if you turned every tear to a joke," },
    { time: 189, text: "(\"To a joke!\")" },
    { time: 192, text: "Shake if you know you the boss of your fate," },
    { time: 195, text: "(\"Of your fate!\")" },
    { time: 198, text: "Booty gon' talk, make the whole world quake." },
    { time: 204, text: "Boss up… boss up…" },
    { time: 208, text: "That booty's your raise, baby, boss up." }
  ];

  // Royal Life - Karaoke lyrics (timestamps in seconds, estimated)
  const royalLifeLyrics = [
    { time: 8, text: "Royal life, we at tables full of gold on the plates" },
    { time: 12, text: "Fine food, fine women, whole room feel great" },
    { time: 16, text: "From the jet to the yacht, we just float through states" },
    { time: 20, text: "Living like them royal families, money long, no breaks" },
    { time: 24, text: "Royal life, got a queen on my arm, that's Bey-type glow" },
    { time: 28, text: "All kinds of bad 10s in the seats, front row" },
    { time: 32, text: "From the feast to the flights, this the life we chose" },
    { time: 36, text: "Rich love, rich vibes, that's the way it goes" },
    { time: 44, text: "Five-course dinner in a house like a palace" },
    { time: 48, text: "Long wooden table, silverware doing damage" },
    { time: 52, text: "Chef in the kitchen turning struggle to a canvas" },
    { time: 56, text: "Lobster, steak, truffle, that's regular standards" },
    { time: 62, text: "Wine from France, but the soul from the block" },
    { time: 66, text: "We toast to the wins, let the time tick soft" },
    { time: 70, text: "All kinds of queens at the table in gloss" },
    { time: 74, text: "Every one a 10, but my main one boss" },
    { time: 80, text: "She my Beyoncé with the crown on tilt" },
    { time: 84, text: "I'm Hov with the plans how the empire built" },
    { time: 88, text: "We could eat anywhere, but we home on the hill" },
    { time: 92, text: "Where the pool hit the sky and the view too real" },
    { time: 100, text: "We do summers like the kings used to do with the land" },
    { time: 104, text: "Mediterranean breeze, private beach, no sand in the Vans" },
    { time: 108, text: "One week Italy, next week south of France" },
    { time: 112, text: "Galactica-star type yacht when we dance" },
    { time: 118, text: "Malibu mornings in a house worth a hundred plus" },
    { time: 122, text: "Concrete castle with the ocean in front of us" },
    { time: 126, text: "Bel-Air nights with the glass walls around" },
    { time: 130, text: "Feel like modern-day royalty looking over the town" },
    { time: 136, text: "And through it all, she the rock, I'm the crown" },
    { time: 140, text: "Power-couple energy any time we come around" },
    { time: 144, text: "We ain't flex just to stunt, we invest to stay sound" },
    { time: 148, text: "Turn the riches to a legacy that our kids hold down" },
    { time: 156, text: "Royal life – fine food, fine queens on deck" },
    { time: 160, text: "Jet, boat, big house, that's a power-couple flex" },
    { time: 164, text: "From the throne to the streets, we bless, no stress" },
    { time: 168, text: "Living like J and Bey, rich love, no less" }
  ];

  // Loyal Love / Righteous Life - Karaoke lyrics (timestamps in seconds, estimated)
  const loyalLoveRighteousLifeLyrics = [
    { time: 8, text: "Through the pain and the rain, you was still right there" },
    { time: 12, text: "Loyal love in your eyes when the world ain't care" },
    { time: 16, text: "You my beauty in the storm, my peace in the fight" },
    { time: 20, text: "If I ever lose my way, you my road to what's right" },
    { time: 24, text: "When the streets turn cold and the nights get rough" },
    { time: 28, text: "You remind me who I am when I feel not enough" },
    { time: 32, text: "If this life take me early, let 'em all know this" },
    { time: 36, text: "I was rich in your love 'fore I ever touched chips" },
    { time: 44, text: "I remember being broke, heart heavy, no peace" },
    { time: 48, text: "You was cooking on the stove, tryna make that heat reach" },
    { time: 52, text: "Every bill on the table like a war we ain't win" },
    { time: 56, text: "But you never lost faith, never folded your chin" },
    { time: 62, text: "Whole hood going crazy, everybody switch sides" },
    { time: 66, text: "You was standing in the door with that \"I still ride\"" },
    { time: 70, text: "When my homies turned fake, when the trust got thin" },
    { time: 74, text: "You was praying for my soul, not the cash I'd bring" },
    { time: 80, text: "You ain't judge me for the dirt that I did for the rent" },
    { time: 84, text: "You just told me, \"Make it out, don't you die in that mess\"" },
    { time: 88, text: "Held me down when the cuffs got tight on my wrist" },
    { time: 92, text: "When the calls got short, you was writing me scripts" },
    { time: 98, text: "\"Keep ya head up\" was more than just a song in your ears" },
    { time: 102, text: "It was how you wiped blood, how you dried my tears" },
    { time: 106, text: "You saw beauty in the fight, hope deep in my scars" },
    { time: 110, text: "Said, \"You more than the block, you was born for the stars\"" },
    { time: 116, text: "Through the pain and the rain, you was still right there" },
    { time: 120, text: "Loyal love in your eyes when the world ain't care" },
    { time: 124, text: "You my beauty in the storm, my peace in the fight" },
    { time: 128, text: "If I ever lose my way, you my road to what's right" },
    { time: 132, text: "When the streets turn cold and the nights get rough" },
    { time: 136, text: "You remind me who I am when I feel not enough" },
    { time: 140, text: "If this life take me early, let 'em all know this" },
    { time: 144, text: "I was rich in your love 'fore I ever touched chips" },
    { time: 152, text: "I seen beauty in your face when the makeup was gone" },
    { time: 156, text: "Sunday morning with the bonnet and the old house clothes on" },
    { time: 160, text: "Tupac on the speaker, you was humming that hook" },
    { time: 164, text: "\"Unconditional love\" written all in your look" },
    { time: 170, text: "You ain't chase no fame, you ain't want no likes" },
    { time: 174, text: "You just wanted us safe, you just wanted what's right" },
    { time: 178, text: "Said, \"The money don't matter if you lose your soul\"" },
    { time: 182, text: "So I'm stacking up prayers with these bankrolls" },
    { time: 188, text: "Now I move how you taught: show love, stand firm" },
    { time: 192, text: "Never laugh at the weak, never step on who hurt" },
    { time: 196, text: "Give back when you up, be real when you speak" },
    { time: 200, text: "And if they fall, help 'em up, don't just watch from the seat" },
    { time: 206, text: "If we ever have a seed, hope they grow like you" },
    { time: 210, text: "See the light in the dark, tell the world what's true" },
    { time: 214, text: "Teach 'em life ain't perfect, but love still pure" },
    { time: 218, text: "And when the world turn its back, we got us, I'm sure" },
    { time: 226, text: "If I don't make it home, play this back when you cry" },
    { time: 230, text: "Let my words be the arms that be holding you tight" },
    { time: 234, text: "Tell our people we was trying to live righteous and real" },
    { time: 238, text: "In a world full of fake, we was love you could feel" },
    { time: 246, text: "Through the pain and the rain, you was still right there" },
    { time: 250, text: "Loyal love in your eyes when the world ain't care" },
    { time: 254, text: "You my beauty in the storm, my peace in the fight" },
    { time: 258, text: "If I ever lose my way, you my road to what's right" },
    { time: 262, text: "When the streets turn cold and the nights get rough" },
    { time: 266, text: "You remind me who I am when I feel not enough" },
    { time: 270, text: "If this life take me early, let 'em all know this" },
    { time: 274, text: "I was rich in your love 'fore I ever touched chips" }
  ];

  // LIFE IS AMAZING - Karaoke lyrics (timestamps in seconds, estimated)
  const lifeIsAmazingLyrics = [
    { time: 8, text: "Life is amazing – ten outta ten in my section" },
    { time: 12, text: "Supermodels everywhere like a casting selection" },
    { time: 16, text: "Fly her out to Greece, then it's Paris on the next one" },
    { time: 20, text: "Bad b!tch heaven, I just wake up in the bless zone" },
    { time: 24, text: "Life is amazing – racks on racks, no stressing" },
    { time: 28, text: "Fine-ass b!tches, every one a new lesson" },
    { time: 32, text: "New city, new view, new body, I'm guessing" },
    { time: 36, text: "If she look like a screenshot, I might hit \"press send\"" },
    { time: 44, text: "All kinda supermodels, different accents when they talk" },
    { time: 48, text: "One from Monaco, one from Rio, two from New York" },
    { time: 52, text: "We in Santorini balconies, robes when we walk" },
    { time: 56, text: "Ocean in the background, skin tone chalk" },
    { time: 62, text: "Private jet seats, ten dimes in a row" },
    { time: 66, text: "IT-girl energy, all blue check glow" },
    { time: 70, text: "We hit Tokyo, London, then back to the coast" },
    { time: 74, text: "I'm just flexing that my passport do the most" },
    { time: 80, text: "Marbella in the summer, all white on the sand" },
    { time: 84, text: "Fine b!tch in Chanel with a drink in her hand" },
    { time: 88, text: "She a runway piece, but she laugh like a friend" },
    { time: 92, text: "Life feel fake, but it's real when you land" },
    { time: 98, text: "Life is amazing – ten outta ten in my section" },
    { time: 102, text: "Supermodels everywhere like a casting selection" },
    { time: 106, text: "Fly her out to Greece, then it's Paris on the next one" },
    { time: 110, text: "Bad b!tch heaven, I just wake up in the bless zone" },
    { time: 114, text: "Life is amazing – racks on racks, no stressing" },
    { time: 118, text: "Fine-ass b!tches, every one a new lesson" },
    { time: 122, text: "New city, new view, new body, I'm guessing" },
    { time: 126, text: "If she look like a screenshot, I might hit \"press send\"" },
    { time: 134, text: "Breakfast on a yacht, late lunch in the sky" },
    { time: 138, text: "Helicopter to the hills, villa views when we high" },
    { time: 142, text: "She a 10 in her bio, 12 in real life" },
    { time: 146, text: "IG can't crop how that body sit right" },
    { time: 152, text: "Got a model for the drip, model for the brand" },
    { time: 156, text: "Model just to hold stacks for the 'Gram" },
    { time: 160, text: "Life like a runway, flashlights, cams" },
    { time: 164, text: "If she walk in the room, whole club go \"damn\"" },
    { time: 170, text: "We don't do basics, only first-class flights" },
    { time: 174, text: "Only five-star sheets, only top-tier nights" },
    { time: 178, text: "If she roll with the team, then her future look bright" },
    { time: 182, text: "'Cause the lifestyle hit like a movie highlight" },
    { time: 190, text: "Life is amazing, baddies in rotation" },
    { time: 194, text: "Supermodel body in a first-class station" },
    { time: 198, text: "New stamp, new view, same rich vibration" },
    { time: 202, text: "Fine-ass b!tch, that's my favorite location" }
  ];

  // Billion Dollar Bitch Talk - Karaoke lyrics (timestamps in seconds, estimated)
  const billionDollarBitchTalkLyrics = [
    { time: 8, text: "Daydream rich, billion dollar thoughts on the dash" },
    { time: 12, text: "Bad b!tch in my lap, switching lanes through the cash" },
    { time: 16, text: "Supercar life, every driveway look like a stash" },
    { time: 20, text: "If the money talk slick, then the b!tches talk back" },
    { time: 24, text: "Big crib, ten rooms, ten whips out front" },
    { time: 28, text: "Ten b!tches, one boss, that's a all-star stunt" },
    { time: 32, text: "If she riding with the gang, then her bag on blunt" },
    { time: 36, text: "If she ain't about the life, then we drop that punt" },
    { time: 44, text: "I got a b!tch for the weekday, b!tch for the jet" },
    { time: 48, text: "B!tch just to roll weed, b!tch to count checks" },
    { time: 52, text: "Life like a car lot, keys on deck" },
    { time: 56, text: "Even my side hoes got side effects" },
    { time: 62, text: "Ceiling gone missing, that's a topless wraith" },
    { time: 66, text: "B!tch topless too, we just match in space" },
    { time: 70, text: "Money doing cardio, run through the safe" },
    { time: 74, text: "I'm the boss and the plug, you just pay the late fee" },
    { time: 80, text: "She love how I talk, that's that Rozay bass" },
    { time: 84, text: "But the wordplay sick, that's that Wayne mixtape" },
    { time: 88, text: "I don't chase any b!tch, I just chase estate" },
    { time: 92, text: "If she come with the drama, I just switch the plates" },
    { time: 98, text: "I'm rich in my head 'fore I touch that bread" },
    { time: 102, text: "Now the house so big I get lost in the bed" },
    { time: 106, text: "Got a pool in the room, got a room for the meds" },
    { time: 110, text: "Got a room just to think what to do with these Ms" },
    { time: 116, text: "Daydream rich, billion dollar thoughts on the dash" },
    { time: 120, text: "Bad b!tch in my lap, switching lanes through the cash" },
    { time: 124, text: "Supercar life, every driveway look like a stash" },
    { time: 128, text: "If the money talk slick, then the b!tches talk back" },
    { time: 132, text: "Big crib, ten rooms, ten whips out front" },
    { time: 136, text: "Ten b!tches, one boss, that's a all-star stunt" },
    { time: 140, text: "If she riding with the gang, then her bag on blunt" },
    { time: 144, text: "If she ain't about the life, then we drop that punt" },
    { time: 152, text: "She a bad little vibe, call her \"Billboard b!tch\"" },
    { time: 156, text: "'Cause her ass so big, that's a big board, b!tch" },
    { time: 160, text: "I don't trip off hoes, I just trip on trips" },
    { time: 164, text: "Fly her out one time, then I dip like chips" },
    { time: 170, text: "Lifestyle stupid, got a chef for the chef" },
    { time: 174, text: "Got a maid for the maid, got a check for the check" },
    { time: 178, text: "Got a watch for the day, different watch when I rest" },
    { time: 182, text: "Even my time got time, all my seconds be blessed" },
    { time: 188, text: "I'm rich off the aura, rich off the talk" },
    { time: 192, text: "B!tch see the walk, start rich-girl walk" },
    { time: 196, text: "I might buy her a bag, might buy her a loft" },
    { time: 200, text: "If she act too cute, she get wrote right off" },
    { time: 206, text: "Whole life feel like a Rozay skit" },
    { time: 210, text: "But the punchline hit like a Weezy clip" },
    { time: 214, text: "B!tch think she the one 'til she see this list" },
    { time: 218, text: "Got ten more dimes that can fill that shift" },
    { time: 226, text: "Big money, big whips, big rings, big drip" },
    { time: 230, text: "Big b!tch, big lips, big dreams, big trips" },
    { time: 234, text: "If it ain't about the life that I paint like this" },
    { time: 238, text: "Then it ain't my song and it ain't my b!tch" },
    { time: 246, text: "Daydream rich, billion dollar thoughts on the dash" },
    { time: 250, text: "Bad b!tch in my lap, switching lanes through the cash" },
    { time: 254, text: "Supercar life, every driveway look like a stash" },
    { time: 258, text: "If the money talk slick, then the b!tches talk back" },
    { time: 262, text: "Big crib, ten rooms, ten whips out front" },
    { time: 266, text: "Ten b!tches, one boss, that's a all-star stunt" },
    { time: 270, text: "If she riding with the gang, then her bag on blunt" },
    { time: 274, text: "If she ain't about the life, then we drop that punt" }
  ];

  // BILLIONAIRE DAYDREAMS - Karaoke lyrics (timestamps in seconds, estimated)
  const billionaireDaydreamsLyrics = [
    { time: 6, text: "This that close-your-eyes money" },
    { time: 10, text: "See it 'fore you touch it" },
    { time: 14, text: "Rozay type visions" },
    { time: 20, text: "Daydream rich, see a billion on the dash" },
    { time: 24, text: "All-black Bugatti when I'm sliding through the past" },
    { time: 28, text: "Penthouse views, see the city through the glass" },
    { time: 32, text: "Every little vision that I had, now it's cash" },
    { time: 36, text: "Maybach seats with the stars in the roof" },
    { time: 40, text: "V12 hum like it's singing me the truth" },
    { time: 44, text: "Every closed eye just another clear proof" },
    { time: 48, text: "If you dream big enough, you can park it at the booth" },
    { time: 56, text: "I was broke, but my mind rode foreign on the low" },
    { time: 60, text: "Honda Civic felt like Maybach when the bass hit slow" },
    { time: 64, text: "Saw a mansion in my head 'fore I stepped in the door" },
    { time: 68, text: "Now the driveway like a car show, keys on the floor" },
    { time: 74, text: "Bugatti in the vision, that's a different type of faith" },
    { time: 78, text: "One-eight-four on the tag, I ain't blink at the plate" },
    { time: 82, text: "Corvette in the back just to balance the taste" },
    { time: 86, text: "Cars lined up like sneakers, ten pair in the safe" },
    { time: 92, text: "Marble in the foyer, gold frames on the wall" },
    { time: 96, text: "Big gates, long drive, dogs trained for the call" },
    { time: 100, text: "Used to dream in the dark, now I dream in the hall" },
    { time: 104, text: "Of a house so big I could jog down the hall" },
    { time: 110, text: "Cigar smoke thick while I draft new plays" },
    { time: 114, text: "Billionaire talk over lobster and steaks" },
    { time: 118, text: "I ain't there yet, but my heart in that place" },
    { time: 122, text: "Every bar that I write, that's a brick in the safe" },
    { time: 128, text: "Daydream rich, see a billion on the dash" },
    { time: 132, text: "All-black Bugatti when I'm sliding through the past" },
    { time: 136, text: "Penthouse views, see the city through the glass" },
    { time: 140, text: "Every little vision that I had, now it's cash" },
    { time: 144, text: "Maybach seats with the stars in the roof" },
    { time: 148, text: "V12 hum like it's singing me the truth" },
    { time: 152, text: "Every closed eye just another clear proof" },
    { time: 156, text: "If you dream big enough, you can park it at the booth" },
    { time: 164, text: "I see islands in my sleep, private jets on the sand" },
    { time: 168, text: "Whole fam on the tarmac, matching bags in they hands" },
    { time: 172, text: "Helicopter on the roof, yacht parked where I stand" },
    { time: 176, text: "Money long like the runways in a foreign land" },
    { time: 182, text: "Rich forever on my mind, that's a daily offense" },
    { time: 186, text: "Talk in commas every time like it's basic English" },
    { time: 190, text: "Billion in my thoughts, I don't cap for a glimpse" },
    { time: 194, text: "If my dreams on stocks, they would all be blue-chip" },
    { time: 200, text: "Supercar garage, see the doors go up" },
    { time: 204, text: "Lamb truck, Wraith, then the Porsche in the cut" },
    { time: 208, text: "Engine sound like a choir when I barely hit clutch" },
    { time: 212, text: "Every horsepower feel like it's lifting me up" },
    { time: 218, text: "I ain't flexing what I got, I'm flexing what I see" },
    { time: 222, text: "Paint a picture so strong 'til it turn 3D" },
    { time: 226, text: "Rick Ross in my ear, talking \"boss, that's me\"" },
    { time: 230, text: "From the daydream life to the real life free" },
    { time: 238, text: "Close your eyes, count racks in your hand" },
    { time: 242, text: "See the keys on the table, see the deed to the land" },
    { time: 246, text: "See the cars, see the boats, see the fam all grand" },
    { time: 250, text: "If your mind get there first, real life gotta land" },
    { time: 258, text: "Daydream rich, see a billion on the dash" },
    { time: 262, text: "All-black Bugatti when I'm sliding through the past" },
    { time: 266, text: "Penthouse views, see the city through the glass" },
    { time: 270, text: "Every little vision that I had, now it's cash" },
    { time: 274, text: "Maybach seats with the stars in the roof" },
    { time: 278, text: "V12 hum like it's singing me the truth" },
    { time: 282, text: "Every closed eye just another clear proof" },
    { time: 286, text: "If you dream big enough, you can park it at the booth" }
  ];

  // Courtside Ass - Karaoke lyrics (timestamps in seconds, estimated)
  const courtsideAssLyrics = [
    { time: 6, text: "Yeah" },
    { time: 10, text: "We live from the court with it" },
    { time: 14, text: "Halftime show type vibes" },
    { time: 18, text: "Ass, ass, ass…" },
    { time: 24, text: "Ass, ass, ass, ass, ass – courtside" },
    { time: 28, text: "Bounce that ass on the three-point line" },
    { time: 32, text: "Ass, ass, ass, ass, ass – baseline" },
    { time: 36, text: "Shake that ass like a game on the line" },
    { time: 40, text: "Dribble that ass, no double-dribe move" },
    { time: 44, text: "Full-court press when the beat go boom" },
    { time: 48, text: "Ass, ass, ass, ass, ass – all net" },
    { time: 52, text: "When she throw it back, that's a highlight set" },
    { time: 60, text: "She got cheeks on the court like a warm-up line" },
    { time: 64, text: "Little jiggle when she walk, that's a and-one sign" },
    { time: 68, text: "Shorts so tight, got the crowd gon' stare" },
    { time: 72, text: "Little bounce in her step, put the game in the air" },
    { time: 78, text: "Halftime hit, she the real main show" },
    { time: 82, text: "When she drop to the floor, whole team go \"woah\"" },
    { time: 86, text: "Three-point stance with her hands on knees" },
    { time: 90, text: "Then she arch that back, make the fans say \"please\"" },
    { time: 96, text: "From the nosebleeds up to the front row seats" },
    { time: 100, text: "Every angle of the court where she move, it's heat" },
    { time: 104, text: "Best place in the world just to see that clap" },
    { time: 108, text: "Is a packed-out gym when the beat go slap" },
    { time: 116, text: "Tip-off bounce, let the booty jump too" },
    { time: 120, text: "Shot clock low, watch her make that move" },
    { time: 124, text: "Crowd go wild when she spin, then freeze" },
    { time: 128, text: "Then she drop back down, put the game on knees" },
    { time: 134, text: "Ass, ass, ass, ass, ass – courtside" },
    { time: 138, text: "Bounce that ass on the three-point line" },
    { time: 142, text: "Ass, ass, ass, ass, ass – baseline" },
    { time: 146, text: "Shake that ass like a game on the line" },
    { time: 150, text: "Dribble that ass, no double-dribe move" },
    { time: 154, text: "Full-court press when the beat go boom" },
    { time: 158, text: "Ass, ass, ass, ass, ass – all net" },
    { time: 162, text: "When she throw it back, that's a highlight set" },
    { time: 170, text: "Layup, layup, way she go up smooth" },
    { time: 174, text: "Then she come back down, make the whole floor groove" },
    { time: 178, text: "Little pump fake when she look that way" },
    { time: 182, text: "Then she switch that hip, that's a ankle break play" },
    { time: 188, text: "Cheer squad mad 'cause she steal that shine" },
    { time: 192, text: "Ref look lost, crowd out they mind" },
    { time: 196, text: "Scoreboard up, but they watch that waist" },
    { time: 200, text: "Every bounce, every clap like a fastbreak chase" },
    { time: 206, text: "From the street courts, parks, to the pro arenas" },
    { time: 210, text: "She gon' shake that ass anywhere there's bleachers" },
    { time: 214, text: "Whistle might blow, but the show don't stop" },
    { time: 218, text: "When the bassline hit, that's a guaranteed drop" },
    { time: 226, text: "Baseline, baseline, shake that" },
    { time: 230, text: "Free-throw line, don't fake that" },
    { time: 234, text: "Top of the key, then take that back" },
    { time: 238, text: "Whole court love when you make that clap" },
    { time: 242, text: "Left side, right side, stands go dumb" },
    { time: 246, text: "Half-court logo, make that run" },
    { time: 250, text: "Anywhere the ball hit, she hit too" },
    { time: 254, text: "Anytime the beat knock, she gon' move" },
    { time: 262, text: "Ass, ass, ass, ass, ass – courtside" },
    { time: 266, text: "Bounce that ass on the three-point line" },
    { time: 270, text: "Ass, ass, ass, ass, ass – baseline" },
    { time: 274, text: "Shake that ass like a game on the line" },
    { time: 278, text: "Dribble that ass, no double-dribe move" },
    { time: 282, text: "Full-court press when the beat go boom" },
    { time: 286, text: "Ass, ass, ass, ass, ass – all net" },
    { time: 290, text: "When she throw it back, that's a highlight set" }
  ];

  // ASTRO BOOTY - Karaoke lyrics (timestamps in seconds, estimated)
  const astroBootyLyrics = [
    { time: 6, text: "(Ayy)" },
    { time: 10, text: "Straight out the mud with it" },
    { time: 14, text: "Yeah" },
    { time: 18, text: "Booty in the stars, huh" },
    { time: 24, text: "Booty move slow on a space-ship beat" },
    { time: 28, text: "Dark room, red lights, 808s too deep" },
    { time: 32, text: "Racks in the sky when I bend these knees" },
    { time: 36, text: "Every clap, every shake got a mortgage on freeze" },
    { time: 40, text: "Diamonds on glow but the past look rough" },
    { time: 44, text: "Booty talk loud 'cause the grind was tough" },
    { time: 48, text: "Travis-type drums make the pain sound lush" },
    { time: 52, text: "When the bassline slide, all the doubt hush" },
    { time: 60, text: "I was broke in the night, now I live in the fog" },
    { time: 64, text: "Heavy 808s shake the pain out the walls" },
    { time: 68, text: "Fetch my bag in the club, then I dip to the loft" },
    { time: 72, text: "Same ass that was stress now be paying it off" },
    { time: 78, text: "Dark synths hum like a voice in my head" },
    { time: 82, text: "Saying \"stack, don't stunt, get the fam all fed\"" },
    { time: 86, text: "Ass on beat, but the mind on bread" },
    { time: 90, text: "Whole life flipped, now the broke me dead" },
    { time: 96, text: "Booty like a planet when the bass kick in" },
    { time: 100, text: "Orbit round the pole while the checks fly in" },
    { time: 104, text: "Trippy little lights on my scars, my skin" },
    { time: 108, text: "Every bounce say \"win,\" every drop say \"win\"" },
    { time: 116, text: "Mood real evil but the heart so gold" },
    { time: 120, text: "Ass still clap for the stories untold" },
    { time: 124, text: "Beat feel hell, but the faith won't fold" },
    { time: 128, text: "I was down bad, now the vision too bold" },
    { time: 134, text: "Booty move slow on a space-ship beat" },
    { time: 138, text: "Dark room, red lights, 808s too deep" },
    { time: 142, text: "Racks in the sky when I bend these knees" },
    { time: 146, text: "Every clap, every shake got a mortgage on freeze" },
    { time: 150, text: "Diamonds on glow but the past look rough" },
    { time: 154, text: "Booty talk loud 'cause the grind was tough" },
    { time: 158, text: "Travis-type drums make the pain sound lush" },
    { time: 162, text: "When the bassline slide, all the doubt hush" },
    { time: 170, text: "Hands on knees – let the world go mute" },
    { time: 174, text: "808 glide like a snake in the roof" },
    { time: 178, text: "Booty spell cast, put the fear on stoop" },
    { time: 182, text: "I don't talk rich, I just let it all prove" },
    { time: 188, text: "Shake one time for the bills you paid" },
    { time: 192, text: "Shake two times for the moves you made" },
    { time: 196, text: "Shake three times for the demons you slayed" },
    { time: 200, text: "If the bass hit hard, that's the life upgrade" },
    { time: 208, text: "City on my back and the club my church" },
    { time: 212, text: "Pray in the mirror then I praise this work" },
    { time: 216, text: "Booty like art in a dark night blur" },
    { time: 220, text: "Every stroke, every step say \"I know my worth\"" },
    { time: 226, text: "Atmosphere thick like the smoke on stage" },
    { time: 230, text: "Trap drums knock like they breaking out a cage" },
    { time: 234, text: "I ain't here for the love, I'm here for the wage" },
    { time: 238, text: "But the glow so strong turn the hate to a wave" },
    { time: 244, text: "I was lost in the noise, now I float on top" },
    { time: 248, text: "Use the pain as a beat, use the doubt as a drop" },
    { time: 252, text: "Booty shaking on the edge of the world, don't stop" },
    { time: 256, text: "When the 808 talk, whole sky gon' rock" },
    { time: 264, text: "Booty move slow on a space-ship beat" },
    { time: 268, text: "Dark room, red lights, 808s too deep" },
    { time: 272, text: "Racks in the sky when I bend these knees" },
    { time: 276, text: "Every clap, every shake got a mortgage on freeze" },
    { time: 280, text: "Diamonds on glow but the past look rough" },
    { time: 284, text: "Booty talk loud 'cause the grind was tough" },
    { time: 288, text: "Travis-type drums make the pain sound lush" },
    { time: 292, text: "When the bassline slide, all the doubt hush" }
  ];

  // BOOTY BAG - Karaoke lyrics (timestamps in seconds, estimated)
  const bootyBagLyrics = [
    { time: 6, text: "Yeah" },
    { time: 10, text: "Booty get the bag" },
    { time: 14, text: "We not broke no more" },
    { time: 20, text: "Booty clap – big bag – (pause)" },
    { time: 24, text: "Hands on knees – let it drag – (pause)" },
    { time: 28, text: "Fetch that check – run that play – (pause)" },
    { time: 32, text: "Every lil' shake put the doubt away –" },
    { time: 36, text: "Stack that house – stack that land – (pause)" },
    { time: 40, text: "Ass so loud – can't hear no man – (pause)" },
    { time: 44, text: "Life look good – wins on ten –" },
    { time: 48, text: "Twerk for the goals – do that again –" },
    { time: 56, text: "From the broke lil' nights, now the club my stage" },
    { time: 60, text: "Booty talk rich when the rent got paid" },
    { time: 64, text: "Fetch lil' deals off a post, off a wave" },
    { time: 68, text: "Every reel, every clip like a raise, I gave" },
    { time: 74, text: "He throw ones, I throw stocks in the air" },
    { time: 78, text: "Booty look fun, but the mind so rare" },
    { time: 82, text: "I don't dance just to beg, I dance 'cause I dare" },
    { time: 86, text: "Turn a shake, turn a smirk to a millionaire stare" },
    { time: 92, text: "Drop low, see the future in the floor" },
    { time: 96, text: "Come up, see the life I'm working for" },
    { time: 100, text: "Every bounce, every pop, that's a closed door" },
    { time: 104, text: "On the old broke me that I'm not no more" },
    { time: 112, text: "Work that – earn that – (pause)" },
    { time: 116, text: "Booty big, brain fat – (pause)" },
    { time: 120, text: "Stack goals, stack racks –" },
    { time: 124, text: "Shake wins, no cap –" },
    { time: 130, text: "Booty clap – big bag – (pause)" },
    { time: 134, text: "Hands on knees – let it drag – (pause)" },
    { time: 138, text: "Fetch that check – run that play – (pause)" },
    { time: 142, text: "Every lil' shake put the doubt away –" },
    { time: 146, text: "Stack that house – stack that land – (pause)" },
    { time: 150, text: "Ass so loud – can't hear no man – (pause)" },
    { time: 154, text: "Life look good – wins on ten –" },
    { time: 158, text: "Twerk for the goals – do that again –" },
    { time: 166, text: "New ice, new keys, new views, no stress" },
    { time: 170, text: "Same booty that was broke, now it flex success" },
    { time: 174, text: "I don't chase no love, I just chase that bless" },
    { time: 178, text: "If the vibe ain't rich, I'm a hard no, next" },
    { time: 184, text: "Booty like a boss when the beat drop down" },
    { time: 188, text: "Motivation in the shake, not a sad-girl sound" },
    { time: 192, text: "Every girl in the back, get your bag, come around" },
    { time: 196, text: "Let it clap for the life that you building from the ground" },
    { time: 202, text: "We don't hide no wins, we gon' flaunt that glow" },
    { time: 206, text: "Every scar, every tear in the way I roll" },
    { time: 210, text: "Turn pain to a bounce, turn fear to a show" },
    { time: 214, text: "And the ass say \"rich\" 'fore the mouth say \"go\"" },
    { time: 222, text: "Booty clap – big bag – (pause)" },
    { time: 226, text: "Hands on knees – let it drag – (pause)" },
    { time: 230, text: "Fetch that check – run that play – (pause)" },
    { time: 234, text: "Every lil' shake put the doubt away –" },
    { time: 238, text: "Stack that house – stack that land – (pause)" },
    { time: 242, text: "Ass so loud – can't hear no man – (pause)" },
    { time: 246, text: "Life look good – wins on ten –" },
    { time: 250, text: "Twerk for the goals – do that again –" }
  ];

  // Fetch That Money - Karaoke lyrics (timestamps in seconds, estimated)
  const fetchThatMonetLyrics = [
    { time: 6, text: "Yeah" },
    { time: 10, text: "Fetch that" },
    { time: 14, text: "Stack that" },
    { time: 18, text: "Shake that, get it back" },
    { time: 24, text: "Fetch money, fetch plays, this a hustle, not luck" },
    { time: 28, text: "Turn rent into chains, turn pain into bucks" },
    { time: 32, text: "Jewelry, bags, new cribs when I level it up" },
    { time: 36, text: "From the grind to the club, all the checks add up" },
    { time: 42, text: "Stack houses, stack land, that's the life I chase" },
    { time: 46, text: "Still twerk, still dance, let the money hit waist" },
    { time: 50, text: "From the shifts to the stage, every move got taste" },
    { time: 54, text: "Whole life on glow 'cause the hustle don't waste" },
    { time: 62, text: "From the clock-in shifts to the club light beams" },
    { time: 66, text: "Used to mop up floors, now I mop up streams" },
    { time: 70, text: "Fetch work, fetch plays, turn the hustle to themes" },
    { time: 74, text: "Every lil' booty shake push the fam new dreams" },
    { time: 80, text: "Firehouse days, construction on the side" },
    { time: 84, text: "Now it's rap, now it's reels, now it's twerk worldwide" },
    { time: 88, text: "Show life, show grind, let the whole net see" },
    { time: 92, text: "When the ass go up, that's the stock on me" },
    { time: 98, text: "Fetch tools, fetch plans, turned sweat to a brand" },
    { time: 102, text: "Used to carry that pipe, now I carry the land" },
    { time: 106, text: "Flip checks, flip lots, every flip well-planned" },
    { time: 110, text: "But I still hit the club, let it clap on command" },
    { time: 116, text: "In the back with the ones, but my mind on M's" },
    { time: 120, text: "No couch, I invest, I don't stunt for them" },
    { time: 124, text: "Shake ass, stack cash, that's the strat, not a trend" },
    { time: 128, text: "Booty move, bank move, both up in the end" },
    { time: 136, text: "Fetch money, fetch goals, fetch life, big steppin'" },
    { time: 140, text: "Jewels, bags, new home, that's real flex, not flexin'" },
    { time: 144, text: "Work hard, shake ass, both sides, I'm preppin'" },
    { time: 148, text: "Every day, every night, that's the grind they're reppin'" },
    { time: 154, text: "Fetch money, fetch plays, this a hustle, not luck" },
    { time: 158, text: "Turn rent into chains, turn pain into bucks" },
    { time: 162, text: "Jewelry, bags, new cribs when I level it up" },
    { time: 166, text: "From the grind to the club, all the checks add up" },
    { time: 172, text: "Stack houses, stack land, that's the life I chase" },
    { time: 176, text: "Still twerk, still dance, let the money hit waist" },
    { time: 180, text: "From the shifts to the stage, every move got taste" },
    { time: 184, text: "Whole life on glow 'cause the hustle don't waste" },
    { time: 192, text: "Fetch cars, fetch ice, fetch trips on demand" },
    { time: 196, text: "I don't chase any man, I just chase new land" },
    { time: 200, text: "Big bag, big crib, whole fam on expand" },
    { time: 204, text: "Do a split on the beat, let it rain on the brand" },
    { time: 210, text: "Jewelry talk loud when I walk past broke" },
    { time: 214, text: "But the deeds in my name, that's the real rich joke" },
    { time: 218, text: "They throw ones for the show, I throw bands into growth" },
    { time: 222, text: "Booty up on the pole, credit score up, both" },
    { time: 228, text: "Stack money, stack bricks, stack chains, stack land" },
    { time: 232, text: "Big bag, big drip, big house, my brand" },
    { time: 236, text: "From the grind to the glam, they don't know my plan" },
    { time: 240, text: "Every check that I touch got a job in my hand" },
    { time: 246, text: "Club lights hit, make the hustle look fun" },
    { time: 250, text: "But they ain't see the nights I was broke, on run" },
    { time: 254, text: "Now it's fetch this, fetch that, fetch bag, fetch run" },
    { time: 258, text: "Every twerk, every post like a ad for funds" },
    { time: 266, text: "Work hard, shake ass, both sides, I'm preppin'" },
    { time: 270, text: "Every day, every night, that's the grind they're reppin'" },
    { time: 276, text: "Fetch money, fetch plays, this a hustle, not luck" },
    { time: 280, text: "Turn rent into chains, turn pain into bucks" },
    { time: 284, text: "Jewelry, bags, new cribs when I level it up" },
    { time: 288, text: "From the grind to the club, all the checks add up" },
    { time: 294, text: "Stack houses, stack land, that's the life I chase" },
    { time: 298, text: "Still twerk, still dance, let the money hit waist" },
    { time: 302, text: "From the shifts to the stage, every move got taste" },
    { time: 306, text: "Whole life on glow 'cause the hustle don't waste" }
  ];

  // Shake That Booty Please - Karaoke lyrics (timestamps in seconds, estimated)
  const shakeThatBootyPleaseLyrics = [
    { time: 6, text: "Yeah" },
    { time: 10, text: "She ain't free, better talk to her fee" },
    { time: 18, text: "Shakin' booty to please, but the bag come first" },
    { time: 22, text: "If the money ain't right, then the ass don't work" },
    { time: 26, text: "Shakin' booty to please, make 'em fall to they knees" },
    { time: 30, text: "But she only show love when it's bands, not cheese" },
    { time: 36, text: "Shakin' booty to please, but she run this scene" },
    { time: 40, text: "Make 'em pay for the view, she a cash machine" },
    { time: 44, text: "Shakin' booty to please, all gas, no tease" },
    { time: 48, text: "If you broke, lil boy, better move, say \"please\"" },
    { time: 56, text: "He think it's for him, she know it's for rent" },
    { time: 60, text: "Every lil wiggle got a dollar sign bent" },
    { time: 64, text: "Came in broke, but she leave top tier" },
    { time: 68, text: "Every shake one step outta last year" },
    { time: 74, text: "Booty on beat with the 808 thump" },
    { time: 78, text: "Turn a small stage to a strip-club dump" },
    { time: 82, text: "When the DJ drop bass, she don't miss one hit" },
    { time: 86, text: "Hips talk back while the bag get lit" },
    { time: 92, text: "She don't dance for the free, that was back in the day" },
    { time: 96, text: "Now it's Cash App ping every time that she sway" },
    { time: 100, text: "\"Pop it for the camera,\" better talk 'bout pay" },
    { time: 104, text: "One clip worth more than a whole man's day" },
    { time: 112, text: "She ain't no toy, this a business move" },
    { time: 116, text: "Every cheek clap set the price in the room" },
    { time: 120, text: "If the offer feel light, she just switch that song" },
    { time: 124, text: "But when the rack look right, she go all night long" },
    { time: 130, text: "Shakin' booty to please, but the bag come first" },
    { time: 134, text: "If the money ain't right, then the ass don't work" },
    { time: 138, text: "Shakin' booty to please, make 'em fall to they knees" },
    { time: 142, text: "But she only show love when it's bands, not cheese" },
    { time: 148, text: "Shakin' booty to please, but she run this scene" },
    { time: 152, text: "Make 'em pay for the view, she a cash machine" },
    { time: 156, text: "Shakin' booty to please, all gas, no tease" },
    { time: 160, text: "If you broke, lil boy, better move, say \"please\"" },
    { time: 168, text: "Club lights hit, now her skin look gold" },
    { time: 172, text: "Whole row of dudes tryna act too bold" },
    { time: 176, text: "She don't hear game, she just hear rates" },
    { time: 180, text: "\"Talk nice, talk numbers, talk dates.\"" },
    { time: 186, text: "VIP talk with a drink in hand" },
    { time: 190, text: "Read every man like a scam on the 'Gram" },
    { time: 194, text: "She don't pop for respect, she pop for control" },
    { time: 198, text: "Every step on the stage put a tax on his soul" },
    { time: 204, text: "Outside, they judge, inside, they pay" },
    { time: 208, text: "Same ones talkin' hate throw ones all day" },
    { time: 212, text: "When she see that shame in they face by the end" },
    { time: 216, text: "She just laugh to the bank, that's revenge" },
    { time: 224, text: "So when you see that shake, know the backstory deep" },
    { time: 228, text: "Every move on beat came from nights no sleep" },
    { time: 232, text: "Now it's lights, bass, and a room full of need" },
    { time: 236, text: "She just shakin' for the check, not for greed" },
    { time: 242, text: "Shakin' booty to please, but the bag come first" },
    { time: 246, text: "If the money ain't right, then the ass don't work" },
    { time: 250, text: "Shakin' booty to please, make 'em fall to they knees" },
    { time: 254, text: "But she only show love when it's bands, not cheese" },
    { time: 260, text: "Shakin' booty to please, but she run this scene" },
    { time: 264, text: "Make 'em pay for the view, she a cash machine" },
    { time: 268, text: "Shakin' booty to please, all gas, no tease" },
    { time: 272, text: "If you broke, lil boy, better move, say \"please\"" }
  ];

  // Ass Boost Party Anthem - Karaoke lyrics (timestamps in seconds, estimated)
  const assBoostPartyAnthemLyrics = [
    { time: 6, text: "Pole money good but this AI shit better" },
    { time: 10, text: "One prompt thick pawg shit wetter than ever" },
    { time: 14, text: "Sac Latinas slide they know what the play is" },
    { time: 18, text: "Boost thick mami contest winner no braces" },
    { time: 24, text: "BadGirlPro hoes we runnin these raids" },
    { time: 28, text: "Gold Club VIP but we digital paid" },
    { time: 32, text: "No sore feet no tricks in the VIP" },
    { time: 36, text: "Just ass shake vids stackin six figures weekly" },
    { time: 42, text: "Shake dat shit clap make that pussy holler" },
    { time: 46, text: "Shake dat shit twerk straight to the dollars" },
    { time: 50, text: "Booty boost hoe five hundred on first night" },
    { time: 54, text: "AI ass clap watch me take flight" },
    { time: 62, text: "Brrrp cash app notifications" },
    { time: 66, text: "One dollar boost five sub customizations" },
    { time: 70, text: "Make her booty bounce like she on the cage" },
    { time: 74, text: "Kling AI render ten seconds get paid" },
    { time: 80, text: "Contest Friday five hundred plus the fit" },
    { time: 84, text: "LoveKhaos harness make that ass sit" },
    { time: 88, text: "Post on the Gram watch the thirsty niggas tip" },
    { time: 92, text: "AI stripper gang hoes never gon slip" },
    { time: 98, text: "Shake dat shit clap make that pussy holler" },
    { time: 102, text: "Shake dat shit twerk straight to the dollars" },
    { time: 106, text: "Booty boost hoe five hundred on first night" },
    { time: 110, text: "AI ass clap watch me take flight" },
    { time: 120, text: "Shake dat shit clap make that pussy holler" },
    { time: 124, text: "Shake dat shit twerk straight to the dollars" },
    { time: 128, text: "Ten K dreams hoe no stage all digital" },
    { time: 132, text: "AI ass empire Sac strippers invincible" }
  ];

  // Queen of the Quake - Karaoke lyrics (timestamps in seconds, estimated)
  const queenOfTheQuakeLyrics = [
    { time: 6, text: "Bow down…" },
    { time: 10, text: "She's here." },
    { time: 16, text: "Crown on crooked but the ass on straight," },
    { time: 19, text: "Walk in late, still control your fate." },
    { time: 22, text: "Pink fit, big drip, make the floor vibrate," },
    { time: 25, text: "Every step like a 7.8." },
    { time: 30, text: "Labels on the phone, but the hood still call," },
    { time: 33, text: "She could be in Milan, still answer for y'all." },
    { time: 36, text: "Global lil' body with a hometown heart," },
    { time: 39, text: "When she drop to the floor, that's a state-of-the-art." },
    { time: 45, text: "If you ever felt small, let the bass make you tall," },
    { time: 48, text: "Every shake, every clap, that's you breakin' that wall." },
    { time: 51, text: "Queen in your mirror, not the crown that you need," },
    { time: 54, text: "Just the courage in your chest and the bend in your knees." },
    { time: 60, text: "Queen of the quake, make the ground bow down," },
    { time: 64, text: "When her hips start to move, whole city make sound." },
    { time: 68, text: "Lights dim low, but her aura on bright," },
    { time: 72, text: "She can shake through the pain and still own the night." },
    { time: 77, text: "Queen of the quake, let the peasants just hate," },
    { time: 81, text: "Every curve, every flaw, that's a piece of her fate." },
    { time: 85, text: "From the strip to the stage to the top floor suite," },
    { time: 89, text: "She a walking earthquake, feel it under your feet." },
    { time: 96, text: "She got stretch marks, scars, all that real girl shit," },
    { time: 99, text: "But the way that she move make the hurt look lit." },
    { time: 102, text: "Payin' mama's bills while she own that pole," },
    { time: 105, text: "Stackin' for a business, she ain't sellin' her soul." },
    { time: 110, text: "IG comments full of broke boy jokes," },
    { time: 113, text: "But they still zoom in, still lurk, still choke." },
    { time: 116, text: "She ain't pressed 'bout likes, she impressed by growth," },
    { time: 119, text: "Shake it for herself, not a man, not a post." },
    { time: 125, text: "If you ever felt small, let the bass make you tall," },
    { time: 128, text: "Every shake, every clap, that's you breakin' that wall." },
    { time: 131, text: "Queen in your mirror, not the crown that you need," },
    { time: 134, text: "Just the courage in your chest and the bend in your knees." },
    { time: 140, text: "Queen of the quake, make the ground bow down," },
    { time: 144, text: "When her hips start to move, whole city make sound." },
    { time: 148, text: "Lights dim low, but her aura on bright," },
    { time: 152, text: "She can shake through the pain and still own the night." },
    { time: 157, text: "Queen of the quake, let the peasants just hate," },
    { time: 161, text: "Every curve, every flaw, that's a piece of her fate." },
    { time: 165, text: "From the strip to the stage to the top floor suite," },
    { time: 169, text: "She a walking earthquake, feel it under your feet." },
    { time: 176, text: "If you ever cried in the bathroom, fixin' your face," },
    { time: 180, text: "Then stepped out the stall, took over the place…" },
    { time: 184, text: "This for you." },
    { time: 188, text: "If they ever tried to shame you for the way you move," },
    { time: 192, text: "Then stared anyway 'cause your power too smooth…" },
    { time: 196, text: "This for you." },
    { time: 202, text: "Queen of the quake, make the ground bow down," },
    { time: 206, text: "When her hips start to move, whole city make sound." },
    { time: 210, text: "Lights dim low, but her aura on bright," },
    { time: 214, text: "She can shake through the pain and still own the night." },
    { time: 219, text: "Queen of the quake, let the peasants just hate," },
    { time: 223, text: "Every curve, every flaw, that's a piece of her fate." },
    { time: 227, text: "From the strip to the stage to the top floor suite," },
    { time: 231, text: "She a walking earthquake, feel it under your feet." },
    { time: 238, text: "Bow…" },
    { time: 242, text: "The quake just left the building." }
  ];

  // Neon Thong Vision - Karaoke lyrics (timestamps in seconds, estimated)
  const neonThongLyrics = [
    { time: 8, text: "Neon lights on the floor, she glow like a dream," },
    { time: 11, text: "Liquor in my blood, got me lost in the scene." },
    { time: 14, text: "Whole world blurry, but her outline clean," },
    { time: 17, text: "In a neon thong, I'ma follow that beam." },
    { time: 22, text: "Late night, red eyes, city look slow," },
    { time: 25, text: "Henny in my cup, got a cloud in my soul." },
    { time: 28, text: "Walk in, see her body in the UV glow," },
    { time: 31, text: "Every move like a movie I ain't seen before." },
    { time: 36, text: "Bass low, room thick, smell like smoke," },
    { time: 39, text: "Money in the air, broken hearts, inside jokes." },
    { time: 42, text: "She ain't even look my way, still got me choked," },
    { time: 45, text: "Every time she hit the pole, that's a love note." },
    { time: 50, text: "Got a halo made of LED," },
    { time: 52, text: "Devil in her eyes, but she feel like peace." },
    { time: 55, text: "I ain't came for love, just to numb my grief," },
    { time: 58, text: "But the way she drop slow, that's my new belief." },
    { time: 64, text: "I can't see nothin' 'cept your outline," },
    { time: 67, text: "World go quiet when you on my mind." },
    { time: 70, text: "All of my problems fade in the smoke," },
    { time: 73, text: "Soon as your waist move slow." },
    { time: 78, text: "Neon thong vision, got me stuck in a trance," },
    { time: 82, text: "Every step that you take like a slowed-down dance." },
    { time: 86, text: "I been runnin' from the pain, from the life I'm in," },
    { time: 90, text: "But tonight, it's just me and your glow on my skin." },
    { time: 95, text: "Neon thong vision, you the only thing clear," },
    { time: 99, text: "All these strangers and bottles, but you the one I feel near." },
    { time: 103, text: "If the world fall apart, let it all cave in," },
    { time: 107, text: "I just wanna stay lost in your light again." },
    { time: 114, text: "She got glitter on her thighs like a galaxy drip," },
    { time: 117, text: "Every spin leave a trail when she drop, then flip." },
    { time: 120, text: "Tattoo on her side say \"never forget,\"" },
    { time: 123, text: "But the way that she move say \"forgive, reset.\"" },
    { time: 128, text: "I know she got a past like I got mine," },
    { time: 131, text: "Probably text from her ex blowin' up her line." },
    { time: 134, text: "Probably rent past due, couple bills on time," },
    { time: 137, text: "But right now she a goddess in a neon shrine." },
    { time: 142, text: "I tip out of respect, not a claim on her heart," },
    { time: 145, text: "She an artist with a pole, I'm just playin' my part." },
    { time: 148, text: "Trauma in my veins, in her eyes, in the dark," },
    { time: 151, text: "But we both turn it pretty when the beat first start." },
    { time: 157, text: "I can't see nothin' 'cept your outline," },
    { time: 160, text: "World go quiet when you on my mind." },
    { time: 163, text: "All of my problems fade in the smoke," },
    { time: 166, text: "Soon as your waist move slow." },
    { time: 171, text: "Neon thong vision, got me stuck in a trance," },
    { time: 175, text: "Every step that you take like a slowed-down dance." },
    { time: 179, text: "I been runnin' from the pain, from the life I'm in," },
    { time: 183, text: "But tonight, it's just me and your glow on my skin." },
    { time: 188, text: "Neon thong vision, you the only thing clear," },
    { time: 192, text: "All these strangers and bottles, but you the one I feel near." },
    { time: 196, text: "If the world fall apart, let it all cave in," },
    { time: 200, text: "I just wanna stay lost in your light again." },
    { time: 207, text: "We both tired of the days, that's why we live at night," },
    { time: 210, text: "You performin' for their eyes, I'm just searchin' for light." },
    { time: 213, text: "If tomorrow never come, this a perfect sight," },
    { time: 216, text: "You a northern star dancin' in a strip club sky." },
    { time: 222, text: "Neon thong vision, got me stuck in a trance," },
    { time: 226, text: "Every step that you take like a slowed-down dance." },
    { time: 230, text: "I been runnin' from the pain, from the life I'm in," },
    { time: 234, text: "But tonight, it's just me and your glow on my skin." },
    { time: 239, text: "Neon thong vision, you the only thing clear," },
    { time: 243, text: "All these strangers and bottles, but you the one I feel near." },
    { time: 247, text: "If the world fall apart, let it all cave in," },
    { time: 251, text: "I just wanna stay lost in your light again." },
    { time: 258, text: "Neon…" },
    { time: 261, text: "Stay on…" },
    { time: 264, text: "'Til the sun come ruin this song." }
  ];
  let currentTrack = 0;
  const audio = document.getElementById('bootyquake-audio');
  const videoPlayBtn = document.getElementById('video-play-pause');
  const audioPlayBtn = document.getElementById('audio-play-pause');
  const trackDisplay = document.querySelector('.hub-cta-track');
  const audioTimeDisplay = document.getElementById('audio-time');
  const videoTimeDisplay = document.getElementById('video-time');

  const karaokeContainer = document.getElementById('karaoke-container');
  const karaokeLyrics = document.getElementById('karaoke-lyrics');

  const lyricsByTrack = {
    'block-party-bootyquake': blockPartyLyrics,
    'neon-thong-vision': neonThongLyrics,
    'queens-of-the-shakes': queenOfTheQuakeLyrics,
    'bounce-back-booty': bounceBackBootyLyrics,
    'scam-and-shake': scamAndShakeLyrics,
    'strip-to-the-top': stripToTheTopLyrics,
    'rachet-earthquake': rachetEarthquakeLyrics,
    'precious-things': preciousThingsLyrics,
    'boss-that-booty': bossThatBootyLyrics,
    'royal-life': royalLifeLyrics,
    'loyal-love-righteous-life': loyalLoveRighteousLifeLyrics,
    'life-is-amazing': lifeIsAmazingLyrics,
    'billion-dollar-bitch-talk': billionDollarBitchTalkLyrics,
    'billionaire-daydreams': billionaireDaydreamsLyrics,
    'courtside-ass': courtsideAssLyrics,
    'astro-booty': astroBootyLyrics,
    'booty-bag': bootyBagLyrics,
    'fetch-that-monet': fetchThatMonetLyrics,
    'shake-that-booty-please': shakeThatBootyPleaseLyrics,
    'ass-boost-party-anthem': assBoostPartyAnthemLyrics
  };

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function loadTrack(index) {
    if (!audio) return;
    lastKaraokeIndex = -1;
    currentTrack = index;
    audio.src = playlist[index].src;
    trackDisplay.textContent = playlist[index].title;
    document.querySelectorAll('.track-list-item').forEach(el => {
      el.classList.toggle('active', el.dataset.track === playlist[index].id);
    });
    audio.load();
    audio.onerror = () => {
      trackDisplay.textContent = playlist[index].title + ' (add .mp3 to audio/)';
    };
    if (playlist[index].lyrics) {
      karaokeContainer?.classList.add('visible');
      const lyrics = lyricsByTrack[playlist[index].id];
      if (lyrics && lyrics.length) {
        karaokeLyrics.innerHTML = lyrics.map((l, i) => '<span class="karaoke-line" data-time="' + l.time + '">' + escapeHtml(l.text) + '</span>').join('<span class="karaoke-sep"> • </span>');
      } else {
        karaokeLyrics.textContent = 'No lyrics for this track.';
      }
    } else {
      karaokeContainer?.classList.remove('visible');
    }
  }
  window.__bootyquakeLoadTrack = loadTrack;

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // Lyrics slide left-to-right at 120 BPM
  const BPM = 120;
  const PX_PER_BEAT = 100;
  const MS_PER_BEAT = 60000 / BPM;
  const SCROLL_SPEED_PX_PER_SEC = PX_PER_BEAT / (MS_PER_BEAT / 1000);

  let lastKaraokeTime = 0;
  let lyricsRafId = null;
  function updateLyricsScroll() {
    if (!karaokeLyrics || !karaokeContainer?.classList.contains('visible') || !audio || audio.paused) {
      lastKaraokeTime = 0;
      return;
    }
    const maxScroll = Math.max(0, karaokeLyrics.scrollWidth - karaokeLyrics.clientWidth);
    if (maxScroll <= 0) return;
    const now = performance.now() / 1000;
    if (lastKaraokeTime === 0) lastKaraokeTime = now;
    const delta = now - lastKaraokeTime;
    lastKaraokeTime = now;
    karaokeLyrics.scrollLeft = Math.min(maxScroll, karaokeLyrics.scrollLeft + SCROLL_SPEED_PX_PER_SEC * delta);
    lyricsRafId = requestAnimationFrame(updateLyricsScroll);
  }
  function updateTime() {
    if (audioTimeDisplay && audio) audioTimeDisplay.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
    try {
      const yt = window.__ytPlayer;
      if (videoTimeDisplay && yt?.getCurrentTime) {
        const vt = yt.getCurrentTime();
        const vd = yt.getDuration?.() ?? 0;
        videoTimeDisplay.textContent = formatTime(vt) + ' / ' + formatTime(vd);
      }
    } catch (_) {}
    if (karaokeLyrics && karaokeContainer?.classList.contains('visible')) {
      const lines = karaokeLyrics.querySelectorAll('.karaoke-line[data-time]');
      if (lines.length) {
        const t = audio?.currentTime ?? 0;
        let idx = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
          if (Number(lines[i].dataset.time) <= t) { idx = i; break; }
        }
        if (idx < 0) idx = 0;
        lines.forEach((el, i) => el.classList.toggle('active', i === idx));
        if (audio && !audio.paused) {
          if (!lyricsRafId) lyricsRafId = requestAnimationFrame(updateLyricsScroll);
        } else {
          if (lyricsRafId) cancelAnimationFrame(lyricsRafId);
          lyricsRafId = null;
          lastKaraokeTime = 0;
        }
      }
    } else {
      if (lyricsRafId) cancelAnimationFrame(lyricsRafId);
      lyricsRafId = null;
      lastKaraokeTime = 0;
    }
  }

  // Sync lyrics scroll when user seeks (jump to correct position)
  if (audio) {
    audio.addEventListener('seeking', () => {
      lastKaraokeTime = 0;
      if (karaokeLyrics && karaokeContainer?.classList.contains('visible')) {
        const maxScroll = Math.max(0, karaokeLyrics.scrollWidth - karaokeLyrics.clientWidth);
        const dur = audio.duration;
        if (isFinite(dur) && dur > 0 && maxScroll > 0) {
          karaokeLyrics.scrollLeft = (audio.currentTime / dur) * maxScroll;
        }
      }
    });
  }

  if (audio) {
    loadTrack(0);
    window.__bootyquakeCurrentVideoIndex = 0;
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateTime);
    audio.addEventListener('play', () => {
      audioPlayBtn?.setAttribute('aria-label', 'Pause');
      audioPlayBtn && (audioPlayBtn.textContent = '⏸');
    });
    audio.addEventListener('pause', () => {
      audioPlayBtn?.setAttribute('aria-label', 'Play');
      audioPlayBtn && (audioPlayBtn.textContent = '▶');
    });
    audio.addEventListener('ended', () => {
      const nextTrack = (currentTrack + 1) % playlist.length;
      const videos = window.__bootyquakeVideos || [];
      const nextVideo = videos.length ? ((window.__bootyquakeCurrentVideoIndex || 0) + 1) % videos.length : 0;
      loadTrack(nextTrack);
      window.__bootyquakeCurrentVideoIndex = nextVideo;
      if (typeof window.__bootyquakeSelectVideoByIndex === 'function') window.__bootyquakeSelectVideoByIndex(nextVideo);
      audio.play().catch(() => {});
      try { window.__ytPlayer?.playVideo?.(); } catch (_) {}
    });
  }

  // Video seek bar – independent control
  const videoSeekBar = document.getElementById('video-seek-bar');
  const videoSeekFill = document.getElementById('video-seek-fill');
  const videoSeekThumb = document.getElementById('video-seek-thumb');

  function updateVideoSeekBar() {
    if (videoSeekDragRef.dragging) return;
    if (performance.now() - lastVideoSeekTime < 800) return;
    try {
      const yt = window.__ytPlayer;
      if (!videoSeekFill || !yt?.getDuration) return;
      const dur = yt.getDuration();
      if (!isFinite(dur) || dur <= 0) return;
      const vt = yt.getCurrentTime();
      const pct = (vt / dur) * 100;
      videoSeekFill.style.width = pct + '%';
      if (videoSeekThumb) videoSeekThumb.style.left = pct + '%';
      videoSeekBar?.setAttribute('aria-valuenow', Math.round(pct));
    } catch (_) {}
  }

  let lastVideoSeekTime = 0;
  function seekVideoTo(frac) {
    try {
      const yt = window.__ytPlayer;
      if (!yt?.seekTo) return;
      const dur = yt.getDuration?.() ?? 0;
      if (!isFinite(dur) || dur <= 0) return;
      const t = Math.max(0, Math.min(1, frac)) * dur;
      yt.seekTo(t, true);
      lastVideoSeekTime = performance.now();
      if (videoSeekFill) {
        const pct = frac * 100;
        videoSeekFill.style.width = pct + '%';
        if (videoSeekThumb) videoSeekThumb.style.left = pct + '%';
      }
    } catch (_) {}
  }

  const videoSeekDragRef = { dragging: false };
  const audioSeekDragRef = { dragging: false };

  function setupSeekBar(bar, fill, thumb, getDur, getCur, seekFn, updateFn, dragRef) {
    if (!bar || !fill) return;
    function handleSeek(clientX) {
      const rect = bar.getBoundingClientRect();
      seekFn((clientX - rect.left) / rect.width);
    }
    bar.addEventListener('click', (e) => handleSeek(e.clientX));
    bar.addEventListener('mousedown', (e) => { dragRef.dragging = true; handleSeek(e.clientX); });
    bar.addEventListener('touchstart', (e) => { dragRef.dragging = true; if (e.touches[0]) handleSeek(e.touches[0].clientX); }, { passive: true });
    document.addEventListener('mousemove', (e) => { if (dragRef.dragging) handleSeek(e.clientX); });
    document.addEventListener('touchmove', (e) => { if (dragRef.dragging && e.touches[0]) handleSeek(e.touches[0].clientX); }, { passive: true });
    document.addEventListener('mouseup', () => { dragRef.dragging = false; });
    document.addEventListener('touchend', () => { dragRef.dragging = false; });
    bar.addEventListener('keydown', (e) => {
      const dur = getDur();
      if (!dur || dur <= 0) return;
      const step = e.shiftKey ? 10 : 5;
      const delta = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? step : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -step : 0;
      if (delta === 0) return;
      e.preventDefault();
      const cur = getCur();
      seekFn((cur + delta) / dur);
    });
  }

  // Audio seek bar – independent control
  const audioSeekBar = document.getElementById('audio-seek-bar');
  const audioSeekFill = document.getElementById('audio-seek-fill');
  const audioSeekThumb = document.getElementById('audio-seek-thumb');

  function updateAudioSeekBar() {
    if (audioSeekDragRef.dragging) return;
    if (!audioSeekFill || !audio) return;
    const dur = audio.duration;
    if (!isFinite(dur) || dur <= 0) return;
    const pct = (audio.currentTime / dur) * 100;
    audioSeekFill.style.width = pct + '%';
    if (audioSeekThumb) audioSeekThumb.style.left = pct + '%';
    audioSeekBar?.setAttribute('aria-valuenow', Math.round(pct));
  }

  function seekAudioTo(frac) {
    if (!audio) return;
    const dur = audio.duration;
    if (!isFinite(dur) || dur <= 0) return;
    const t = Math.max(0, Math.min(1, frac)) * dur;
    audio.currentTime = t;
    updateAudioSeekBar();
  }

  if (audio) {
    audio.addEventListener('timeupdate', updateAudioSeekBar);
    audio.addEventListener('loadedmetadata', updateAudioSeekBar);
  }

  setupSeekBar(
    videoSeekBar, videoSeekFill, videoSeekThumb,
    () => { try { return window.__ytPlayer?.getDuration?.() ?? 0; } catch (_) { return 0; } },
    () => { try { return window.__ytPlayer?.getCurrentTime?.() ?? 0; } catch (_) { return 0; } },
    seekVideoTo, updateVideoSeekBar, videoSeekDragRef
  );

  setupSeekBar(
    audioSeekBar, audioSeekFill, audioSeekThumb,
    () => audio?.duration ?? 0,
    () => audio?.currentTime ?? 0,
    seekAudioTo, updateAudioSeekBar, audioSeekDragRef
  );

  // Poll video seek bar when YT player is active
  setInterval(updateVideoSeekBar, 500);

  function playBootyquake() {
    document.getElementById('music')?.scrollIntoView({ behavior: 'smooth' });
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
      audioPlayBtn?.setAttribute('aria-label', 'Pause');
      audioPlayBtn && (audioPlayBtn.textContent = '⏸');
      try { window.__ytPlayer?.playVideo?.(); } catch (_) {}
      videoPlayBtn?.setAttribute('aria-label', 'Pause video');
      videoPlayBtn && (videoPlayBtn.textContent = '⏸');
      document.getElementById('hub-cta-bar')?.classList.add('playing');
    }
  }

  document.getElementById('play-bootyquake')?.addEventListener('click', playBootyquake);

  function showPlayingState() {
    document.getElementById('hub-cta-bar')?.classList.add('playing');
  }

  videoPlayBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    try {
      const yt = window.__ytPlayer;
      if (!yt?.getPlayerState) return;
      const s = yt.getPlayerState();
      if (s === 1) {
        yt.pauseVideo?.();
        videoPlayBtn.setAttribute('aria-label', 'Play video');
        videoPlayBtn.textContent = '▶';
      } else {
        yt.playVideo?.();
        videoPlayBtn.setAttribute('aria-label', 'Pause video');
        videoPlayBtn.textContent = '⏸';
      }
    } catch (_) {}
  });

  audioPlayBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
      audioPlayBtn.setAttribute('aria-label', 'Pause');
      audioPlayBtn.textContent = '⏸';
      showPlayingState();
    } else {
      audio.pause();
      audioPlayBtn.setAttribute('aria-label', 'Play');
      audioPlayBtn.textContent = '▶';
    }
  });

  // Track list items - play track when clicked
  document.querySelectorAll('.track-list-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const trackId = btn.getAttribute('data-track');
      if (trackId) {
        const idx = playlist.findIndex(t => t.id === trackId);
        if (idx >= 0 && audio) {
          loadTrack(idx);
          audio.play().catch(() => {});
          audioPlayBtn?.setAttribute('aria-label', 'Pause');
          audioPlayBtn && (audioPlayBtn.textContent = '⏸');
          videoPlayBtn?.setAttribute('aria-label', 'Pause video');
          videoPlayBtn && (videoPlayBtn.textContent = '⏸');
          document.querySelectorAll('.track-list-item').forEach(el => el.classList.remove('active'));
          btn.classList.add('active');
          showPlayingState();
          try { window.__ytPlayer?.playVideo?.(); } catch (_) {}
        }
      }
      document.getElementById('music')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  } catch (err) {
    console.error('BootyQuake init error:', err);
  }
});
