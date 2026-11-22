/**
 * 🌊 River Canvas Simulation
 * High-performance 2D Canvas river engine featuring full moon, shimmering reflections,
 * animated water waves, floating sky lanterns, dynamic fireworks,
 * and synchronized couple Krathongs with romance physics.
 */

class RiverSimulation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.animationId = null;
    this.time = 0;

    // Objects in scene
    this.stars = [];
    this.lanterns = [];
    this.fireworks = [];
    this.particles = [];
    this.waterPetals = [];
    this.krathongs = []; // [myKrathong, partnerKrathong]

    // Cached SVG image elements for Krathongs
    this.krathongImgs = {
      me: new Image(),
      partner: new Image()
    };

    this.onResize = this.resize.bind(this);
    window.addEventListener('resize', this.onResize);
    this.resize();
    this.initBackgroundElements();
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.width = (parent ? parent.clientWidth : window.innerWidth) || window.innerWidth;
    this.height = (parent ? parent.clientHeight : window.innerHeight) || window.innerHeight;

    // High-DPI / Retina Crisp Rendering on iPad, iPhone, and Android
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';

    if (this.ctx.resetTransform) {
      this.ctx.resetTransform();
    } else {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.ctx.scale(dpr, dpr);

    // Responsive Krathong sizing & dynamic positioning on screen resize
    if (this.krathongs && this.krathongs.length > 0) {
      const isMobile = this.width < 600;
      const kSize = isMobile ? Math.min(145, this.width * 0.36) : 190;
      const startY = this.height * 0.65;

      this.krathongs.forEach((k, idx) => {
        k.size = kSize;
        k.baseY = startY + (idx === 1 ? -6 : 0);
        if (k.y > this.height) k.y = k.baseY;
        if (idx === 0) {
          k.x = Math.max(kSize * 0.55, Math.min(k.x, this.width * 0.45));
        } else if (idx === 1) {
          k.x = Math.max(this.width * 0.55, Math.min(k.x, this.width - kSize * 0.55));
        }
      });
    }

    this.initStars();
  }

  initBackgroundElements() {
    this.initStars();
    // Pre-populate some distant sky lanterns
    this.lanterns = [];
    for (let i = 0; i < 15; i++) {
      this.lanterns.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.5),
        size: 8 + Math.random() * 14,
        speedY: 0.3 + Math.random() * 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        swaySpeed: 0.02 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.4 + Math.random() * 0.5
      });
    }

    // Pre-populate some floating water petals
    this.waterPetals = [];
    for (let i = 0; i < 25; i++) {
      this.waterPetals.push({
        x: Math.random() * this.width,
        y: this.height * 0.45 + Math.random() * (this.height * 0.5),
        size: 4 + Math.random() * 5,
        speedX: 0.2 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? '#ff80ab' : '#ffd54f'
      });
    }
  }

  initStars() {
    this.stars = [];
    const count = Math.floor((this.width * this.height) / 8000);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.45),
        size: Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.7,
        blinkSpeed: 0.02 + Math.random() * 0.04
      });
    }
  }

  // --- KRATHONG DATA SETUP ---
  setupKrathongs(myConfig, partnerConfig) {
    this.krathongs = [];

    const isMobile = this.width < 600;
    const kSize = isMobile ? Math.min(145, this.width * 0.36) : 190;

    // User Krathong
    const mySvg = (new KrathongBuilder());
    mySvg.importConfig(myConfig);
    const mySvgString = mySvg.generateSVG(260, 260, true);
    const myUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(mySvgString);
    this.krathongImgs.me.src = myUrl;

    const startX = this.width * (isMobile ? 0.32 : 0.4);
    const startY = this.height * 0.65;

    this.krathongs.push({
      id: 'me',
      name: myConfig.myName || 'เรา',
      wish: myConfig.wish,
      img: this.krathongImgs.me,
      x: startX,
      y: startY,
      targetX: startX,
      targetY: startY,
      vx: 0,
      vy: 0,
      baseY: startY,
      size: kSize,
      bobOffset: 0,
      tiltOffset: 0,
      loveChat: null
    });

    // Partner Krathong
    if (partnerConfig) {
      const partnerSvg = (new KrathongBuilder());
      partnerSvg.importConfig(partnerConfig);
      const partnerSvgString = partnerSvg.generateSVG(260, 260, true);
      const partnerUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(partnerSvgString);
      this.krathongImgs.partner.src = partnerUrl;

      const pX = this.width * (isMobile ? 0.68 : 0.6);
      const pY = this.height * 0.64;

      this.krathongs.push({
        id: 'partner',
        name: partnerConfig.myName || 'แฟน',
        wish: partnerConfig.wish,
        img: this.krathongImgs.partner,
        x: pX,
        y: pY,
        targetX: pX,
        targetY: pY,
        vx: 0,
        vy: 0,
        baseY: pY,
        size: kSize,
        bobOffset: Math.PI * 0.8,
        tiltOffset: 1.2,
        loveChat: null
      });
    }
  }

  updatePartnerKrathong(partnerConfig) {
    if (!partnerConfig) return;
    const partnerSvg = (new KrathongBuilder());
    partnerSvg.importConfig(partnerConfig);
    const partnerSvgString = partnerSvg.generateSVG(260, 260, true);
    this.krathongImgs.partner.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(partnerSvgString);

    let found = this.krathongs.find(k => k.id === 'partner');
    if (!found) {
      const pX = this.width * 0.6;
      const pY = this.height * 0.64;
      this.krathongs.push({
        id: 'partner',
        name: partnerConfig.myName || 'แฟน',
        wish: partnerConfig.wish,
        img: this.krathongImgs.partner,
        x: pX,
        y: pY,
        targetX: pX,
        targetY: pY,
        vx: 0,
        vy: 0,
        baseY: pY,
        size: 190,
        bobOffset: Math.PI * 0.8,
        tiltOffset: 1.2,
        loveChat: null
      });
    } else {
      found.name = partnerConfig.myName || 'แฟน';
      found.wish = partnerConfig.wish;
    }
  }

  // --- START & STOP ANIMATION LOOP ---
  start() {
    if (this.animationId) return;
    const loop = () => {
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // --- UPDATE LOGIC ---
  update() {
    this.time += 0.03;

    // Update Sky Lanterns
    this.lanterns.forEach(lan => {
      lan.y -= lan.speedY;
      lan.x += Math.sin(this.time * lan.swaySpeed + lan.phase) * 0.4 + lan.speedX;
      if (lan.y < -30) {
        lan.y = this.height * 0.5 + Math.random() * 50;
        lan.x = Math.random() * this.width;
      }
    });

    // Update Water Petals
    this.waterPetals.forEach(petal => {
      petal.x += petal.speedX;
      petal.y += Math.sin(this.time + petal.phase) * 0.2;
      if (petal.x > this.width + 20) {
        petal.x = -20;
        petal.y = this.height * 0.45 + Math.random() * (this.height * 0.5);
      }
    });

    // Update Fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];
      fw.update();
      if (fw.isDead()) {
        this.fireworks.splice(i, 1);
      }
    }

    // Update Particles (Hearts, Chimes, Magic sparks)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Krathong positions & romance attraction physics
    if (this.krathongs.length >= 2) {
      const k1 = this.krathongs[0];
      const k2 = this.krathongs[1];

      // Romantic attraction: softly bring the 2 Krathongs closer if separated
      const dx = k2.x - k1.x;
      const targetDist = 140; // ideal romantic distance
      const curDist = Math.abs(dx);

      if (curDist > targetDist) {
        const pull = (curDist - targetDist) * 0.002;
        if (dx > 0) {
          k1.x += pull;
          k2.x -= pull;
        } else {
          k1.x -= pull;
          k2.x += pull;
        }
      }

      // When couple Krathongs are close, occasionally spawn a cute heart between them!
      if (Math.abs(dx) < 160 && Math.random() < 0.04) {
        const midX = (k1.x + k2.x) / 2;
        const midY = (k1.y + k2.y) / 2 - 20;
        this.addHeartParticle(midX + (Math.random() - 0.5) * 20, midY, 0.9);
      }
    }

    // Drift Krathongs slightly with current
    this.krathongs.forEach(k => {
      k.x += Math.sin(this.time * 0.5 + k.bobOffset) * 0.35 + 0.15;
      k.y = k.baseY + Math.sin(this.time * 1.5 + k.bobOffset) * 6;

      // Wrap around if drifts too far right
      if (k.x > this.width + 120) {
        k.x = -100;
      }
    });
  }

  // --- DRAW LOOP ---
  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawSky();
    this.drawStars();
    this.drawMoon();
    this.drawDistantHorizon();
    this.drawSkyLanterns();
    this.drawFireworks();
    this.drawRiver();
    this.drawWaterPetals();
    this.drawKrathongs();
    this.drawParticles();
  }

  // --- SKY & HORIZON ---
  drawSky() {
    const horizon = this.height * 0.44;
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, horizon);
    skyGrad.addColorStop(0, '#050a18');
    skyGrad.addColorStop(0.4, '#0a1636');
    skyGrad.addColorStop(0.8, '#13285c');
    skyGrad.addColorStop(1, '#1b3472');

    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.width, horizon);
  }

  drawStars() {
    this.stars.forEach(s => {
      const blink = Math.sin(this.time * 2 + s.x) * 0.3;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, s.alpha + blink)})`;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawMoon() {
    const mx = this.width * 0.5;
    const my = this.height * 0.16;
    const mr = Math.min(this.width * 0.12, 65);

    // Moonlight Halo
    const haloGrad = this.ctx.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 3.5);
    haloGrad.addColorStop(0, 'rgba(255, 248, 200, 0.45)');
    haloGrad.addColorStop(0.5, 'rgba(255, 235, 130, 0.15)');
    haloGrad.addColorStop(1, 'rgba(255, 235, 130, 0)');

    this.ctx.fillStyle = haloGrad;
    this.ctx.beginPath();
    this.ctx.arc(mx, my, mr * 3.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Glowing Full Moon Body
    const moonGrad = this.ctx.createRadialGradient(mx - mr * 0.2, my - mr * 0.2, mr * 0.1, mx, my, mr);
    moonGrad.addColorStop(0, '#ffffff');
    moonGrad.addColorStop(0.4, '#fff9c4');
    moonGrad.addColorStop(0.8, '#ffe082');
    moonGrad.addColorStop(1, '#fbc02d');

    this.ctx.fillStyle = moonGrad;
    this.ctx.beginPath();
    this.ctx.arc(mx, my, mr, 0, Math.PI * 2);
    this.ctx.fill();

    // Subtle moon craters
    this.ctx.fillStyle = 'rgba(230, 180, 50, 0.15)';
    this.ctx.beginPath();
    this.ctx.arc(mx - mr * 0.3, my - mr * 0.2, mr * 0.22, 0, Math.PI * 2);
    this.ctx.arc(mx + mr * 0.25, my + mr * 0.1, mr * 0.3, 0, Math.PI * 2);
    this.ctx.arc(mx - mr * 0.1, my + mr * 0.35, mr * 0.18, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawDistantHorizon() {
    const horizon = this.height * 0.44;
    const scale = Math.max(0.75, Math.min(this.width / 950, 1.25));

    // 1. Natural Curved Shoreline Silhouette & Coconut Palms (No ugly blocks!)
    this.drawHorizonShoreline(horizon, scale);

    // 2. Majestic Thai Temple Fair Landmarks (Pagodas, Ubosot, Sala, Prang, Ferris Wheel)
    this.drawHorizonPagoda(this.width * 0.18, horizon, scale);
    this.drawHorizonTemple(this.width * 0.35, horizon, scale);
    this.drawHorizonSala(this.width * 0.56, horizon, scale);
    this.drawHorizonPrang(this.width * 0.72, horizon, scale);
    this.drawHorizonFerrisWheel(this.width * 0.88, horizon, scale);

    // 3. Festive Carnival String Lights (ไฟงานวัด / ไฟปิงปองหลากสี & สีเหลืองนวลระย้า)
    this.drawFestivalStringLights(horizon, scale);

    // 4. Shoreline Boardwalk Lanterns (โคมไฟเสาริมตลิ่ง)
    this.drawShorelineLanterns(horizon, scale);
  }

  // --- HORIZON FESTIVAL DETAILS ---

  drawHorizonShoreline(horizon, scale) {
    this.ctx.save();
    
    // Distant city/temple warm night sky ambient glow
    const ambientGlow = this.ctx.createLinearGradient(0, horizon - 50 * scale, 0, horizon);
    ambientGlow.addColorStop(0, 'rgba(255, 180, 50, 0)');
    ambientGlow.addColorStop(0.6, 'rgba(255, 160, 40, 0.08)');
    ambientGlow.addColorStop(1, 'rgba(255, 140, 30, 0.22)');
    this.ctx.fillStyle = ambientGlow;
    this.ctx.fillRect(0, horizon - 50 * scale, this.width, 50 * scale);

    // Continuous riverbank shoreline silhouette
    this.ctx.fillStyle = 'rgba(5, 12, 28, 0.98)';
    this.ctx.beginPath();
    this.ctx.moveTo(0, horizon);

    // Natural undulating riverbank with soft curves
    const step = 20;
    for (let x = 0; x <= this.width + step; x += step) {
      const h = 7 * scale + Math.sin(x * 0.015) * (4 * scale) + Math.cos(x * 0.035) * (3 * scale);
      this.ctx.lineTo(x, horizon - h);
    }
    this.ctx.lineTo(this.width, horizon);
    this.ctx.closePath();
    this.ctx.fill();

    // Natural coconut trees / palm silhouettes at various spots
    const palmPositions = [0.06, 0.12, 0.26, 0.44, 0.64, 0.80, 0.96];
    palmPositions.forEach((pos, idx) => {
      const px = this.width * pos;
      const ph = (22 + (idx % 3) * 8) * scale;
      const lean = ((idx % 2 === 0 ? 1 : -1) * (6 + (idx % 3) * 3)) * scale;
      this.drawPalmSilhouette(px, horizon, ph, lean, scale);
    });

    this.ctx.restore();
  }

  drawPalmSilhouette(x, horizon, h, lean, scale) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(5, 12, 28, 0.98)';
    this.ctx.strokeStyle = 'rgba(5, 12, 28, 0.98)';
    this.ctx.lineWidth = 2.5 * scale;
    this.ctx.beginPath();
    this.ctx.moveTo(x, horizon);
    this.ctx.quadraticCurveTo(x + lean * 0.4, horizon - h * 0.5, x + lean, horizon - h);
    this.ctx.stroke();

    // Palm leaves / fronds radiating from crown
    const cx = x + lean;
    const cy = horizon - h;
    const fronds = 6;
    for (let i = 0; i < fronds; i++) {
      const angle = (i / (fronds - 1)) * Math.PI + (lean > 0 ? -0.2 : 0.2);
      const frondLen = (12 + (i % 2) * 5) * scale;
      const fx = cx + Math.cos(angle) * frondLen;
      const fy = cy - Math.sin(angle) * (frondLen * 0.6) + 3 * scale;
      this.ctx.lineWidth = 1.6 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.quadraticCurveTo(cx + Math.cos(angle) * (frondLen * 0.6), cy - Math.sin(angle) * frondLen * 0.8, fx, fy);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawHorizonPagoda(x, horizon, scale) {
    const pH = 78 * scale;
    const bW = 46 * scale;
    const peakY = horizon - pH;

    this.ctx.save();

    // Upward Golden Architectural Spotlight / Halo
    const breathe = Math.sin(this.time * 2) * 0.08 + 0.92;
    const spotGlow = this.ctx.createRadialGradient(x, horizon - pH * 0.45, 4, x, horizon - pH * 0.45, pH * 0.95);
    spotGlow.addColorStop(0, `rgba(255, 220, 80, ${0.42 * breathe})`);
    spotGlow.addColorStop(0.45, `rgba(255, 180, 40, ${0.18 * breathe})`);
    spotGlow.addColorStop(1, 'rgba(255, 160, 20, 0)');
    this.ctx.fillStyle = spotGlow;
    this.ctx.beginPath();
    this.ctx.arc(x, horizon - pH * 0.45, pH * 0.95, 0, Math.PI * 2);
    this.ctx.fill();

    // Upward Conical Light Beam
    const beam = this.ctx.createLinearGradient(x, horizon, x, peakY);
    beam.addColorStop(0, 'rgba(255, 235, 130, 0.35)');
    beam.addColorStop(0.5, 'rgba(255, 200, 60, 0.18)');
    beam.addColorStop(1, 'rgba(255, 180, 30, 0)');
    this.ctx.fillStyle = beam;
    this.ctx.beginPath();
    this.ctx.moveTo(x - bW * 0.65, horizon);
    this.ctx.lineTo(x, peakY - 8 * scale);
    this.ctx.lineTo(x + bW * 0.65, horizon);
    this.ctx.closePath();
    this.ctx.fill();

    // Stupa Silhouette Body with Golden Rim & Glow
    const bodyGrad = this.ctx.createLinearGradient(x, horizon, x, peakY);
    bodyGrad.addColorStop(0, '#0c1a38');
    bodyGrad.addColorStop(0.5, '#222f52');
    bodyGrad.addColorStop(0.85, '#e6a100');
    bodyGrad.addColorStop(1, '#ffeb3b');

    this.ctx.fillStyle = bodyGrad;
    this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.65)';
    this.ctx.lineWidth = 1.2 * scale;

    this.ctx.beginPath();
    // Tiered square base
    this.ctx.moveTo(x - bW * 0.5, horizon);
    this.ctx.lineTo(x - bW * 0.45, horizon - 8 * scale);
    this.ctx.lineTo(x - bW * 0.38, horizon - 15 * scale);
    // Bell shaped body (องค์ระฆัง)
    this.ctx.quadraticCurveTo(x - bW * 0.32, horizon - 35 * scale, x - bW * 0.14, horizon - 44 * scale);
    // Throne & ringed spire (บัลลังก์ และปล้องไฉน)
    this.ctx.lineTo(x - bW * 0.1, horizon - 49 * scale);
    this.ctx.lineTo(x - 2 * scale, peakY + 4 * scale);
    // Spire peak (ยอดฉัตร)
    this.ctx.lineTo(x, peakY);
    this.ctx.lineTo(x + 2 * scale, peakY + 4 * scale);
    this.ctx.lineTo(x + bW * 0.1, horizon - 49 * scale);
    this.ctx.lineTo(x + bW * 0.14, horizon - 44 * scale);
    this.ctx.quadraticCurveTo(x + bW * 0.32, horizon - 35 * scale, x + bW * 0.38, horizon - 15 * scale);
    this.ctx.lineTo(x + bW * 0.45, horizon - 8 * scale);
    this.ctx.lineTo(x + bW * 0.5, horizon);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Golden Beacon Star at Spire Peak
    this.drawSparkleStar(x, peakY, 5 * scale, '#ffffff', '#ffd700');

    this.ctx.restore();
  }

  drawHorizonPrang(x, horizon, scale) {
    const prH = 92 * scale;
    const prW = 44 * scale;
    const peakY = horizon - prH;

    this.ctx.save();

    // Golden Architectural Floodlight Halo
    const breathe = Math.sin(this.time * 2.2 + 1) * 0.08 + 0.92;
    const prangGlow = this.ctx.createRadialGradient(x, horizon - prH * 0.48, 6, x, horizon - prH * 0.48, prH * 0.9);
    prangGlow.addColorStop(0, `rgba(255, 230, 90, ${0.45 * breathe})`);
    prangGlow.addColorStop(0.4, `rgba(255, 175, 40, ${0.18 * breathe})`);
    prangGlow.addColorStop(1, 'rgba(255, 150, 20, 0)');
    this.ctx.fillStyle = prangGlow;
    this.ctx.beginPath();
    this.ctx.arc(x, horizon - prH * 0.48, prH * 0.9, 0, Math.PI * 2);
    this.ctx.fill();

    // Main Prang Body
    const prangGrad = this.ctx.createLinearGradient(x, horizon, x, peakY);
    prangGrad.addColorStop(0, '#0c1a38');
    prangGrad.addColorStop(0.5, '#283658');
    prangGrad.addColorStop(0.85, '#f5af19');
    prangGrad.addColorStop(1, '#ffea79');

    this.ctx.fillStyle = prangGrad;
    this.ctx.strokeStyle = 'rgba(255, 220, 90, 0.7)';
    this.ctx.lineWidth = 1.2 * scale;

    this.ctx.beginPath();
    // Stepped base
    this.ctx.moveTo(x - prW * 0.5, horizon);
    this.ctx.lineTo(x - prW * 0.44, horizon - 12 * scale);
    this.ctx.lineTo(x - prW * 0.35, horizon - 24 * scale);
    // Tiered corn-cob body (Wat Arun Prang profile)
    for (let t = 1; t <= 5; t++) {
      const ty = horizon - (24 + t * 9.5) * scale;
      const tw = (prW * 0.34) * (1 - t * 0.13);
      this.ctx.lineTo(x - tw, ty + 4 * scale);
      this.ctx.lineTo(x - tw * 0.85, ty);
    }
    // Trishula / Spire peak (ยอดนภศูล)
    this.ctx.lineTo(x - 2 * scale, peakY + 5 * scale);
    this.ctx.lineTo(x, peakY);
    this.ctx.lineTo(x + 2 * scale, peakY + 5 * scale);
    for (let t = 5; t >= 1; t--) {
      const ty = horizon - (24 + t * 9.5) * scale;
      const tw = (prW * 0.34) * (1 - t * 0.13);
      this.ctx.lineTo(x + tw * 0.85, ty);
      this.ctx.lineTo(x + tw, ty + 4 * scale);
    }
    this.ctx.lineTo(x + prW * 0.35, horizon - 24 * scale);
    this.ctx.lineTo(x + prW * 0.44, horizon - 12 * scale);
    this.ctx.lineTo(x + prW * 0.5, horizon);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Satellite Prangs on both sides (ปรางค์ทิศ)
    [-1, 1].forEach(side => {
      const sx = x + side * (prW * 0.6);
      const sH = prH * 0.45;
      const sW = prW * 0.32;
      this.ctx.beginPath();
      this.ctx.moveTo(sx - sW * 0.5, horizon);
      this.ctx.lineTo(sx - sW * 0.3, horizon - sH * 0.4);
      this.ctx.lineTo(sx, horizon - sH);
      this.ctx.lineTo(sx + sW * 0.3, horizon - sH * 0.4);
      this.ctx.lineTo(sx + sW * 0.5, horizon);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    });

    // Golden Sparkle Star at Peak
    this.drawSparkleStar(x, peakY, 5.5 * scale, '#ffffff', '#ffd700');

    this.ctx.restore();
  }

  drawHorizonTemple(x, horizon, scale) {
    const tW = 68 * scale;
    const tH = 38 * scale;
    const roofPeak = horizon - tH;

    this.ctx.save();

    // Temple Building Base & Hall
    this.ctx.fillStyle = 'rgba(7, 16, 38, 0.98)';
    this.ctx.fillRect(x - tW * 0.4, horizon - 14 * scale, tW * 0.8, 14 * scale);

    // Glowing Golden Temple Windows (หน้าต่างกระจกสีเหลืองทองเรืองแสง)
    const winCount = 3;
    for (let i = 0; i < winCount; i++) {
      const wx = x - tW * 0.26 + i * (tW * 0.26);
      const wy = horizon - 12 * scale;
      const ww = 8 * scale;
      const wh = 9 * scale;

      // Window Light Halo
      const wGlow = this.ctx.createRadialGradient(wx + ww/2, wy + wh/2, 1, wx + ww/2, wy + wh/2, 10 * scale);
      wGlow.addColorStop(0, 'rgba(255, 230, 110, 0.85)');
      wGlow.addColorStop(0.5, 'rgba(255, 170, 30, 0.3)');
      wGlow.addColorStop(1, 'rgba(255, 150, 20, 0)');
      this.ctx.fillStyle = wGlow;
      this.ctx.fillRect(wx - 4 * scale, wy - 4 * scale, ww + 8 * scale, wh + 8 * scale);

      // Window Glass
      this.ctx.fillStyle = '#ffe082';
      this.ctx.beginPath();
      this.ctx.roundRect(wx, wy, ww, wh, [3 * scale, 3 * scale, 0, 0]);
      this.ctx.fill();
    }

    // Thai Double-Tier Gable Roof with Chofas (หลังคาซ้อนชั้น ช่อฟ้า)
    this.ctx.fillStyle = '#0f224a';
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 1.3 * scale;

    // Lower Roof Tier
    this.ctx.beginPath();
    this.ctx.moveTo(x - tW * 0.5, horizon - 14 * scale);
    this.ctx.quadraticCurveTo(x - tW * 0.52, horizon - 19 * scale, x - tW * 0.48, horizon - 21 * scale);
    this.ctx.lineTo(x, horizon - 28 * scale);
    this.ctx.lineTo(x + tW * 0.48, horizon - 21 * scale);
    this.ctx.quadraticCurveTo(x + tW * 0.52, horizon - 19 * scale, x + tW * 0.5, horizon - 14 * scale);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Upper Roof Tier
    this.ctx.beginPath();
    this.ctx.moveTo(x - tW * 0.38, horizon - 24 * scale);
    this.ctx.quadraticCurveTo(x - tW * 0.42, horizon - 31 * scale, x - tW * 0.36, horizon - 34 * scale);
    this.ctx.lineTo(x, roofPeak);
    this.ctx.lineTo(x + tW * 0.36, horizon - 34 * scale);
    this.ctx.quadraticCurveTo(x + tW * 0.42, horizon - 31 * scale, x + tW * 0.38, horizon - 24 * scale);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Golden Roof Ridge Ornament
    this.drawSparkleStar(x, roofPeak, 3.5 * scale, '#ffffff', '#ffd700');

    this.ctx.restore();
  }

  drawHorizonSala(x, horizon, scale) {
    const sW = 38 * scale;
    const sH = 26 * scale;
    const roofY = horizon - sH;

    this.ctx.save();

    // Wooden stilts & deck
    this.ctx.fillStyle = '#0a1636';
    this.ctx.fillRect(x - sW * 0.45, horizon - 6 * scale, sW * 0.9, 6 * scale);

    // Pillars
    this.ctx.strokeStyle = '#0a1636';
    this.ctx.lineWidth = 2 * scale;
    this.ctx.beginPath();
    this.ctx.moveTo(x - sW * 0.35, horizon - 6 * scale);
    this.ctx.lineTo(x - sW * 0.35, horizon - 16 * scale);
    this.ctx.moveTo(x + sW * 0.35, horizon - 6 * scale);
    this.ctx.lineTo(x + sW * 0.35, horizon - 16 * scale);
    this.ctx.stroke();

    // Hanging Lantern under roof
    const lanY = horizon - 13 * scale;
    const lanGlow = this.ctx.createRadialGradient(x, lanY, 1, x, lanY, 12 * scale);
    lanGlow.addColorStop(0, 'rgba(255, 220, 90, 0.9)');
    lanGlow.addColorStop(0.4, 'rgba(255, 140, 20, 0.35)');
    lanGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
    this.ctx.fillStyle = lanGlow;
    this.ctx.beginPath();
    this.ctx.arc(x, lanY, 12 * scale, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffe082';
    this.ctx.beginPath();
    this.ctx.arc(x, lanY, 3 * scale, 0, Math.PI * 2);
    this.ctx.fill();

    // Curved Sala Roof
    this.ctx.fillStyle = '#0f224a';
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 1.2 * scale;
    this.ctx.beginPath();
    this.ctx.moveTo(x - sW * 0.5, horizon - 16 * scale);
    this.ctx.quadraticCurveTo(x, horizon - 21 * scale, x, roofY);
    this.ctx.quadraticCurveTo(x, horizon - 21 * scale, x + sW * 0.5, horizon - 16 * scale);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawHorizonFerrisWheel(x, horizon, scale) {
    const R = 36 * scale;
    const centerY = horizon - 48 * scale;
    const rot = this.time * 0.25;

    this.ctx.save();

    // Support A-Frame Legs
    this.ctx.strokeStyle = '#091533';
    this.ctx.lineWidth = 3 * scale;
    this.ctx.beginPath();
    this.ctx.moveTo(x, centerY);
    this.ctx.lineTo(x - R * 0.65, horizon);
    this.ctx.moveTo(x, centerY);
    this.ctx.lineTo(x + R * 0.65, horizon);
    this.ctx.stroke();

    // Wheel Outer Rims
    this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
    this.ctx.lineWidth = 1.5 * scale;
    this.ctx.beginPath();
    this.ctx.arc(x, centerY, R, 0, Math.PI * 2);
    this.ctx.arc(x, centerY, R * 0.88, 0, Math.PI * 2);
    this.ctx.stroke();

    // Spokes (8 spokes)
    const spokeCount = 8;
    this.ctx.strokeStyle = 'rgba(255, 235, 130, 0.3)';
    this.ctx.lineWidth = 1.2 * scale;
    for (let s = 0; s < spokeCount; s++) {
      const sa = rot + (s / spokeCount) * Math.PI * 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, centerY);
      this.ctx.lineTo(x + Math.cos(sa) * R, centerY + Math.sin(sa) * R);
      this.ctx.stroke();
    }

    // Glowing Temple Fair Carnival Lights on Outer Rim (16 festive lights)
    const bulbCount = 16;
    const colors = ['#ffe082', '#ff5252', '#69f0ae', '#40c4ff', '#ff4081', '#ffd740', '#e040fb', '#00e676'];
    for (let i = 0; i < bulbCount; i++) {
      const angle = rot + (i / bulbCount) * Math.PI * 2;
      const bx = x + Math.cos(angle) * R;
      const by = centerY + Math.sin(angle) * R;
      const col = colors[i % colors.length];

      // Light Halo
      const bGlow = this.ctx.createRadialGradient(bx, by, 1, bx, by, 7 * scale);
      bGlow.addColorStop(0, col);
      bGlow.addColorStop(0.5, 'rgba(255, 220, 80, 0.35)');
      bGlow.addColorStop(1, 'rgba(255, 200, 50, 0)');
      this.ctx.fillStyle = bGlow;
      this.ctx.beginPath();
      this.ctx.arc(bx, by, 7 * scale, 0, Math.PI * 2);
      this.ctx.fill();

      // Light Core
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(bx, by, 2 * scale, 0, Math.PI * 2);
      this.ctx.fill();

      // Hanging Passenger Gondolas (every 2nd bulb)
      if (i % 2 === 0) {
        const gy = by + 6 * scale;
        this.ctx.fillStyle = col;
        this.ctx.beginPath();
        this.ctx.roundRect(bx - 3.5 * scale, gy, 7 * scale, 5 * scale, 2 * scale);
        this.ctx.fill();
        // Pin connecting to rim
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 1 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(bx, by);
        this.ctx.lineTo(bx, gy);
        this.ctx.stroke();
      }
    }

    // Glowing Center Hub
    const hubGlow = this.ctx.createRadialGradient(x, centerY, 1, x, centerY, 8 * scale);
    hubGlow.addColorStop(0, '#ffffff');
    hubGlow.addColorStop(0.5, '#ffd700');
    hubGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    this.ctx.fillStyle = hubGlow;
    this.ctx.beginPath();
    this.ctx.arc(x, centerY, 8 * scale, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawFestivalStringLights(horizon, scale) {
    const w = this.width;
    // Catenary curves spanning across the festive skyline
    const wires = [
      { p1: { x: w * 0.04, y: horizon - 24 * scale }, p2: { x: w * 0.18, y: horizon - 52 * scale }, sag: 14 * scale, bulbs: 7 },
      { p1: { x: w * 0.18, y: horizon - 45 * scale }, p2: { x: w * 0.35, y: horizon - 34 * scale }, sag: 15 * scale, bulbs: 8 },
      { p1: { x: w * 0.35, y: horizon - 34 * scale }, p2: { x: w * 0.46, y: horizon - 22 * scale }, sag: 13 * scale, bulbs: 6 },
      { p1: { x: w * 0.46, y: horizon - 22 * scale }, p2: { x: w * 0.56, y: horizon - 22 * scale }, sag: 11 * scale, bulbs: 5 },
      { p1: { x: w * 0.56, y: horizon - 22 * scale }, p2: { x: w * 0.72, y: horizon - 46 * scale }, sag: 16 * scale, bulbs: 8 },
      { p1: { x: w * 0.72, y: horizon - 46 * scale }, p2: { x: w * 0.84, y: horizon - 36 * scale }, sag: 14 * scale, bulbs: 7 },
      { p1: { x: w * 0.92, y: horizon - 36 * scale }, p2: { x: w * 0.99, y: horizon - 22 * scale }, sag: 12 * scale, bulbs: 5 }
    ];

    const palette = ['#ffe082', '#ff5252', '#ffd54f', '#69f0ae', '#ff4081', '#40c4ff', '#ffb300', '#ffd700'];

    let bulbGlobalIdx = 0;
    wires.forEach(wire => {
      this.ctx.save();

      const midX = (wire.p1.x + wire.p2.x) / 2;
      const midY = (wire.p1.y + wire.p2.y) / 2;
      const ctrlY = midY + wire.sag;

      // Draw dark suspension cable
      this.ctx.strokeStyle = 'rgba(255, 235, 150, 0.35)';
      this.ctx.lineWidth = 1 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(wire.p1.x, wire.p1.y);
      this.ctx.quadraticCurveTo(midX, ctrlY, wire.p2.x, wire.p2.y);
      this.ctx.stroke();

      // Bulbs along quadratic Bezier curve
      for (let b = 1; b <= wire.bulbs; b++) {
        const t = b / (wire.bulbs + 1);
        const bx = (1 - t) * (1 - t) * wire.p1.x + 2 * (1 - t) * t * midX + t * t * wire.p2.x;
        const by = (1 - t) * (1 - t) * wire.p1.y + 2 * (1 - t) * t * ctrlY + t * t * wire.p2.y;

        const col = palette[bulbGlobalIdx % palette.length];
        const twinkle = Math.sin(this.time * 3 + bulbGlobalIdx * 1.3) * 0.25 + 0.75;
        bulbGlobalIdx++;

        // Warm Bulb Halo
        const halo = this.ctx.createRadialGradient(bx, by, 1, bx, by, 8 * scale);
        halo.addColorStop(0, col);
        halo.addColorStop(0.4, `rgba(255, 215, 60, ${0.45 * twinkle})`);
        halo.addColorStop(1, 'rgba(255, 180, 20, 0)');
        this.ctx.fillStyle = halo;
        this.ctx.beginPath();
        this.ctx.arc(bx, by, 8 * scale, 0, Math.PI * 2);
        this.ctx.fill();

        // Bulb Core
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(bx, by, 2.2 * scale, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    });
  }

  drawShorelineLanterns(horizon, scale) {
    const postX = [0.08, 0.24, 0.40, 0.47, 0.53, 0.62, 0.78, 0.94];
    this.ctx.save();
    postX.forEach(pxFactor => {
      const px = this.width * pxFactor;
      const py = horizon - 10 * scale;

      // Small lantern post
      this.ctx.strokeStyle = '#091533';
      this.ctx.lineWidth = 1.5 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(px, horizon);
      this.ctx.lineTo(px, py);
      this.ctx.stroke();

      // Lantern Flame Glow
      const fGlow = this.ctx.createRadialGradient(px, py, 1, px, py, 9 * scale);
      fGlow.addColorStop(0, 'rgba(255, 230, 110, 0.9)');
      fGlow.addColorStop(0.5, 'rgba(255, 150, 30, 0.35)');
      fGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
      this.ctx.fillStyle = fGlow;
      this.ctx.beginPath();
      this.ctx.arc(px, py, 9 * scale, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ffeb3b';
      this.ctx.beginPath();
      this.ctx.arc(px, py, 2.5 * scale, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  drawSparkleStar(x, y, r, coreCol, glowCol) {
    const twinkle = Math.sin(this.time * 4 + x) * 0.3 + 0.7;
    const curR = r * twinkle;

    const sGlow = this.ctx.createRadialGradient(x, y, 1, x, y, curR * 2.5);
    sGlow.addColorStop(0, glowCol);
    sGlow.addColorStop(0.6, 'rgba(255, 215, 0, 0.3)');
    sGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    this.ctx.fillStyle = sGlow;
    this.ctx.beginPath();
    this.ctx.arc(x, y, curR * 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // 4-Pointed Star Cross Rays
    this.ctx.strokeStyle = coreCol;
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x - curR * 1.8, y);
    this.ctx.lineTo(x + curR * 1.8, y);
    this.ctx.moveTo(x, y - curR * 1.8);
    this.ctx.lineTo(x, y + curR * 1.8);
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(x, y, curR * 0.4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawSkyLanterns() {
    this.lanterns.forEach(lan => {
      this.ctx.save();
      this.ctx.globalAlpha = lan.opacity;

      // Lantern Warm Glow
      const glow = this.ctx.createRadialGradient(lan.x, lan.y, 1, lan.x, lan.y, lan.size * 1.8);
      glow.addColorStop(0, 'rgba(255, 230, 100, 0.8)');
      glow.addColorStop(0.6, 'rgba(255, 120, 30, 0.3)');
      glow.addColorStop(1, 'rgba(255, 100, 0, 0)');
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(lan.x, lan.y, lan.size * 1.8, 0, Math.PI * 2);
      this.ctx.fill();

      // Lantern Cylinder
      const lanGrad = this.ctx.createLinearGradient(lan.x - lan.size/2, lan.y, lan.x + lan.size/2, lan.y);
      lanGrad.addColorStop(0, '#ff9800');
      lanGrad.addColorStop(0.5, '#fff9c4');
      lanGrad.addColorStop(1, '#ff9800');

      this.ctx.fillStyle = lanGrad;
      this.ctx.beginPath();
      this.ctx.roundRect(lan.x - lan.size * 0.4, lan.y - lan.size * 0.55, lan.size * 0.8, lan.size * 1.1, [3, 3, 1, 1]);
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  // --- RIVER & WATER WAVES ---
  drawRiver() {
    const horizon = this.height * 0.44;
    const riverHeight = this.height - horizon;

    // River Water Gradient
    const riverGrad = this.ctx.createLinearGradient(0, horizon, 0, this.height);
    riverGrad.addColorStop(0, '#091533');
    riverGrad.addColorStop(0.4, '#06132e');
    riverGrad.addColorStop(0.8, '#040d21');
    riverGrad.addColorStop(1, '#020714');

    this.ctx.fillStyle = riverGrad;
    this.ctx.fillRect(0, horizon, this.width, riverHeight);

    // Moonlight River Path (Shimmering reflection trail)
    const mx = this.width * 0.5;
    const moonTrail = this.ctx.createLinearGradient(0, horizon, 0, this.height);
    moonTrail.addColorStop(0, 'rgba(255, 245, 180, 0.45)');
    moonTrail.addColorStop(0.5, 'rgba(255, 225, 110, 0.25)');
    moonTrail.addColorStop(1, 'rgba(255, 200, 80, 0.08)');

    this.ctx.save();
    this.ctx.fillStyle = moonTrail;
    this.ctx.beginPath();
    this.ctx.moveTo(mx - 15, horizon);
    this.ctx.lineTo(mx + 15, horizon);
    this.ctx.lineTo(mx + 130, this.height);
    this.ctx.lineTo(mx - 130, this.height);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();

    // Shimmering water reflections from the illuminated temple fair & pagodas
    this.drawShorelineReflections(horizon, Math.max(0.75, Math.min(this.width / 950, 1.25)));

    // Shimmering horizontal wave ripples
    const rippleCount = 28;
    for (let i = 0; i < rippleCount; i++) {
      const y = horizon + (i / rippleCount) * riverHeight;
      const speed = 1.0 + (i / rippleCount) * 0.8;
      const waveWidth = 40 + (i / rippleCount) * (this.width * 0.6);
      const waveX = mx + Math.sin(this.time * speed + i) * (waveWidth * 0.35);
      const alpha = 0.15 + (1 - (i / rippleCount)) * 0.25;

      this.ctx.strokeStyle = `rgba(255, 240, 180, ${alpha})`;
      this.ctx.lineWidth = 1.2 + (i / rippleCount) * 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(waveX - waveWidth * 0.5, y);
      this.ctx.quadraticCurveTo(waveX, y + Math.sin(this.time * 2 + i) * 3, waveX + waveWidth * 0.5, y);
      this.ctx.stroke();
    }
  }

  drawShorelineReflections(horizon, scale) {
    this.ctx.save();

    // Golden & festival reflection columns on water beneath landmarks
    const reflections = [
      { x: this.width * 0.18, w: 42 * scale, color: 'rgba(255, 215, 60, 0.35)', depth: 75 * scale }, // Chedi gold
      { x: this.width * 0.35, w: 52 * scale, color: 'rgba(255, 190, 50, 0.28)', depth: 55 * scale }, // Temple amber
      { x: this.width * 0.56, w: 34 * scale, color: 'rgba(255, 180, 40, 0.25)', depth: 45 * scale }, // Sala
      { x: this.width * 0.72, w: 48 * scale, color: 'rgba(255, 220, 80, 0.36)', depth: 85 * scale }, // Prang gold
      { x: this.width * 0.88, w: 54 * scale, color: 'rgba(255, 120, 180, 0.30)', depth: 68 * scale } // Ferris wheel carnival
    ];

    reflections.forEach(ref => {
      const grad = this.ctx.createLinearGradient(ref.x, horizon, ref.x, horizon + ref.depth);
      grad.addColorStop(0, ref.color);
      grad.addColorStop(0.5, ref.color.replace(/[\d\.]+\)$/, '0.12)'));
      grad.addColorStop(1, 'rgba(255, 200, 50, 0)');

      this.ctx.fillStyle = grad;
      const rippleLines = 14;
      for (let r = 0; r < rippleLines; r++) {
        const ry = horizon + (r / rippleLines) * ref.depth;
        const waveShift = Math.sin(this.time * 2.5 + ry * 0.2) * (5 * scale);
        const rw = ref.w * (1 - r / (rippleLines * 1.5));
        this.ctx.fillRect(ref.x - rw / 2 + waveShift, ry, rw, 2.5 * scale);
      }
    });

    // Small flickering water reflections beneath shoreline lanterns
    const lanternX = [0.08, 0.24, 0.40, 0.47, 0.53, 0.62, 0.78, 0.94];
    lanternX.forEach((factor, idx) => {
      const lx = this.width * factor;
      const lDepth = 25 * scale;
      const waveShift = Math.sin(this.time * 3 + idx) * (3 * scale);
      const lGrad = this.ctx.createLinearGradient(lx, horizon, lx, horizon + lDepth);
      lGrad.addColorStop(0, 'rgba(255, 225, 100, 0.38)');
      lGrad.addColorStop(1, 'rgba(255, 180, 50, 0)');
      this.ctx.fillStyle = lGrad;
      this.ctx.fillRect(lx - 4 * scale + waveShift, horizon, 8 * scale, lDepth);
    });

    this.ctx.restore();
  }

  drawWaterPetals() {
    this.waterPetals.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, 0.2, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  // --- KRATHONGS ON WATER ---
  drawKrathongs() {
    this.krathongs.forEach((k, idx) => {
      if (!k.img || !k.img.complete) return;

      this.ctx.save();
      this.ctx.translate(k.x, k.y);

      // Water Ripple Ring beneath Krathong
      const rippleRadius = (k.size * 0.45) + Math.sin(this.time * 2 + k.bobOffset) * 6;
      this.ctx.strokeStyle = 'rgba(255, 230, 150, 0.35)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.ellipse(0, k.size * 0.26, rippleRadius, rippleRadius * 0.3, 0, 0, Math.PI * 2);
      this.ctx.stroke();

      // Golden Candle Reflection in water
      const candleReflect = this.ctx.createRadialGradient(0, k.size * 0.3, 2, 0, k.size * 0.35, k.size * 0.5);
      candleReflect.addColorStop(0, 'rgba(255, 180, 50, 0.45)');
      candleReflect.addColorStop(0.5, 'rgba(255, 120, 20, 0.2)');
      candleReflect.addColorStop(1, 'rgba(255, 100, 0, 0)');
      this.ctx.fillStyle = candleReflect;
      this.ctx.beginPath();
      this.ctx.ellipse(0, k.size * 0.35, k.size * 0.4, k.size * 0.15, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Gentle rocking angle on water
      const rockAngle = Math.sin(this.time * 1.2 + k.tiltOffset) * 0.04;
      this.ctx.rotate(rockAngle);

      // Draw Krathong SVG Image
      this.ctx.drawImage(k.img, -k.size / 2, -k.size / 2, k.size, k.size);

      // Draw Floating Name & Love Tag Badge
      this.drawKrathongTag(k, 0, -k.size * 0.55);

      this.ctx.restore();
    });
  }

  drawKrathongTag(k, tagX, tagY) {
    this.ctx.save();
    const icon = (k.id === 'me') ? '🪷' : '💕';
    const tagText = `${icon} กระทงของ ${k.name}`;
    this.ctx.font = 'bold 16px "TH Sarabun PSK", "TH Sarabun New", "Sarabun", sans-serif';
    const textWidth = this.ctx.measureText(tagText).width;
    const padX = 14;
    const padY = 5;
    const boxW = textWidth + padX * 2;
    const boxH = 26;

    // Badge Background
    this.ctx.fillStyle = 'rgba(11, 24, 54, 0.85)';
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.roundRect(tagX - boxW / 2, tagY - boxH / 2, boxW, boxH, 12);
    this.ctx.fill();
    this.ctx.stroke();

    // Text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(tagText, tagX, tagY);

    // Wish Speech Bubble (if any loveChat is active)
    if (k.loveChat) {
      this.drawChatBubble(k.loveChat, tagX, tagY - 26);
    }

    this.ctx.restore();
  }

  drawChatBubble(text, bx, by) {
    this.ctx.save();
    this.ctx.font = '16px "TH Sarabun PSK", "TH Sarabun New", "Sarabun", sans-serif';
    const tw = this.ctx.measureText(text).width;
    const w = tw + 20;
    const h = 26;

    this.ctx.fillStyle = 'rgba(255, 64, 129, 0.95)';
    this.ctx.beginPath();
    this.ctx.roundRect(bx - w / 2, by - h / 2, w, h, 14);
    this.ctx.fill();

    // Pointer down
    this.ctx.beginPath();
    this.ctx.moveTo(bx - 5, by + h / 2);
    this.ctx.lineTo(bx, by + h / 2 + 6);
    this.ctx.lineTo(bx + 5, by + h / 2);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, bx, by);
    this.ctx.restore();
  }

  // --- REACTION EFFECTS ---
  addHeartReaction(sender = 'me') {
    const target = this.krathongs.find(k => k.id === sender) || this.krathongs[0];
    const originX = target ? target.x : this.width * 0.5;
    const originY = target ? target.y - 20 : this.height * 0.6;

    for (let i = 0; i < 7; i++) {
      this.addHeartParticle(
        originX + (Math.random() - 0.5) * 30,
        originY + (Math.random() - 0.5) * 15,
        1.0 + Math.random() * 0.5
      );
    }
  }

  addHeartParticle(x, y, scale = 1.0) {
    this.particles.push({
      type: 'heart',
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -1.5 - Math.random() * 1.5,
      scale: scale,
      color: Math.random() > 0.4 ? '#ff4081' : '#ff80ab',
      alpha: 1.0,
      life: 1.0,
      decay: 0.015,
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.alpha = this.life;
      },
      draw: (ctx) => {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-5, -7, -12, -7, -12, 0);
        ctx.bezierCurveTo(-12, 5, 0, 13, 0, 16);
        ctx.bezierCurveTo(0, 13, 12, 5, 12, 0);
        ctx.bezierCurveTo(12, -7, 5, -7, 0, 0);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  triggerFirework(fx = null, fy = null) {
    const x = fx !== null ? fx : this.width * 0.2 + Math.random() * (this.width * 0.6);
    const y = fy !== null ? fy : this.height * 0.12 + Math.random() * (this.height * 0.22);
    const colors = ['#ffd700', '#ff4081', '#00e5ff', '#ffeb3b', '#e040fb'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    this.fireworks.push(new FireworkBurst(x, y, color));
  }

  releaseCustomLantern(name1, name2) {
    const startX = this.width * 0.45 + (Math.random() - 0.5) * 60;
    const startY = this.height * 0.6;
    this.lanterns.push({
      x: startX,
      y: startY,
      size: 22,
      speedY: 0.8,
      speedX: (Math.random() - 0.5) * 0.3,
      swaySpeed: 0.03,
      phase: Math.random() * Math.PI,
      opacity: 0.95,
      isSpecial: true,
      text: `${name1} ❤️ ${name2}`
    });
  }

  showLoveChat(senderId, text) {
    const k = this.krathongs.find(item => item.id === senderId);
    if (k) {
      k.loveChat = text;
      setTimeout(() => {
        k.loveChat = null;
      }, 4000);
    }
  }

  drawFireworks() {
    this.fireworks.forEach(fw => fw.draw(this.ctx));
  }

  drawParticles() {
    this.particles.forEach(p => p.draw(this.ctx));
  }

  // --- SOUVENIR SNAPSHOT ---
  captureKeepsake(callback) {
    // Render current frame to image
    const dataUrl = this.canvas.toDataURL('image/png');
    if (callback) callback(dataUrl);
    return dataUrl;
  }
}

// Firework particle physics
class FireworkBurst {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.particles = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.01,
        color: color
      });
    }
  }

  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.alpha -= p.decay;
    });
  }

  isDead() {
    return this.particles.every(p => p.alpha <= 0);
  }

  draw(ctx) {
    this.particles.forEach(p => {
      if (p.alpha <= 0) return;
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}

window.RiverSimulation = RiverSimulation;
