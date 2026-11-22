/**
 * 🌕 Loy Krathong with Love - Main Application Controller
 * Coordinates UI, Realtime synchronization, Audio Player, Krathong Studio,
 * 10-Second Countdown Sync, and River Canvas Simulation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- APPLICATION STATE ---
  const state = {
    screen: 'home', // 'home' | 'studio' | 'river'
    builder: new KrathongBuilder(),
    partnerBuilder: new KrathongBuilder(),
    partnerConfig: null,
    partnerConnected: false,
    myReady: false,
    partnerReady: false,
    isCountingDown: false,
    previewTarget: 'mine', // 'mine' | 'partner'
    countdownSeconds: 10,
    countdownInterval: null,
    isSoloMode: false,
    isGuest: false,
    riverSim: null,
    roomId: null
  };

  // Pre-fill partner dummy config for solo mode
  const defaultPartnerConfig = {
    base: 'heart_love',
    petal: 'folded_leaf',
    flower: 'roses',
    candle: 'pink_love',
    incense: true,
    photo: { dataUrl: null, frame: 'heart', scale: 1, rotate: 0, x: 0, y: -30 },
    decoration: 'ribbon',
    myName: '',
    partnerName: '',
    wish: 'ขอให้ความรักของเราสองคนเบ่งบานงดงามเหมือนดอกบัวในคืนวันเพ็ญนะ 💕'
  };

  // --- NAME RESOLUTION HELPERS ---
  function getMyName() {
    const val = (state.builder.config.myName || (inputMyName ? inputMyName.value : '')).trim();
    if (val && val !== 'ตัวเรา' && val !== 'ชื่อเรา') return val;
    return 'เรา';
  }

  function getPartnerName() {
    // 1. If remote partner connected and sent their own name (partnerConfig.myName)
    if (state.partnerConfig && state.partnerConfig.myName) {
      const pName = state.partnerConfig.myName.trim();
      if (pName && pName !== 'แฟนที่รัก' && pName !== 'ชื่อแฟน' && pName !== 'เรา') {
        return pName;
      }
    }
    // 2. In solo mode or when partner hasn't set their name, use the partner name entered in input
    const entered = (state.builder.config.partnerName || (inputPartnerName ? inputPartnerName.value : '')).trim();
    if (entered && entered !== 'แฟนที่รัก' && entered !== 'ชื่อแฟน') {
      return entered;
    }
    return 'แฟน';
  }

  // --- DOM ELEMENTS ---
  const screens = {
    home: document.getElementById('screen-home'),
    studio: document.getElementById('screen-studio'),
    river: document.getElementById('screen-river')
  };

  const headerRoomBadge = document.getElementById('header-room-badge');
  const headerRoomText = document.getElementById('header-room-text');
  const copyRoomLinkBtn = document.getElementById('copy-room-link-btn');

  // Music UI
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicDiskIcon = document.getElementById('music-disk-icon');
  const musicTrackTitle = document.getElementById('music-track-title');
  const musicStatusText = document.getElementById('music-status-text');
  const musicNextBtn = document.getElementById('music-next-btn');

  // Studio Ready Status & Preview switcher
  const liveStage = document.getElementById('live-krathong-stage');
  const chipMyReady = document.getElementById('chip-my-ready');
  const iconMyReady = document.getElementById('icon-my-ready');
  const textMyReady = document.getElementById('text-my-ready');
  const chipPartnerReady = document.getElementById('chip-partner-ready');
  const iconPartnerReady = document.getElementById('icon-partner-ready');
  const textPartnerReady = document.getElementById('text-partner-ready');
  const btnPreviewMine = document.getElementById('btn-preview-mine');
  const btnPreviewPartner = document.getElementById('btn-preview-partner');

  // Ready Button in Studio
  const btnReadyToFloat = document.getElementById('btn-ready-to-float');
  const btnReadyIcon = document.getElementById('btn-ready-icon');
  const btnReadyText = document.getElementById('btn-ready-text');

  // Countdown Overlay Elements
  const countdownOverlay = document.getElementById('countdown-overlay');
  const countdownNumberDisplay = document.getElementById('countdown-number-display');
  const countdownProgressRing = document.getElementById('countdown-progress-ring');
  const countdownMyThumb = document.getElementById('countdown-my-thumb');
  const countdownPartnerThumb = document.getElementById('countdown-partner-thumb');
  const countdownMyName = document.getElementById('countdown-my-name');
  const countdownPartnerName = document.getElementById('countdown-partner-name');
  const btnCancelCountdown = document.getElementById('btn-cancel-countdown');

  // Photo controls
  const photoFileInput = document.getElementById('photo-file-input');
  const photoUploadTrigger = document.getElementById('photo-upload-trigger');
  const sliderPhotoScale = document.getElementById('slider-photo-scale');
  const sliderPhotoRotate = document.getElementById('slider-photo-rotate');
  const valPhotoScale = document.getElementById('val-photo-scale');
  const valPhotoRotate = document.getElementById('val-photo-rotate');
  const btnRemovePhoto = document.getElementById('btn-remove-photo');
  const photoAdjustmentsPanel = document.getElementById('photo-adjustments-panel');

  // Wish & Name inputs
  const inputMyName = document.getElementById('input-my-name');
  const inputPartnerName = document.getElementById('input-partner-name');
  const inputWish = document.getElementById('input-wish');

  // Modals
  const modalJoin = document.getElementById('modal-join-room');
  const modalShare = document.getElementById('modal-share-room');
  const modalWhisper = document.getElementById('modal-whisper');
  const modalKeepsake = document.getElementById('modal-keepsake');

  // --- INITIALIZE UI ---
  function init() {
    renderStudioOptionGrids();
    setupEventListeners();
    setupRealtimeHandlers();
    checkUrlQueryParams();
    updateReadyUI();
    updateLivePreview();
  }

  // --- SCREEN NAVIGATION ---
  const navHistory = ['home'];

  function showScreen(screenName, isBack = false) {
    if (!isBack && navHistory[navHistory.length - 1] !== screenName) {
      navHistory.push(screenName);
    }
    state.screen = screenName;
    Object.keys(screens).forEach(key => {
      screens[key].classList.remove('active');
    });
    if (screens[screenName]) {
      screens[screenName].classList.add('active');
    }

    // Universal Header Back Button Display & Text
    const headerBackBtn = document.getElementById('header-back-btn');
    if (headerBackBtn) {
      if (screenName === 'home') {
        headerBackBtn.style.display = 'none';
      } else if (screenName === 'studio') {
        headerBackBtn.style.display = 'inline-flex';
        headerBackBtn.textContent = '← กลับหน้าแรก';
      } else if (screenName === 'river') {
        headerBackBtn.style.display = 'inline-flex';
        headerBackBtn.textContent = '← กลับไปแต่งกระทง';
      }
    }

    if (screenName === 'river') {
      startRiverView();
    } else if (state.riverSim) {
      state.riverSim.stop();
    }
  }

  function goBack() {
    stopCountdown();
    if (state.screen === 'river') {
      state.myReady = false;
      state.partnerReady = false;
      updateReadyUI();
      showScreen('studio', true);
    } else if (state.screen === 'studio') {
      if (confirm('ต้องการย้อนกลับสู่หน้าแรกหรือไม่?')) {
        state.myReady = false;
        state.partnerReady = false;
        showScreen('home', true);
      }
    } else {
      showScreen('home', true);
    }
  }

  // --- LIVE PREVIEW UPDATE ---
  function updateLivePreview() {
    if (!liveStage) return;

    if (state.previewTarget === 'mine') {
      liveStage.innerHTML = state.builder.generateSVG(300, 300, false);
    } else {
      // Preview Partner's Krathong
      const pBuilder = new KrathongBuilder();
      const pCfg = Object.assign({}, defaultPartnerConfig, state.partnerConfig || {});
      pCfg.myName = getPartnerName();
      pCfg.partnerName = getMyName();
      pBuilder.importConfig(pCfg);
      liveStage.innerHTML = pBuilder.generateSVG(300, 300, false);
    }

    // If connected to partner, send real-time design sync
    if (state.roomId && window.realtimeEngine.isConnected) {
      window.realtimeEngine.sendKrathongConfig(state.builder.exportConfig());
    }
  }

  // --- UPDATE READY UI BADGES & BUTTON ---
  function updateReadyUI() {
    const myName = getMyName();
    const partnerName = getPartnerName();

    // My status badge
    if (chipMyReady) {
      if (state.myReady) {
        chipMyReady.className = 'ready-chip is-ready';
        iconMyReady.textContent = '✅';
        textMyReady.textContent = `${myName}: พร้อมแล้ว!`;
      } else {
        chipMyReady.className = 'ready-chip';
        iconMyReady.textContent = '✏️';
        textMyReady.textContent = `${myName}: กำลังแต่ง`;
      }
    }

    // Partner's status badge
    if (chipPartnerReady) {
      if (state.partnerReady) {
        chipPartnerReady.className = 'ready-chip is-ready';
        iconPartnerReady.textContent = '✅';
        textPartnerReady.textContent = `${partnerName}: พร้อมแล้ว!`;
      } else if (state.partnerConnected || state.isSoloMode) {
        chipPartnerReady.className = 'ready-chip is-waiting';
        iconPartnerReady.textContent = '✏️';
        textPartnerReady.textContent = `${partnerName}: กำลังแต่ง`;
      } else {
        chipPartnerReady.className = 'ready-chip';
        iconPartnerReady.textContent = '⏳';
        textPartnerReady.textContent = `${partnerName}: รอเชื่อมต่อ...`;
      }
    }

    // Bottom Ready Button
    if (btnReadyToFloat) {
      if (state.myReady) {
        btnReadyToFloat.classList.add('ready-active');
        if (btnReadyIcon) btnReadyIcon.textContent = '⏳';
        if (btnReadyText) btnReadyText.textContent = state.partnerReady ? 'พร้อมทั้งคู่แล้ว!' : 'พร้อมแล้ว (รอแฟนสักครู่...)';
      } else {
        btnReadyToFloat.classList.remove('ready-active');
        if (btnReadyIcon) btnReadyIcon.textContent = '✨';
        if (btnReadyText) btnReadyText.textContent = 'พร้อมลอยแล้ว (Ready)';
      }
    }
  }

  // --- RENDER CUSTOMIZATION OPTIONS ---
  function renderStudioOptionGrids() {
    const opts = state.builder.options;

    // Bases (15 Shapes!)
    renderOptionGroup('options-bases', opts.bases, state.builder.config.base, (val) => {
      state.builder.setOption('base', val);
      state.previewTarget = 'mine';
      updatePreviewTabsUI();
      updateLivePreview();
      window.audioEngine.playSparkle();
    });

    // Petals
    renderOptionGroup('options-petals', opts.petals, state.builder.config.petal, (val) => {
      state.builder.setOption('petal', val);
      state.previewTarget = 'mine';
      updatePreviewTabsUI();
      updateLivePreview();
      window.audioEngine.playSparkle();
    });

    // Flowers
    renderOptionGroup('options-flowers', opts.flowers, state.builder.config.flower, (val) => {
      state.builder.setOption('flower', val);
      state.previewTarget = 'mine';
      updatePreviewTabsUI();
      updateLivePreview();
      window.audioEngine.playSparkle();
    });

    // Candles
    renderOptionGroup('options-candles', opts.candles, state.builder.config.candle, (val) => {
      state.builder.setOption('candle', val);
      state.previewTarget = 'mine';
      updatePreviewTabsUI();
      updateLivePreview();
      window.audioEngine.playSparkle();
    });

    // Decorations
    renderOptionGroup('options-decorations', opts.decorations, state.builder.config.decoration, (val) => {
      state.builder.setOption('decoration', val);
      state.previewTarget = 'mine';
      updatePreviewTabsUI();
      updateLivePreview();
      window.audioEngine.playSparkle();
    });
  }

  function renderOptionGroup(containerId, items, selectedValue, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = `option-item ${item.id === selectedValue ? 'selected' : ''}`;
      el.innerHTML = `
        <div class="option-icon">${item.icon}</div>
        <div class="option-name">${item.name}</div>
      `;
      el.addEventListener('click', () => {
        container.querySelectorAll('.option-item').forEach(b => b.classList.remove('selected'));
        el.classList.add('selected');
        onSelect(item.id);
      });
      container.appendChild(el);
    });
  }

  function updatePreviewTabsUI() {
    if (state.previewTarget === 'mine') {
      btnPreviewMine.classList.add('active');
      btnPreviewPartner.classList.remove('active');
    } else {
      btnPreviewPartner.classList.add('active');
      btnPreviewMine.classList.remove('active');
    }
  }

  // --- 10-SECOND COUNTDOWN LOGIC ---
  function startCountdown() {
    // Prevent duplicate triggers if already counting down or floating in river
    if (state.isCountingDown || state.screen === 'river') return;
    state.isCountingDown = true;

    if (state.countdownInterval) {
      clearInterval(state.countdownInterval);
      state.countdownInterval = null;
    }

    // Stop/pause song if playing beforehand, to build anticipation and play fresh when floating begins
    if (window.audioEngine.isPlaying) {
      window.audioEngine.stop();
      updateMusicUI(false);
    }

    state.countdownSeconds = 10;
    const myName = getMyName();
    const partnerName = getPartnerName();

    // Populate Duo Krathong Preview
    countdownMyThumb.innerHTML = state.builder.generateSVG(110, 110, false);
    countdownMyName.textContent = `กระทงของ ${myName}`;

    const pBuilder = new KrathongBuilder();
    const pCfg = Object.assign({}, defaultPartnerConfig, state.partnerConfig || {});
    pCfg.myName = partnerName;
    pCfg.partnerName = myName;
    pBuilder.importConfig(pCfg);
    countdownPartnerThumb.innerHTML = pBuilder.generateSVG(110, 110, false);
    countdownPartnerName.textContent = `กระทงของ ${partnerName}`;

    // Reset circle animation
    countdownProgressRing.style.strokeDashoffset = '0';
    countdownNumberDisplay.textContent = '10';

    // Show Overlay
    countdownOverlay.classList.add('active');
    window.audioEngine.playSparkle();

    // Start 1-second interval
    state.countdownInterval = setInterval(() => {
      state.countdownSeconds--;

      if (state.countdownSeconds >= 0) {
        countdownNumberDisplay.textContent = state.countdownSeconds;
        // Circumference is 2 * PI * 60 ≈ 377
        const offset = 377 * (1 - state.countdownSeconds / 10);
        countdownProgressRing.style.strokeDashoffset = offset;

        // Play countdown chime/tick
        if (state.countdownSeconds > 0) {
          window.audioEngine.scheduleChingRhythm(0, 'ching');
        }
      }

      if (state.countdownSeconds <= 0) {
        clearInterval(state.countdownInterval);
        state.countdownInterval = null;
        state.isCountingDown = false;

        countdownNumberDisplay.textContent = '🌊';
        window.audioEngine.playWaterSplash();
        window.audioEngine.playFirework();

        setTimeout(() => {
          countdownOverlay.classList.remove('active');
          showScreen('river');
        }, 700);
      }
    }, 1000);
  }

  function stopCountdown() {
    state.isCountingDown = false;
    if (state.countdownInterval) {
      clearInterval(state.countdownInterval);
      state.countdownInterval = null;
    }
    if (countdownOverlay) {
      countdownOverlay.classList.remove('active');
    }
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Brand header returns to home
    document.getElementById('brand-home-btn').addEventListener('click', () => {
      if (confirm('ต้องการกลับสู่หน้าแรกหรือไม่?')) {
        stopCountdown();
        showScreen('home');
      }
    });


    // Mode 1: Create Couple Room
    const handleCreateRoom = (e) => {
      if (e) e.stopPropagation();
      try {
        const code = window.realtimeEngine.createRoom();
        state.roomId = code;
      } catch (err) {
        console.warn('Realtime engine notice:', err);
        state.roomId = 'LOVE-' + Math.floor(1000 + Math.random() * 9000);
      }
      state.isSoloMode = false;

      if (headerRoomBadge) headerRoomBadge.style.display = 'none';
      if (headerRoomText) headerRoomText.textContent = `ห้อง: ${state.roomId}`;
      const codeDisplay = document.getElementById('modal-room-code-display');
      if (codeDisplay) codeDisplay.textContent = state.roomId;

      if (modalShare) modalShare.classList.add('open');
    };

    const cardCreate = document.getElementById('mode-create-room');
    if (cardCreate) cardCreate.addEventListener('click', handleCreateRoom);
    const btnCreate = document.getElementById('btn-create-room');
    if (btnCreate) btnCreate.addEventListener('click', handleCreateRoom);

    // Mode 2: Join Partner's Room (Guest does not need to enter names on home)
    const handleJoinRoom = (e) => {
      if (e) e.stopPropagation();
      if (modalJoin) {
        modalJoin.classList.add('open');
        const joinInput = document.getElementById('join-room-input');
        if (joinInput) {
          setTimeout(() => joinInput.focus(), 150);
        }
      }
    };
    const cardJoin = document.getElementById('mode-join-room');
    if (cardJoin) cardJoin.addEventListener('click', handleJoinRoom);
    const btnJoin = document.getElementById('btn-join-room');
    if (btnJoin) btnJoin.addEventListener('click', handleJoinRoom);

    // Mode 3: Solo / Couple on One Device
    const handleSoloMode = (e) => {
      if (e) e.stopPropagation();
      state.isSoloMode = true;
      state.partnerConfig = defaultPartnerConfig;
      updateReadyUI();
      showScreen('studio');
    };
    const cardSolo = document.getElementById('mode-solo');
    if (cardSolo) cardSolo.addEventListener('click', handleSoloMode);
    const btnSolo = document.getElementById('btn-solo');
    if (btnSolo) btnSolo.addEventListener('click', handleSoloMode);

    // Global Header Back Button
    const headerBackBtn = document.getElementById('header-back-btn');
    if (headerBackBtn) {
      headerBackBtn.addEventListener('click', () => {
        goBack();
      });
    }

    // Studio Top Back Button
    const studioTopBackBtn = document.getElementById('studio-top-back-btn');
    if (studioTopBackBtn) {
      studioTopBackBtn.addEventListener('click', () => {
        goBack();
      });
    }

    // Modal Share Back Button
    const modalShareBackBtn = document.getElementById('modal-share-back-btn');
    if (modalShareBackBtn) {
      modalShareBackBtn.addEventListener('click', () => {
        if (modalShare) modalShare.classList.remove('open');
        showScreen('home', true);
      });
    }

    // Modal Join handlers
    document.getElementById('btn-cancel-join').addEventListener('click', () => {
      modalJoin.classList.remove('open');
    });

    const joinInputEl = document.getElementById('join-room-input');
    if (joinInputEl) {
      joinInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          document.getElementById('btn-confirm-join').click();
        }
      });
    }

    document.getElementById('btn-confirm-join').addEventListener('click', () => {
      const code = document.getElementById('join-room-input').value.trim();
      if (!code) {
        showToast('⚠️ กรุณากรอกรหัสห้องก่อนนะจ๊ะ');
        const inp = document.getElementById('join-room-input');
        if (inp) {
          inp.classList.add('input-error');
          inp.focus();
        }
        return;
      }
      modalJoin.classList.remove('open');
      joinRoomWithCode(code);
    });

    // Modal Share handlers
    document.getElementById('modal-copy-link-btn').addEventListener('click', () => {
      copyShareLink();
    });

    document.getElementById('modal-start-decorating-btn').addEventListener('click', () => {
      modalShare.classList.remove('open');
      showScreen('studio');
    });

    if (copyRoomLinkBtn) {
      copyRoomLinkBtn.addEventListener('click', () => {
        copyShareLink();
      });
    }

    // Preview Switcher Tabs (Mine vs Partner)
    btnPreviewMine.addEventListener('click', () => {
      state.previewTarget = 'mine';
      updatePreviewTabsUI();
      updateLivePreview();
    });

    btnPreviewPartner.addEventListener('click', () => {
      state.previewTarget = 'partner';
      updatePreviewTabsUI();
      updateLivePreview();
      showToast('กำลังดูกระทงของแฟน 💕');
    });

    // Studio Navigation Tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        const targetId = tab.getAttribute('data-tab');
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.classList.add('active');

        // Always switch back to editing mine when touching options
        state.previewTarget = 'mine';
        updatePreviewTabsUI();
        updateLivePreview();
      });
    });

    // Incense Checkbox
    const incenseCheck = document.getElementById('checkbox-incense');
    if (incenseCheck) {
      incenseCheck.addEventListener('change', (e) => {
        state.builder.setOption('incense', e.target.checked);
        updateLivePreview();
      });
    }

    // Photo Upload Triggers
    photoUploadTrigger.addEventListener('click', () => photoFileInput.click());

    photoFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          state.builder.setPhoto(event.target.result);
          updateLivePreview();
          photoUploadTrigger.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 4px;">✅</div>
            <div style="font-weight: 600; color: var(--gold-glow);">อัพโหลดรูปสำเร็จแล้ว!</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">คลิกเพื่อเปลี่ยนรูปใหม่</div>
          `;
          window.audioEngine.playSparkle();
        };
        reader.readAsDataURL(file);
      }
    });

    // Frame Choices
    const frameChoices = document.querySelectorAll('.frame-choice');
    frameChoices.forEach(fc => {
      fc.addEventListener('click', () => {
        frameChoices.forEach(item => item.classList.remove('selected'));
        fc.classList.add('selected');
        state.builder.setPhotoFrame(fc.getAttribute('data-frame'));
        updateLivePreview();
        window.audioEngine.playSparkle();
      });
    });

    // Sliders for Photo Zoom & Rotate
    sliderPhotoScale.addEventListener('input', (e) => {
      valPhotoScale.textContent = `${parseFloat(e.target.value).toFixed(2)}x`;
      state.builder.setPhotoScale(e.target.value);
      updateLivePreview();
    });

    sliderPhotoRotate.addEventListener('input', (e) => {
      valPhotoRotate.textContent = `${e.target.value}°`;
      state.builder.setPhotoRotate(e.target.value);
      updateLivePreview();
    });

    btnRemovePhoto.addEventListener('click', () => {
      state.builder.setPhoto(null);
      photoFileInput.value = '';
      updateLivePreview();
      photoUploadTrigger.innerHTML = `
        <div class="upload-icon">📷</div>
        <div style="font-weight: 600; color: #fff;">คลิกเพื่อเลือกรูปถ่ายจากเครื่อง</div>
        <div style="font-size: 0.75rem; color: var(--lotus-soft); margin-top: 4px;">รองรับ JPG, PNG, GIF</div>
      `;
    });

    // Name & Wish Inputs
    if (inputMyName) {
      inputMyName.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
          inputMyName.classList.remove('input-error');
          const studioCard = document.getElementById('studio-names-card');
          if (studioCard && (!inputPartnerName || inputPartnerName.value.trim())) {
            studioCard.style.borderColor = '';
            studioCard.style.boxShadow = '';
          }
        }
        state.builder.setOption('myName', val);
        updateReadyUI();
        updateLivePreview();
        if (window.realtimeEngine && window.realtimeEngine.isConnected) {
          window.realtimeEngine.sendKrathongConfig(state.builder.exportConfig());
        }
      });
    }

    if (inputPartnerName) {
      inputPartnerName.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
          inputPartnerName.classList.remove('input-error');
          const studioCard = document.getElementById('studio-names-card');
          if (studioCard && (!inputMyName || inputMyName.value.trim())) {
            studioCard.style.borderColor = '';
            studioCard.style.boxShadow = '';
          }
        }
        state.builder.setOption('partnerName', val);
        updateReadyUI();
        updateLivePreview();
        if (window.realtimeEngine && window.realtimeEngine.isConnected) {
          window.realtimeEngine.sendKrathongConfig(state.builder.exportConfig());
        }
      });
    }

    if (inputWish) {
      inputWish.addEventListener('input', (e) => {
        state.builder.setOption('wish', e.target.value);
      });
    }

    // Quick Wish Tags
    document.querySelectorAll('.quick-wish-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const wishText = tag.getAttribute('data-wish');
        if (inputWish) inputWish.value = wishText;
        state.builder.setOption('wish', wishText);
        window.audioEngine.playSparkle();
        showToast('เลือกคำอธิษฐานแล้ว ✨');
      });
    });

    // Back from Studio to Home
    document.getElementById('btn-back-home').addEventListener('click', () => {
      stopCountdown();
      showScreen('home');
    });

    // --- READY BUTTON CLICKED (ปุ่ม Ready เมื่อคนใดเสร็จก่อน) ---
    btnReadyToFloat.addEventListener('click', () => {
      // If toggling Ready ON, enforce that both names are filled in
      if (!state.myReady) {
        let myName = (state.builder.config.myName || (inputMyName ? inputMyName.value : '')).trim();
        let partnerName = (state.builder.config.partnerName || (inputPartnerName ? inputPartnerName.value : '')).trim();

        // For guest joining via room code: auto-fallback from partner config so they are never blocked
        if (state.isGuest) {
          if (!myName) {
            myName = (state.partnerConfig && state.partnerConfig.partnerName) ? state.partnerConfig.partnerName : 'เรา';
            state.builder.setOption('myName', myName);
            if (inputMyName) inputMyName.value = myName;
          }
          if (!partnerName) {
            partnerName = (state.partnerConfig && state.partnerConfig.myName) ? state.partnerConfig.myName : 'แฟน';
            state.builder.setOption('partnerName', partnerName);
            if (inputPartnerName) inputPartnerName.value = partnerName;
          }
        } else {
          if (!myName || !partnerName) {
            showToast('⚠️ กรุณาใส่ชื่อเราและชื่อแฟนในกล่องด้านบนก่อนกด Ready นะครับ 💑');
            const studioCard = document.getElementById('studio-names-card');
            if (studioCard) {
              studioCard.style.borderColor = 'rgba(255, 51, 102, 0.85)';
              studioCard.style.boxShadow = '0 0 18px rgba(255, 51, 102, 0.45)';
            }
            if (!myName && inputMyName) {
              inputMyName.classList.add('input-error');
              inputMyName.focus();
              inputMyName.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (!partnerName && inputPartnerName) {
              inputPartnerName.classList.add('input-error');
              inputPartnerName.focus();
              inputPartnerName.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
          }
        }
      }

      // Toggle ready status
      state.myReady = !state.myReady;
      updateReadyUI();

      // Send to partner
      if (window.realtimeEngine.isConnected) {
        window.realtimeEngine.sendReadyChange(state.myReady, state.builder.exportConfig());
      }

      if (state.myReady) {
        window.audioEngine.playSparkle();

        // Check if partner is also ready
        if (state.partnerReady || state.isSoloMode) {
          if (!state.isCountingDown && state.screen !== 'river') {
            showToast('🎉 พร้อมทั้งสองคนแล้ว! เริ่มนับถอยหลังลอยกระทง 10 วินาที');
            if (window.realtimeEngine.isConnected) {
              window.realtimeEngine.sendCountdownStart(Date.now());
            }
            startCountdown();
          }
        } else {
          showToast('✨ คุณกด Ready แล้ว! กำลังรอแฟนแต่งกระทงเสร็จนะครับ');
        }
      } else {
        stopCountdown();
        showToast('✏️ ยกเลิกสถานะ Ready แล้ว สามารถแต่งกระทงต่อได้');
      }
    });

    // Cancel Countdown Button
    btnCancelCountdown.addEventListener('click', () => {
      stopCountdown();
      state.myReady = false;
      updateReadyUI();
      if (window.realtimeEngine.isConnected) {
        window.realtimeEngine.sendReadyChange(false, state.builder.exportConfig());
      }
      showToast('ยกเลิกนับถอยหลัง กลับมาแก้ไขกระทงต่อ');
    });

    // Music Player Controls (Single Loy Krathong song)
    if (musicToggleBtn) {
      musicToggleBtn.addEventListener('click', (e) => {
        if (e.target.closest('#music-next-btn')) return;
        toggleMusicPlayback();
      });
    }

    if (musicNextBtn) {
      musicNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const track = window.audioEngine.nextTrack();
        if (musicTrackTitle) musicTrackTitle.textContent = track.title;
        if (!window.audioEngine.isPlaying) {
          window.audioEngine.play();
        }
        updateMusicUI(true);
      });
    }

    // River Top Controls
    const btnRiverBackStudio = document.getElementById('btn-river-back-studio');
    if (btnRiverBackStudio) {
      btnRiverBackStudio.addEventListener('click', () => {
        state.myReady = false;
        state.partnerReady = false;
        updateReadyUI();
        showScreen('studio', true);
      });
    }

    const btnRiverBackHome = document.getElementById('btn-river-back-home');
    if (btnRiverBackHome) {
      btnRiverBackHome.addEventListener('click', () => {
        if (confirm('ต้องการย้อนกลับสู่หน้าแรกหรือไม่?')) {
          state.myReady = false;
          state.partnerReady = false;
          showScreen('home', true);
        }
      });
    }

    document.getElementById('btn-take-photo').addEventListener('click', () => {
      captureKeepsakePhoto();
    });

    document.getElementById('btn-close-keepsake').addEventListener('click', () => {
      modalKeepsake.classList.remove('open');
    });

    // River Bottom Reactions
    document.getElementById('btn-react-heart').addEventListener('click', () => {
      triggerHeartReaction('me');
      if (window.realtimeEngine.isConnected) {
        window.realtimeEngine.sendReaction('heart');
      }
    });

    document.getElementById('btn-react-firework').addEventListener('click', () => {
      triggerFireworkReaction();
      if (window.realtimeEngine.isConnected) {
        window.realtimeEngine.sendReaction('firework');
      }
    });

    document.getElementById('btn-react-lantern').addEventListener('click', () => {
      triggerLanternReaction();
      if (window.realtimeEngine.isConnected) {
        window.realtimeEngine.sendReaction('lantern');
      }
    });

    document.getElementById('btn-react-petal').addEventListener('click', () => {
      triggerPetalReaction();
      if (window.realtimeEngine.isConnected) {
        window.realtimeEngine.sendReaction('petal');
      }
    });

    document.getElementById('btn-react-whisper').addEventListener('click', () => {
      modalWhisper.classList.add('open');
    });

    document.getElementById('btn-close-whisper').addEventListener('click', () => {
      modalWhisper.classList.remove('open');
    });

    // Whisper preset buttons
    document.querySelectorAll('.whisper-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const msg = btn.getAttribute('data-msg');
        sendLoveWhisper(msg);
        modalWhisper.classList.remove('open');
      });
    });

    // Custom whisper send
    document.getElementById('btn-send-custom-whisper').addEventListener('click', () => {
      const input = document.getElementById('custom-whisper-input');
      const msg = input.value.trim();
      if (msg) {
        sendLoveWhisper(msg);
        input.value = '';
        modalWhisper.classList.remove('open');
      }
    });
  }

  function switchStudioTab(tabId) {
    const targetTabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (targetTabBtn) targetTabBtn.click();
  }

  // --- JOIN ROOM HELPER ---
  function joinRoomWithCode(code) {
    state.roomId = code;
    state.isSoloMode = false;
    state.isGuest = true;
    window.realtimeEngine.joinRoom(code);

    if (headerRoomBadge) headerRoomBadge.style.display = 'none';
    if (headerRoomText) headerRoomText.textContent = `ห้อง: ${code}`;

    updateReadyUI();
    showToast(`เข้าร่วมห้อง ${code} สำเร็จ! ✨`);
    showScreen('studio');
  }

  // --- REALTIME SYNC HANDLERS ---
  function setupRealtimeHandlers() {
    const rt = window.realtimeEngine;

    rt.onPartnerConnected = () => {
      state.partnerConnected = true;
      updateReadyUI();

      showToast('แฟนของคุณเชื่อมต่อเข้ามาในห้องแล้ว! 💕');
      window.audioEngine.playSparkle();

      // Send my design & my ready status so partner sees it
      rt.sendKrathongConfig(state.builder.exportConfig());
      if (state.myReady && !state.isCountingDown && state.screen !== 'river') {
        rt.sendReadyChange(true, state.builder.exportConfig());
      }
    };

    rt.onPartnerKrathong = (config) => {
      state.partnerConfig = config;

      // If guest joined without entering names, inherit the names the host set for them!
      if (state.isGuest && config) {
        if (!state.builder.config.myName && config.partnerName) {
          state.builder.setOption('myName', config.partnerName);
          if (inputMyName) inputMyName.value = config.partnerName;
        }
        if (!state.builder.config.partnerName && config.myName) {
          state.builder.setOption('partnerName', config.myName);
          if (inputPartnerName) inputPartnerName.value = config.myName;
        }
      }

      // If currently previewing partner's Krathong, live update it!
      if (state.previewTarget === 'partner') {
        updateLivePreview();
      }
      if (state.riverSim && state.screen === 'river') {
        const pCfg = Object.assign({}, config);
        pCfg.myName = getPartnerName();
        pCfg.partnerName = getMyName();
        state.riverSim.updatePartnerKrathong(pCfg);
      }
    };

    // When partner presses Ready or cancels Ready
    rt.onPartnerReadyChange = (isReady, config) => {
      state.partnerReady = isReady;
      if (config) state.partnerConfig = config;
      updateReadyUI();

      const partnerName = getPartnerName();

      if (isReady) {
        showToast(`💖 ${partnerName} กด Ready แล้ว! พร้อมลอยกระทง`);
        window.audioEngine.playSparkle();

        // If I am also ready, trigger 10-second countdown!
        if (state.myReady && !state.isCountingDown && state.screen !== 'river') {
          startCountdown();
        }
      } else {
        stopCountdown();
        showToast(`✏️ ${partnerName} ขอกลับไปแก้ไขกระทงต่อสักครู่...`);
      }
    };

    // When countdown starts from either peer
    rt.onCountdownStart = () => {
      if (!state.isCountingDown && state.screen !== 'river') {
        startCountdown();
      }
    };

    rt.onFloatTogether = (data) => {
      if (data && data.config) {
        state.partnerConfig = data.config;
      }
      stopCountdown();
      showToast('แฟนปล่อยกระทงลงแม่น้ำแล้ว! ไปลอยคู่กันเลย 🌕');
      window.audioEngine.playWaterSplash();
      showScreen('river');
    };

    rt.onPartnerReaction = (type) => {
      if (type === 'heart') triggerHeartReaction('partner');
      if (type === 'firework') triggerFireworkReaction();
      if (type === 'lantern') triggerLanternReaction();
      if (type === 'petal') triggerPetalReaction();
    };

    rt.onPartnerChat = (message, senderName) => {
      if (state.riverSim) {
        state.riverSim.showLoveChat('partner', message);
      }
      showToast(`${senderName || 'แฟน'}: ${message}`);
      window.audioEngine.playSparkle();
    };

    rt.onStatusChange = (status) => {
      if (status === 'partner_disconnected') {
        state.partnerConnected = false;
        state.partnerReady = false;
        updateReadyUI();
        showToast('แฟนขาดการเชื่อมต่อชั่วคราว');
      }
    };
  }

  // --- RIVER SCENE INITIALIZATION ---
  function startRiverView() {
    const canvas = document.getElementById('river-canvas');
    if (!state.riverSim) {
      state.riverSim = new RiverSimulation('river-canvas');
    }

    // Couple names and wishes on top bar
    const myName = getMyName();
    const partnerName = getPartnerName();
    document.getElementById('river-couple-names').textContent = `${myName} 💕 ${partnerName}`;
    document.getElementById('river-couple-wish').textContent = `"${state.builder.config.wish}"`;

    // Setup couple Krathongs on the water
    const myCfg = state.builder.exportConfig();
    myCfg.myName = myName;
    myCfg.partnerName = partnerName;

    const partnerCfg = Object.assign({}, defaultPartnerConfig, state.partnerConfig || {});
    partnerCfg.myName = partnerName;
    partnerCfg.partnerName = myName;

    state.riverSim.setupKrathongs(myCfg, partnerCfg);
    state.riverSim.start();

    // Launch welcome fireworks and play river song
    setTimeout(() => {
      window.audioEngine.playFirework();
      state.riverSim.triggerFirework();
    }, 800);

    // Automatically play Loy Krathong song from the start when floating begins
    window.audioEngine.restartAndPlay();
    updateMusicUI(true);
  }

  // --- REACTION ACTIONS ---
  function triggerHeartReaction(sender = 'me') {
    if (state.riverSim) {
      state.riverSim.addHeartReaction(sender);
    }
    window.audioEngine.playSparkle();
  }

  function triggerFireworkReaction() {
    if (state.riverSim) {
      state.riverSim.triggerFirework();
    }
    window.audioEngine.playFirework();
  }

  function triggerLanternReaction() {
    if (state.riverSim) {
      const n1 = state.builder.config.myName || 'เรา';
      const n2 = state.builder.config.partnerName || 'แฟน';
      state.riverSim.releaseCustomLantern(n1, n2);
    }
    window.audioEngine.playSparkle();
    showToast('ปล่อยโคมลอยอธิษฐานขึ้นสู่ดวงจันทร์แล้ว 🏮✨');
  }

  function triggerPetalReaction() {
    if (state.riverSim) {
      for (let i = 0; i < 15; i++) {
        state.riverSim.waterPetals.push({
          x: Math.random() * state.riverSim.width,
          y: state.riverSim.height * 0.45 + Math.random() * (state.riverSim.height * 0.45),
          size: 5 + Math.random() * 5,
          speedX: 0.3 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          color: Math.random() > 0.5 ? '#ff4081' : '#ffd54f'
        });
      }
    }
    window.audioEngine.playSparkle();
    showToast('โปรยกลีบดอกไม้ลงสู่สายน้ำ 🌸');
  }

  function sendLoveWhisper(message) {
    if (state.riverSim) {
      state.riverSim.showLoveChat('me', message);
    }
    showToast(`กระซิบรัก: ${message}`);
    window.audioEngine.playSparkle();

    if (window.realtimeEngine.isConnected) {
      window.realtimeEngine.sendChat(message, state.builder.config.myName);
    }
  }

  // --- SOUVENIR KEEPSAKE CAPTURE ---
  function captureKeepsakePhoto() {
    if (!state.riverSim) return;

    const srcCanvas = document.getElementById('river-canvas');
    const offCanvas = document.createElement('canvas');
    offCanvas.width = srcCanvas.width;
    offCanvas.height = srcCanvas.height;
    const ctx = offCanvas.getContext('2d');

    // Draw main canvas
    ctx.drawImage(srcCanvas, 0, 0);

    const w = offCanvas.width;
    const h = offCanvas.height;

    // Gold outer border
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    ctx.strokeStyle = '#ff80ab';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    // Banner ribbon at bottom
    ctx.fillStyle = 'rgba(7, 13, 30, 0.88)';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    const bannerW = Math.min(w * 0.8, 520);
    const bannerH = 68;
    const bx = (w - bannerW) / 2;
    const by = h - bannerH - 30;

    ctx.beginPath();
    ctx.roundRect(bx, by, bannerW, bannerH, 16);
    ctx.fill();
    ctx.stroke();

    // Banner Text
    const myName = getMyName();
    const partnerName = getPartnerName();
    ctx.fillStyle = '#ffe57f';
    ctx.font = 'bold 26px "TH Sarabun PSK", "TH Sarabun New", "Sarabun", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🌕 วันลอยกระทง 2569 | ${myName} 💕 ${partnerName}`, w / 2, by + 28);

    ctx.fillStyle = '#ffffff';
    ctx.font = '19px "TH Sarabun PSK", "TH Sarabun New", "Sarabun", sans-serif';
    ctx.fillText(`" ${state.builder.config.wish.substring(0, 48)}... "`, w / 2, by + 52);

    // Export image to modal
    const dataUrl = offCanvas.toDataURL('image/png');
    document.getElementById('keepsake-image-preview').src = dataUrl;
    document.getElementById('btn-download-keepsake').href = dataUrl;
    modalKeepsake.classList.add('open');
    window.audioEngine.playSparkle();
  }

  // --- AUDIO UI TOGGLE ---
  function toggleMusicPlayback() {
    const isNowPlaying = window.audioEngine.togglePlay();
    updateMusicUI(isNowPlaying);
  }

  function updateMusicUI(isPlaying) {
    if (isPlaying) {
      if (musicDiskIcon) musicDiskIcon.classList.add('playing');
      if (musicStatusText) {
        musicStatusText.textContent = 'กำลังเล่น ⏸ คลิกหยุด';
        musicStatusText.style.color = '#00e676';
      }
    } else {
      if (musicDiskIcon) musicDiskIcon.classList.remove('playing');
      if (musicStatusText) {
        musicStatusText.textContent = 'หยุดอยู่ ▶ คลิกเล่น';
        musicStatusText.style.color = 'var(--gold-glow)';
      }
    }
  }

  // Hook global sync from audio engine
  window.onAudioStateChange = updateMusicUI;

  // --- UTILITY: SILENT COPY ROOM CODE (NO POPUP) & TOAST ---
  function copyShareLink() {
    copyRoomCode();
  }

  function copyRoomCode() {
    if (!state.roomId) return;
    const roomCode = state.roomId;

    // 1. Silent clipboard copy (Never shows prompt() or alert())
    let copied = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(roomCode).then(() => {
        // Success via modern API
      }).catch(() => {
        fallbackCopyText(roomCode);
      });
      copied = true;
    }
    if (!copied) {
      fallbackCopyText(roomCode);
    }

    // 2. Inline Visual Feedback on Modal Button
    const btn = document.getElementById('modal-copy-link-btn');
    if (btn) {
      const originalHtml = '📋 คัดลอกรหัสห้อง';
      btn.innerHTML = `✅ คัดลอกรหัส ${roomCode} แล้ว!`;
      btn.style.background = 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)';
      btn.style.color = '#0b1329';
      btn.style.fontWeight = '700';

      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.style.background = '';
        btn.style.color = '';
        btn.style.fontWeight = '';
      }, 2500);
    }

    // 3. Audio & Toast Feedback
    showToast(`คัดลอกรหัสห้อง ${roomCode} เรียบร้อยแล้ว! 📋`);
    if (window.audioEngine) {
      window.audioEngine.playSparkle();
    }
  }

  // Hidden textarea fallback for silent copying across file:// and older browsers
  function fallbackCopyText(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, 99999);
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (err) {
      console.warn('Fallback copy failed silently:', err);
    }
  }

  function showToast(msg) {
    const container = document.getElementById('chat-toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'chat-bubble';
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 3500);
  }

  function checkUrlQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      // Guest entering via shared link does not need to enter names on home, jump straight into studio!
      joinRoomWithCode(roomParam);
    }
  }

  // Initialize!
  init();
});
