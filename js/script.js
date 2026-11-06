/**
 * HAPPY BIRTHDAY, APPA! — Premium Cinematic Experience
 * Core JavaScript Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons if available
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  /* ==========================================================================
     DOM ELEMENTS
     ========================================================================== */
  // Surprise Screen
  const surpriseScreen = document.getElementById('surprise-screen');
  const btnOpenSurprise = document.getElementById('btn-open-surprise');
  const giftBoxTrigger = document.getElementById('gift-box-trigger');

  // Audio Elements
  const bgMusic = document.getElementById('bg-music');
  const voiceGreeting = document.getElementById('voice-greeting');
  const btnMusicToggle = document.getElementById('btn-music-toggle');
  const musicStatusText = document.getElementById('music-status-text');
  const musicWaveIndicator = document.getElementById('music-wave-indicator');

  // Voice Card Elements
  const voiceCard = document.getElementById('voice-card');
  const btnPlayVoice = document.getElementById('btn-play-voice');
  const voicePlayIcon = document.getElementById('voice-play-icon');
  const voiceDurationDisplay = document.getElementById('voice-duration-display');
  const voiceProgressTrack = document.getElementById('voice-progress-track');
  const voiceProgressFill = document.getElementById('voice-progress-fill');
  const voiceStatusTag = document.getElementById('voice-status-tag');
  const vizBars = document.querySelectorAll('.viz-bar');

  // Cake Elements
  const candle = document.getElementById('candle');
  const btnBlowCandles = document.getElementById('btn-blow-candles');
  const btnBlowText = document.getElementById('btn-blow-text');
  const wishRevealCard = document.getElementById('wish-reveal-card');

  // Replay
  const btnReplay = document.getElementById('btn-replay');

  // Lightbox Modal
  const photoModal = document.getElementById('photo-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');

  /* ==========================================================================
     AUDIO CONTROLLER & DUCKING ENGINE
     ========================================================================== */
  const DEFAULT_BG_VOLUME = 0.35;
  const DUCKED_BG_VOLUME = 0.05;
  let isBgMusicEnabled = false;
  let bgMusicFadeInterval = null;

  // Set initial volumes
  if (bgMusic) bgMusic.volume = DEFAULT_BG_VOLUME;
  if (voiceGreeting) voiceGreeting.volume = 1.0;

  /**
   * Smooth volume fade helper
   */
  function fadeAudio(audioEl, targetVol, duration = 500, callback) {
    if (!audioEl) return;
    if (bgMusicFadeInterval) clearInterval(bgMusicFadeInterval);

    const stepTime = 30;
    const steps = duration / stepTime;
    const volDiff = targetVol - audioEl.volume;
    const volStep = volDiff / steps;

    bgMusicFadeInterval = setInterval(() => {
      let nextVol = audioEl.volume + volStep;
      if ((volStep > 0 && nextVol >= targetVol) || (volStep < 0 && nextVol <= targetVol)) {
        audioEl.volume = Math.max(0, Math.min(1, targetVol));
        clearInterval(bgMusicFadeInterval);
        bgMusicFadeInterval = null;
        if (callback) callback();
      } else {
        audioEl.volume = Math.max(0, Math.min(1, nextVol));
      }
    }, stepTime);
  }

  /**
   * Start background music with smooth fade-in
   */
  function startBackgroundMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isBgMusicEnabled = true;
          fadeAudio(bgMusic, DEFAULT_BG_VOLUME, 1000);
          updateMusicUI(true);
        })
        .catch(err => {
          console.log('Background audio autoplay waiting for explicit gesture:', err);
          isBgMusicEnabled = false;
          updateMusicUI(false);
        });
    }
  }

  /**
   * Toggle background music
   */
  function toggleBackgroundMusic() {
    if (!bgMusic) return;
    if (bgMusic.paused) {
      bgMusic.play().then(() => {
        isBgMusicEnabled = true;
        fadeAudio(bgMusic, DEFAULT_BG_VOLUME, 400);
        updateMusicUI(true);
      }).catch(e => console.log('Music play prevented:', e));
    } else {
      fadeAudio(bgMusic, 0, 300, () => {
        bgMusic.pause();
        isBgMusicEnabled = false;
        updateMusicUI(false);
      });
    }
  }

  function updateMusicUI(isPlaying) {
    if (!btnMusicToggle) return;
    if (isPlaying) {
      btnMusicToggle.classList.add('is-playing', 'is-active');
      if (musicStatusText) musicStatusText.textContent = 'Birthday Song: On';
    } else {
      btnMusicToggle.classList.remove('is-playing', 'is-active');
      if (musicStatusText) musicStatusText.textContent = 'Birthday Song: Off';
    }
  }

  if (btnMusicToggle) {
    btnMusicToggle.addEventListener('click', toggleBackgroundMusic);
  }

  /* ==========================================================================
     1. SURPRISE UNBOXING SEQUENCE
     ========================================================================== */
  let surpriseOpened = false;

  function triggerSurpriseOpening() {
    if (surpriseOpened) return;
    surpriseOpened = true;

    // Trigger box opening animation
    if (giftBoxTrigger) {
      giftBoxTrigger.classList.add('is-opening');
    }

    // Launch celebratory golden confetti
    fireConfettiBurst();

    // Start background music
    setTimeout(() => {
      startBackgroundMusic();
    }, 400);

    // Fade out overlay & unlock page
    setTimeout(() => {
      if (surpriseScreen) {
        surpriseScreen.classList.add('is-hidden');
      }
      document.body.classList.remove('is-locked');
      
      // Secondary celebration shower
      setTimeout(() => {
        fireGoldenShower();
      }, 700);
    }, 900);
  }

  if (btnOpenSurprise) {
    btnOpenSurprise.addEventListener('click', triggerSurpriseOpening);
  }
  if (giftBoxTrigger) {
    giftBoxTrigger.addEventListener('click', triggerSurpriseOpening);
  }

  /* ==========================================================================
     2. PERSONAL VOICE GREETING AUDIO ENGINE
     ========================================================================== */
  let vizAnimationTimer = null;

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Load duration when available
  if (voiceGreeting) {
    voiceGreeting.addEventListener('loadedmetadata', () => {
      if (voiceDurationDisplay) {
        voiceDurationDisplay.textContent = `0:00 / ${formatTime(voiceGreeting.duration)}`;
      }
    });

    voiceGreeting.addEventListener('timeupdate', () => {
      if (!voiceGreeting.duration) return;
      const progress = (voiceGreeting.currentTime / voiceGreeting.duration) * 100;
      if (voiceProgressFill) {
        voiceProgressFill.style.width = `${progress}%`;
      }
      if (voiceDurationDisplay) {
        voiceDurationDisplay.textContent = `${formatTime(voiceGreeting.currentTime)} / ${formatTime(voiceGreeting.duration)}`;
      }
    });

    voiceGreeting.addEventListener('play', () => {
      // Duck background music
      if (bgMusic && !bgMusic.paused) {
        fadeAudio(bgMusic, DUCKED_BG_VOLUME, 400);
      }
      if (voiceCard) voiceCard.classList.add('is-playing');
      if (btnPlayVoice) btnPlayVoice.classList.add('is-playing');
      if (voiceStatusTag) voiceStatusTag.textContent = 'Speaking...';
      updateVoicePlayIcon(true);
      startVisualizer();
    });

    voiceGreeting.addEventListener('pause', () => {
      // Restore background music
      if (bgMusic && isBgMusicEnabled) {
        fadeAudio(bgMusic, DEFAULT_BG_VOLUME, 600);
      }
      if (voiceCard) voiceCard.classList.remove('is-playing');
      if (btnPlayVoice) btnPlayVoice.classList.remove('is-playing');
      if (voiceStatusTag) voiceStatusTag.textContent = 'Paused';
      updateVoicePlayIcon(false);
      stopVisualizer();
    });

    voiceGreeting.addEventListener('ended', () => {
      // Restore background music
      if (bgMusic && isBgMusicEnabled) {
        fadeAudio(bgMusic, DEFAULT_BG_VOLUME, 700);
      }
      if (voiceCard) voiceCard.classList.remove('is-playing');
      if (btnPlayVoice) btnPlayVoice.classList.remove('is-playing');
      if (voiceStatusTag) voiceStatusTag.textContent = 'Completed ❤️';
      if (voiceProgressFill) voiceProgressFill.style.width = '100%';
      updateVoicePlayIcon(false);
      stopVisualizer();
    });
  }

  function updateVoicePlayIcon(isPlaying) {
    if (!voicePlayIcon) return;
    if (isPlaying) {
      voicePlayIcon.setAttribute('data-lucide', 'pause');
    } else {
      voicePlayIcon.setAttribute('data-lucide', 'play');
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function toggleVoicePlayback() {
    if (!voiceGreeting) return;
    if (voiceGreeting.paused) {
      voiceGreeting.play().catch(e => console.log('Voice play prevented:', e));
    } else {
      voiceGreeting.pause();
    }
  }

  if (btnPlayVoice) {
    btnPlayVoice.addEventListener('click', toggleVoicePlayback);
  }

  // Scrubber click handler
  if (voiceProgressTrack && voiceGreeting) {
    voiceProgressTrack.addEventListener('click', (e) => {
      const rect = voiceProgressTrack.getBoundingClientRect();
      const clickPos = (e.clientX - rect.left) / rect.width;
      if (voiceGreeting.duration) {
        voiceGreeting.currentTime = clickPos * voiceGreeting.duration;
      }
    });
  }

  // Simulated dynamic audio visualizer
  function startVisualizer() {
    if (vizAnimationTimer) clearInterval(vizAnimationTimer);
    vizAnimationTimer = setInterval(() => {
      vizBars.forEach((bar, idx) => {
        // Generate dynamic organic wave heights
        const wave = Math.sin(Date.now() / 150 + idx * 0.8);
        const randomSpike = Math.random() * 8;
        const height = Math.max(4, Math.min(22, 10 + wave * 8 + randomSpike));
        bar.style.height = `${height}px`;
      });
    }, 80);
  }

  function stopVisualizer() {
    if (vizAnimationTimer) clearInterval(vizAnimationTimer);
    vizAnimationTimer = null;
    vizBars.forEach(bar => {
      bar.style.height = '4px';
    });
  }

  /* ==========================================================================
     3. INTERACTIVE BIRTHDAY CAKE & CANDLE BLOWING
     ========================================================================== */
  let candleBlown = false;

  function blowCandle() {
    if (candleBlown) return;
    candleBlown = true;

    if (candle) {
      candle.classList.add('is-blown');
    }

    if (btnBlowText) {
      btnBlowText.textContent = 'Wish Granted! ✨';
    }
    if (btnBlowCandles) {
      btnBlowCandles.disabled = true;
      btnBlowCandles.style.opacity = '0.7';
      btnBlowCandles.style.cursor = 'default';
    }

    // Launch celebratory confetti burst
    fireConfettiBurst();

    // Show glowing wish reveal card
    setTimeout(() => {
      if (wishRevealCard) {
        wishRevealCard.classList.add('is-visible');
      }
    }, 600);
  }

  if (candle) {
    candle.addEventListener('click', blowCandle);
  }
  if (btnBlowCandles) {
    btnBlowCandles.addEventListener('click', blowCandle);
  }

  /* ==========================================================================
     4. PHOTO GALLERY & LIGHTBOX MODAL
     ========================================================================== */
  const photoData = {
    '1': {
      src: 'assets/images/memory-1.jpg',
      caption: 'Every beautiful story has a beginning — Chapter I'
    },
    '2': {
      src: 'assets/images/memory-2.jpg',
      caption: 'Together, through every chapter of life — Chapter II'
    },
    '3': {
      src: 'assets/images/family-photo.jpg',
      caption: 'My greatest blessing is having you as my family — The Emotional Highlight'
    }
  };

  const memoryCards = document.querySelectorAll('.memory-card');
  memoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const photoId = card.getAttribute('data-photo');
      const data = photoData[photoId];
      if (data && photoModal && modalImg && modalCaption) {
        modalImg.src = data.src;
        modalCaption.textContent = data.caption;
        photoModal.classList.add('is-active');
        photoModal.setAttribute('aria-hidden', 'false');
      }
    });
  });

  function closeModal() {
    if (photoModal) {
      photoModal.classList.remove('is-active');
      photoModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && photoModal && photoModal.classList.contains('is-active')) {
      closeModal();
    }
  });

  /* ==========================================================================
     5. REPLAY YOUR SURPRISE
     ========================================================================== */
  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      // Pause voice if playing
      if (voiceGreeting && !voiceGreeting.paused) {
        voiceGreeting.pause();
        voiceGreeting.currentTime = 0;
      }

      // Reset cake
      candleBlown = false;
      if (candle) candle.classList.remove('is-blown');
      if (btnBlowText) btnBlowText.textContent = 'Make a Wish & Blow Candle';
      if (btnBlowCandles) {
        btnBlowCandles.disabled = false;
        btnBlowCandles.style.opacity = '1';
        btnBlowCandles.style.cursor = 'pointer';
      }
      if (wishRevealCard) wishRevealCard.classList.remove('is-visible');

      // Reset surprise screen
      surpriseOpened = false;
      if (giftBoxTrigger) giftBoxTrigger.classList.remove('is-opening');
      if (surpriseScreen) surpriseScreen.classList.remove('is-hidden');
      document.body.classList.add('is-locked');

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     6. SCROLL REVEAL (INTERSECTION OBSERVER)
     ========================================================================== */
  const revealItems = document.querySelectorAll('.reveal-item');
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealItems.forEach(item => {
    revealObserver.observe(item);
  });

  /* ==========================================================================
     7. GOLDEN CELEBRATION CONFETTI
     ========================================================================== */
  function fireConfettiBurst() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ffe682', '#d4af37', '#ffffff', '#fae8c8', '#aa7c11']
      });
    }
  }

  function fireGoldenShower() {
    if (typeof confetti === 'function') {
      const end = Date.now() + 1500;
      const colors = ['#ffe682', '#d4af37', '#ffffff'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }

  /* ==========================================================================
     8. AMBIENT GOLDEN PARTICLES (CANVAS ENGINE)
     ========================================================================== */
  const canvas = document.getElementById('ambient-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    const particles = [];
    const PARTICLE_COUNT = 55;

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    class GoldParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 1.8 + 0.6;
        this.speedY = -(Math.random() * 0.45 + 0.15);
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.shimmerSpeed = Math.random() * 0.02 + 0.01;
        this.color = Math.random() > 0.3 ? '212, 175, 55' : '255, 230, 130';
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.alpha += Math.sin(Date.now() * this.shimmerSpeed) * 0.008;

        if (this.y < -10) this.y = height + 10;
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${Math.max(0.1, Math.min(0.85, this.alpha))})`;
        ctx.shadowBlur = this.radius * 4;
        ctx.shadowColor = `rgba(${this.color}, 0.8)`;
        ctx.fill();
      }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new GoldParticle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }
});
