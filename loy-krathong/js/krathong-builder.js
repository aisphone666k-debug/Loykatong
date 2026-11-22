/**
 * 🌸 Krathong Builder & Customizer Engine
 * Generates rich, highly detailed SVG/Canvas representations of the Krathong
 * with 15 UNIQUE Krathong base shapes, petal layers, flower beds, candles,
 * custom uploaded photo with frames, and romantic decorations.
 */

class KrathongBuilder {
  constructor() {
    this.config = {
      base: 'banana_leaf',      // 15 Base shapes!
      petal: 'phaka',           // phaka, folded_leaf, gold_edge, rose_petals, crystal_sparkle, none
      flower: 'marigold',       // marigold, lotus_flower, orchid, roses, jasmine, sunflower, mixed
      candle: 'twin_heart',     // yellow, twin_heart, pink_love, white_scent, red_lucky, gold_sparkle
      incense: true,            // true/false
      photo: {
        dataUrl: null,
        frame: 'heart',         // heart, polaroid, circle, stamp
        scale: 1.0,
        rotate: 0,
        x: 0,
        y: -30
      },
      decoration: 'couple_tag', // coins, ribbon, couple_tag, fairy_lights, bear_couple, none
      myName: '',
      partnerName: '',
      wish: 'ขอขมาพระแม่คงคา และขอให้ความรักของเราสองคนสดใส มั่นคง มีความสุขตลอดไปนะ ❤️'
    };

    // 15 Distinct Krathong Base Shapes & Options
    this.options = {
      bases: [
        { id: 'banana_leaf', name: 'ใบตองวิจิตร', icon: '🍃', desc: 'ฐานใบตองแท้ซ้อนชั้นพับจีบวิจิตร' },
        { id: 'heart_love', name: 'หัวใจคู่รัก', icon: '💖', desc: 'กระทงรูปหัวใจแห่งรักนิรันดร์' },
        { id: 'royal_swan', name: 'เรือสุพรรณหงส์', icon: '🦢', desc: 'เรือหงส์ทองหลวงสง่างาม' },
        { id: 'golden_star', name: 'ดาวประกายแสง', icon: '⭐', desc: 'กระทงดาว 8 แฉกสีทองมงคล' },
        { id: 'lotus', name: 'ดอกบัวหลวงบาน', icon: '🪷', desc: 'ฐานกลีบบัวหลวงสีชมพูขาวบริสุทธิ์' },
        { id: 'bread_turtle', name: 'ขนมปังเต่าน้อย', icon: '🐢', desc: 'ขนมปังเต่ารักษ์น้ำ ปลากินได้' },
        { id: 'bread_cat', name: 'ขนมปังน้องแมว', icon: '🐱', desc: 'ขนมปังแมวเหมียวน่ารักสดใส' },
        { id: 'bread_duck', name: 'ขนมปังเป็ดเหลือง', icon: '🐥', desc: 'ขนมปังเป็ดน้อยคิ้วท์ๆ ลอยน้ำ' },
        { id: 'coconut_shell', name: 'กะลามะพร้าว', icon: '🥥', desc: 'กะลาเทียนหอมโบราณ สว่างไสว' },
        { id: 'ice_cream', name: 'โคนไอศกรีม', icon: '🍦', desc: 'โคนวาฟเฟิลพาสเทล น่ารักสดใส' },
        { id: 'crystal_glow', name: 'คริสตัลแก้วใส', icon: '💎', desc: 'แก้วคริสตัลนีออนเปล่งประกาย' },
        { id: 'royal_crown', name: 'มงกุฎทองวิจิตร', icon: '👑', desc: 'มงกุฎทองคำประดับอัญมณีล้ำค่า' },
        { id: 'lotus_leaf', name: 'ใบบัวถาดธรรมชาติ', icon: '🪴', desc: 'ใบบัวยักษ์ขอบตั้งหยดน้ำกลิ้ง' },
        { id: 'donut_sweet', name: 'โดนัทสายรุ้ง', icon: '🍩', desc: 'โดนัทเคลือบสตรอว์เบอร์รี่หวานแหวว' },
        { id: 'lanna_lantern', name: 'โคมประทีปล้านนา', icon: '🏮', desc: 'โคมกระดาษล้านนาเรืองแสงอบอุ่น' }
      ],
      petals: [
        { id: 'phaka', name: 'กลีบผกากรอง', icon: '🌿', desc: 'พับจับจีบซ้อน 2 ชั้นวิจิตร' },
        { id: 'folded_leaf', name: 'ใบตองกลัดหมุด', icon: '🎋', desc: 'จีบปลายแหลมสไตล์ไทยดั้งเดิม' },
        { id: 'gold_edge', name: 'ขอบทองฉลุลาย', icon: '✨', desc: 'ลวดลายวิจิตรสีทองมงคล' },
        { id: 'rose_petals', name: 'กลีบกุหลาบหวาน', icon: '🌹', desc: 'กลีบกุหลาบสีแดงชมพูอบอวลรัก' },
        { id: 'crystal_sparkle', name: 'กลีบดาวประกาย', icon: '⭐', desc: 'ประกายดาววิบวับใต้แสงจันทร์' },
        { id: 'none', name: 'ไม่ใส่กลีบ', icon: '🚫', desc: 'เรียบง่ายมินิมอล' }
      ],
      flowers: [
        { id: 'marigold', name: 'ดอกดาวเรืองมงคล', icon: '🌼', desc: 'สีเหลืองทองอร่าม สื่อถึงความเจริญรุ่งเรือง' },
        { id: 'lotus_flower', name: 'ดอกบัวหลวงชมพู', icon: '🪷', desc: 'ดอกบัวบานกลางกระทง สง่างาม' },
        { id: 'orchid', name: 'กล้วยไม้สีม่วง', icon: '🌺', desc: 'กล้วยไม้แคทลียาสีม่วงอ่อนหวาน' },
        { id: 'roses', name: 'ช่อกุหลาบคู่รัก', icon: '🌹', desc: 'กุหลาบแดงและชมพู สื่อรักนิรันดร์' },
        { id: 'jasmine', name: 'พวงมะลิหอม', icon: '🤍', desc: 'มะลิซ้อนขาวบริสุทธิ์ ส่งกลิ่นหอมชื่นใจ' },
        { id: 'sunflower', name: 'ทานตะวันสดใส', icon: '🌻', desc: 'สดใสเปี่ยมพลังแห่งความหวัง' },
        { id: 'mixed', name: 'รวมช่อบุปผาหลากสี', icon: '💐', desc: 'ช่อดอกไม้นานาพันธุ์ตระการตา' }
      ],
      candles: [
        { id: 'twin_heart', name: 'เทียนคู่หัวใจรัก', icon: '🕯️❤️', desc: 'เทียนหัวใจคู่ สัญลักษณ์คู่รักเคียงกัน' },
        { id: 'yellow', name: 'เทียนทองดั้งเดิม', icon: '🕯️💛', desc: 'เทียนสีเหลืองทองอบอุ่น' },
        { id: 'pink_love', name: 'เทียนชมพูหวาน', icon: '🕯️💖', desc: 'เทียนสีชมพูพาสเทลโรแมนติก' },
        { id: 'white_scent', name: 'เทียนขาวอโรมา', icon: '🕯️🤍', desc: 'เทียนขาวบริสุทธิ์หอมกรุ่น' },
        { id: 'red_lucky', name: 'เทียนแดงนำโชค', icon: '🕯️🔴', desc: 'เทียนแดงมงคล เสริมดวงความรัก' },
        { id: 'gold_sparkle', name: 'เทียนทองระยิบระยับ', icon: '🕯️✨', desc: 'เทียนทองคำเปล่งแสงประกาย' }
      ],
      decorations: [
        { id: 'couple_tag', name: 'ป้ายชื่อคู่เรา', icon: '🏷️', desc: 'ป้ายไม้สลักชื่อคู่รักสุดโรแมนติก' },
        { id: 'coins', name: 'เหรียญบาทนำโชค', icon: '🪙', desc: 'เหรียญกษาปณ์อธิษฐานมั่งคั่งร่ำรวย' },
        { id: 'ribbon', name: 'โบว์ชมพูผูกรัก', icon: '🎀', desc: 'ริบบิ้นซาตินผูกโบว์หวาน' },
        { id: 'fairy_lights', name: 'ไฟแฟรี่วิบวับ', icon: '💡', desc: 'สายไฟดวงเล็กกระพริบระยิบระยับ' },
        { id: 'bear_couple', name: 'น้องหมีคู่รัก', icon: '🧸', desc: 'ตุ๊กตาหมีคู่น่ารักสื่อความอบอุ่น' },
        { id: 'none', name: 'ไม่ใส่ของตกแต่ง', icon: '🚫', desc: 'เรียบง่ายสบายตา' }
      ],
      frames: [
        { id: 'heart', name: 'กรอบหัวใจ', icon: '💖' },
        { id: 'polaroid', name: 'โพลารอยด์', icon: '📷' },
        { id: 'circle', name: 'วงกลมเรืองแสง', icon: '⭕' },
        { id: 'stamp', name: 'แสตมป์วินเทจ', icon: '💌' }
      ]
    };
  }

  setPhoto(dataUrl) {
    this.config.photo.dataUrl = dataUrl;
  }

  setPhotoFrame(frame) {
    this.config.photo.frame = frame;
  }

  setPhotoScale(scale) {
    this.config.photo.scale = parseFloat(scale);
  }

  setPhotoRotate(deg) {
    this.config.photo.rotate = parseFloat(deg);
  }

  setOption(category, value) {
    if (category === 'photo') {
      Object.assign(this.config.photo, value);
    } else {
      this.config[category] = value;
    }
  }

  // --- SVG GENERATOR ---
  generateSVG(width = 300, height = 300, isFloating = false) {
    const c = this.config;
    const cx = 150;
    const cy = 160;

    // Defs for gradients & filters
    const defs = `
      <defs>
        <!-- Candle glow filter -->
        <filter id="flame-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur1" />
          <feGaussianBlur stdDeviation="14" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <!-- Water ripple under glow -->
        <radialGradient id="water-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(0,0,0,0.65)" />
          <stop offset="60%" stop-color="rgba(0,0,0,0.3)" />
          <stop offset="100%" stop-color="rgba(0,0,0,0)" />
        </radialGradient>

        <radialGradient id="candle-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(255, 235, 120, 0.9)" />
          <stop offset="40%" stop-color="rgba(255, 150, 40, 0.4)" />
          <stop offset="100%" stop-color="rgba(255, 100, 0, 0)" />
        </radialGradient>

        <!-- Banana leaf base gradients -->
        <linearGradient id="banana-leaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4caf50" />
          <stop offset="40%" stop-color="#2e7d32" />
          <stop offset="100%" stop-color="#1b5e20" />
        </linearGradient>

        <linearGradient id="banana-disc" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#81c784" />
          <stop offset="50%" stop-color="#43a047" />
          <stop offset="100%" stop-color="#2e7d32" />
        </linearGradient>

        <!-- Lotus base gradient -->
        <linearGradient id="lotus-petal-grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#f8bbd0" />
          <stop offset="60%" stop-color="#ff4081" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>

        <!-- Bread base gradient -->
        <linearGradient id="bread-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffe0b2" />
          <stop offset="60%" stop-color="#d7ccc8" />
          <stop offset="100%" stop-color="#8d6e63" />
        </linearGradient>

        <!-- Gold Royal gradient -->
        <linearGradient id="gold-royal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff59d" />
          <stop offset="40%" stop-color="#ffd700" />
          <stop offset="80%" stop-color="#ff8f00" />
          <stop offset="100%" stop-color="#b78103" />
        </linearGradient>

        <!-- Heart base gradient -->
        <linearGradient id="heart-base-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ff80ab" />
          <stop offset="50%" stop-color="#f50057" />
          <stop offset="100%" stop-color="#880e4f" />
        </linearGradient>

        <!-- Coconut shell gradient -->
        <linearGradient id="coconut-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6d4c41" />
          <stop offset="60%" stop-color="#4e342e" />
          <stop offset="100%" stop-color="#271410" />
        </linearGradient>

        <!-- Ice cream cone gradient -->
        <linearGradient id="cone-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffe0b2" />
          <stop offset="50%" stop-color="#ffb74d" />
          <stop offset="100%" stop-color="#d7ccc8" />
        </linearGradient>

        <!-- Crystal gradient -->
        <linearGradient id="crystal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(128, 222, 234, 0.9)" />
          <stop offset="50%" stop-color="rgba(238, 130, 238, 0.85)" />
          <stop offset="100%" stop-color="rgba(255, 255, 255, 0.95)" />
        </linearGradient>

        <!-- Victoria Lily Pad gradient -->
        <linearGradient id="lilypad-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#66bb6a" />
          <stop offset="70%" stop-color="#2e7d32" />
          <stop offset="100%" stop-color="#1b5e20" />
        </linearGradient>

        <!-- Donut Strawberry Glaze -->
        <linearGradient id="donut-glaze" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ff80ab" />
          <stop offset="60%" stop-color="#ff4081" />
          <stop offset="100%" stop-color="#c2185b" />
        </linearGradient>

        <!-- Lanna Amber Lantern -->
        <radialGradient id="lanna-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff9c4" />
          <stop offset="50%" stop-color="#ffb74d" />
          <stop offset="100%" stop-color="#e65100" />
        </radialGradient>

        <!-- Heart photo clip path -->
        <clipPath id="heart-clip">
          <path d="M 0 -22 C -18 -42 -40 -15 -40 8 C -40 32 -10 46 0 62 C 10 46 40 32 40 8 C 40 -15 18 -42 0 -22 Z" />
        </clipPath>

        <clipPath id="circle-clip">
          <circle cx="0" cy="0" r="32" />
        </clipPath>
      </defs>
    `;

    // 1. Water shadow
    const shadow = `<ellipse cx="${cx}" cy="${cy + 52}" rx="118" ry="36" fill="url(#water-shadow)" />`;

    // 2. Base Layer (15 SHAPES)
    let baseSvg = this.generateBaseShape(c.base, cx, cy);

    // 3. Petals Rim Layer
    let petalSvg = '';
    if (c.petal === 'phaka') {
      petalSvg = this.generateFoldedLeaves(cx, cy + 20, 14, 96, '#43a047', '#1b5e20');
    } else if (c.petal === 'folded_leaf') {
      petalSvg = this.generateSharpPetals(cx, cy + 20, 16, 98, '#2e7d32', '#004d40');
    } else if (c.petal === 'gold_edge') {
      petalSvg = this.generateGoldBorder(cx, cy + 20, 14, 98);
    } else if (c.petal === 'rose_petals') {
      petalSvg = this.generateRosePetalsRim(cx, cy + 20, 14, 95);
    } else if (c.petal === 'crystal_sparkle') {
      petalSvg = this.generateCrystalStars(cx, cy + 20, 14, 96);
    }

    // 4. Flower Bed Layer
    let flowerSvg = '';
    if (c.flower === 'marigold') {
      flowerSvg = this.generateMarigoldBed(cx, cy + 18);
    } else if (c.flower === 'lotus_flower') {
      flowerSvg = this.generateLotusBed(cx, cy + 16);
    } else if (c.flower === 'orchid') {
      flowerSvg = this.generateOrchidBed(cx, cy + 18);
    } else if (c.flower === 'roses') {
      flowerSvg = this.generateRoseBed(cx, cy + 18);
    } else if (c.flower === 'jasmine') {
      flowerSvg = this.generateJasmineBed(cx, cy + 18);
    } else if (c.flower === 'sunflower') {
      flowerSvg = this.generateSunflowerBed(cx, cy + 18);
    } else if (c.flower === 'mixed') {
      flowerSvg = this.generateMixedBed(cx, cy + 18);
    }

    // 5. Decorations
    let decorSvg = '';
    if (c.decoration === 'coins') {
      decorSvg = `
        <!-- Lucky gold coins -->
        <g>
          <ellipse cx="${cx - 45}" cy="${cy + 25}" rx="9" ry="6" fill="#ffd700" stroke="#b78103" stroke-width="1.5" />
          <ellipse cx="${cx - 45}" cy="${cy + 25}" rx="5" ry="3" fill="#ffe57f" />
          <ellipse cx="${cx + 45}" cy="${cy + 26}" rx="9" ry="6" fill="#ffd700" stroke="#b78103" stroke-width="1.5" />
          <ellipse cx="${cx + 45}" cy="${cy + 26}" rx="5" ry="3" fill="#ffe57f" />
          <ellipse cx="${cx - 15}" cy="${cy + 34}" rx="8" ry="5" fill="#ffd700" stroke="#b78103" stroke-width="1" />
        </g>
      `;
    } else if (c.decoration === 'ribbon') {
      decorSvg = `
        <!-- Pink satin couple ribbon bow -->
        <g transform="translate(${cx}, ${cy + 32})">
          <path d="M 0 0 C -25 -15 -30 10 -6 4 C -22 25 -18 35 -14 36 C -8 20 -4 10 0 4 C 4 10 8 20 14 36 C 18 35 22 25 6 4 C 30 10 25 -15 0 0 Z" fill="#ff4081" stroke="#f50057" stroke-width="1.5" />
          <circle cx="0" cy="2" r="5" fill="#ffd54f" />
        </g>
      `;
    } else if (c.decoration === 'couple_tag') {
      decorSvg = `
        <!-- Wooden Love Sign Tag -->
        <g transform="translate(${cx}, ${cy + 34})">
          <rect x="-44" y="-10" width="88" height="20" rx="8" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))" />
          <text x="0" y="4" text-anchor="middle" font-size="11" font-family="'TH Sarabun PSK', 'TH Sarabun New', 'Sarabun', sans-serif" font-weight="bold" fill="#4e342e">
            ${c.myName || 'เรา'} 💕 ${c.partnerName || 'แฟน'}
          </text>
        </g>
      `;
    } else if (c.decoration === 'fairy_lights') {
      decorSvg = this.generateFairyLights(cx, cy + 22, 10, 75);
    } else if (c.decoration === 'bear_couple') {
      decorSvg = `
        <!-- Cute Bear Couple sticker -->
        <g transform="translate(${cx}, ${cy + 26})">
          <circle cx="-16" cy="-6" r="11" fill="#8d6e63" />
          <circle cx="-23" cy="-14" r="4" fill="#6d4c41" />
          <circle cx="-9" cy="-14" r="4" fill="#6d4c41" />
          <circle cx="-16" cy="-4" r="5" fill="#d7ccc8" />
          <circle cx="-16" cy="-5" r="1.5" fill="#212121" />
          <circle cx="16" cy="-6" r="11" fill="#fff9c4" stroke="#d7ccc8" stroke-width="1" />
          <circle cx="9" cy="-14" r="4" fill="#fff59d" />
          <circle cx="23" cy="-14" r="4" fill="#fff59d" />
          <circle cx="16" cy="-4" r="5" fill="#ffffff" />
          <circle cx="16" cy="-5" r="1.5" fill="#212121" />
          <circle cx="21" cy="-13" r="3" fill="#ff4081" />
          <path d="M 0 -8 C -4 -14 -10 -9 -6 -4 L 0 2 L 6 -4 C 10 -9 4 -14 0 -8 Z" fill="#ff1744" />
        </g>
      `;
    }

    // 6. Uploaded Photo Pin
    let photoSvg = '';
    if (c.photo && c.photo.dataUrl) {
      photoSvg = this.generatePhotoLayer(cx, cy, c.photo);
    }

    // 7. Incense & Candles Layer
    let candleSvg = '';
    const candleColor = this.getCandleColor(c.candle);
    
    // Incense sticks
    let incenseSvg = '';
    if (c.incense) {
      incenseSvg = `
        <!-- 3 Incense Sticks with animated embers -->
        <g>
          <line x1="${cx - 14}" y1="${cy + 5}" x2="${cx - 24}" y2="${cy - 48}" stroke="#bf360c" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="${cx - 24}" cy="${cy - 48}" r="2.5" fill="#ff5722" filter="url(#flame-glow)" />
          
          <line x1="${cx - 8}" y1="${cy + 5}" x2="${cx - 12}" y2="${cy - 54}" stroke="#bf360c" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="${cx - 12}" cy="${cy - 54}" r="2.5" fill="#ff5722" filter="url(#flame-glow)" />

          <line x1="${cx - 2}" y1="${cy + 5}" x2="${cx - 1}" y2="${cy - 47}" stroke="#bf360c" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="${cx - 1}" cy="${cy - 47}" r="2.5" fill="#ff5722" filter="url(#flame-glow)" />

          <path d="M ${cx - 12} ${cy - 54} Q ${cx - 18} ${cy - 70} ${cx - 6} ${cy - 85} T ${cx - 12} ${cy - 100}" 
                stroke="rgba(255, 255, 255, 0.4)" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.6">
            <animate attributeName="d" dur="3s" repeatCount="indefinite"
              values="
                M ${cx - 12} ${cy - 54} Q ${cx - 18} ${cy - 70} ${cx - 6} ${cy - 85} T ${cx - 12} ${cy - 100};
                M ${cx - 12} ${cy - 54} Q ${cx - 6} ${cy - 70} ${cx - 18} ${cy - 85} T ${cx - 6} ${cy - 100};
                M ${cx - 12} ${cy - 54} Q ${cx - 18} ${cy - 70} ${cx - 6} ${cy - 85} T ${cx - 12} ${cy - 100}
              " />
          </path>
        </g>
      `;
    }

    if (c.candle === 'twin_heart') {
      candleSvg = `
        <!-- Twin Heart Romantic Candles -->
        <g>
          <rect x="${cx + 4}" y="${cy - 20}" width="14" height="28" rx="4" fill="#ff4081" stroke="#f50057" stroke-width="1" />
          <line x1="${cx + 11}" y1="${cy - 20}" x2="${cx + 11}" y2="${cy - 26}" stroke="#212121" stroke-width="2" />
          ${this.generateFlame(cx + 11, cy - 32, 10, 18)}

          <rect x="${cx + 20}" y="${cy - 15}" width="14" height="23" rx="4" fill="#ff80ab" stroke="#ff4081" stroke-width="1" />
          <line x1="${cx + 27}" y1="${cy - 15}" x2="${cx + 27}" y2="${cy - 21}" stroke="#212121" stroke-width="2" />
          ${this.generateFlame(cx + 27, cy - 27, 9, 16)}

          <path d="M ${cx + 19} ${cy - 5} C ${cx + 15} ${cy - 10} ${cx + 10} ${cy - 5} ${cx + 14} ${cy} L ${cx + 19} ${cy + 5} L ${cx + 24} ${cy} C ${cx + 28} ${cy - 5} ${cx + 23} ${cy - 10} ${cx + 19} ${cy - 5} Z" fill="#ffd54f" />
        </g>
      `;
    } else {
      candleSvg = `
        <g>
          <rect x="${cx + 10}" y="${cy - 28}" width="16" height="36" rx="4" fill="${candleColor.body}" stroke="${candleColor.stroke}" stroke-width="1.5" />
          <line x1="${cx + 18}" y1="${cy - 28}" x2="${cx + 18}" y2="${cy - 36}" stroke="#212121" stroke-width="2" />
          ${this.generateFlame(cx + 18, cy - 44, 12, 22)}
        </g>
      `;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 300" width="${width}" height="${height}" class="krathong-svg">
        ${defs}
        ${shadow}
        ${baseSvg}
        ${petalSvg}
        ${flowerSvg}
        ${photoSvg}
        ${incenseSvg}
        ${candleSvg}
        ${decorSvg}
      </svg>
    `;
  }

  // =========================================================================
  // 15 DISTINCT KRATHONG BASE SHAPES
  // =========================================================================
  generateBaseShape(baseId, cx, cy) {
    switch (baseId) {
      // 1. กระทงรูปหัวใจคู่รัก (Heart of Love)
      case 'heart_love':
        return `
          <g>
            <!-- Giant 3D Romantic Folded Heart -->
            <path d="M ${cx} ${cy + 48} C ${cx - 70} ${cy + 42} ${cx - 105} ${cy + 12} ${cx - 105} ${cy - 12} C ${cx - 105} ${cy - 40} ${cx - 55} ${cy - 48} ${cx} ${cy - 12} C ${cx + 55} ${cy - 48} ${cx + 105} ${cy - 40} ${cx + 105} ${cy - 12} C ${cx + 105} ${cy + 12} ${cx + 70} ${cy + 42} ${cx} ${cy + 48} Z"
                  fill="#880e4f" />
            <path d="M ${cx} ${cy + 42} C ${cx - 65} ${cy + 36} ${cx - 98} ${cy + 10} ${cx - 98} ${cy - 10} C ${cx - 98} ${cy - 36} ${cx - 50} ${cy - 44} ${cx} ${cy - 10} C ${cx + 50} ${cy - 44} ${cx + 98} ${cy - 36} ${cx + 98} ${cy - 10} C ${cx + 98} ${cy + 10} ${cx + 65} ${cy + 36} ${cx} ${cy + 42} Z"
                  fill="url(#heart-base-grad)" stroke="#ffd700" stroke-width="2.5" />
            <!-- Inner velvet rose heart deck -->
            <path d="M ${cx} ${cy + 34} C ${cx - 55} ${cy + 28} ${cx - 82} ${cy + 8} ${cx - 82} ${cy - 8} C ${cx - 82} ${cy - 30} ${cx - 40} ${cy - 36} ${cx} ${cy - 8} C ${cx + 40} ${cy - 36} ${cx + 82} ${cy - 30} ${cx + 82} ${cy - 8} C ${cx + 82} ${cy + 8} ${cx + 55} ${cy + 28} ${cx} ${cy + 34} Z"
                  fill="#ff4081" opacity="0.9" />
            <!-- Heart rim golden studs -->
            <circle cx="${cx - 85}" cy="${cy - 8}" r="2.5" fill="#ffe57f" />
            <circle cx="${cx + 85}" cy="${cy - 8}" r="2.5" fill="#ffe57f" />
            <circle cx="${cx - 50}" cy="${cy + 28}" r="2.5" fill="#ffe57f" />
            <circle cx="${cx + 50}" cy="${cy + 28}" r="2.5" fill="#ffe57f" />
            <circle cx="${cx}" cy="${cy + 40}" r="3" fill="#ffe57f" />
          </g>
        `;

      // 2. กระทงเรือสุพรรณหงส์ (Royal Swan Boat)
      case 'royal_swan':
        return `
          <g>
            <!-- Royal Swan Boat Hull -->
            <path d="M ${cx - 105} ${cy + 15} C ${cx - 80} ${cy + 44} ${cx + 80} ${cy + 44} ${cx + 105} ${cy + 15} C ${cx + 95} ${cy + 35} ${cx - 95} ${cy + 35} ${cx - 105} ${cy + 15} Z" fill="#b78103" />
            <path d="M ${cx - 110} ${cy + 15} Q ${cx} ${cy + 48} ${cx + 110} ${cy + 15} Q ${cx} ${cy + 30} ${cx - 110} ${cy + 15} Z" fill="url(#gold-royal-grad)" stroke="#ff8f00" stroke-width="2" />
            <!-- Inner deck for flowers -->
            <ellipse cx="${cx}" cy="${cy + 22}" rx="82" ry="20" fill="#2e7d32" stroke="#ffd700" stroke-width="1.5" />
            
            <!-- Swan Neck & Head (Front Left) -->
            <path d="M ${cx - 88} ${cy + 18} C ${cx - 110} ${cy - 10} ${cx - 115} ${cy - 48} ${cx - 95} ${cy - 60} C ${cx - 78} ${cy - 52} ${cx - 88} ${cy - 20} ${cx - 72} ${cy + 18} Z" fill="url(#gold-royal-grad)" stroke="#ff8f00" stroke-width="1.5" />
            <!-- Swan Head Crown / Crest -->
            <polygon points="${cx - 98},${cy - 64} ${cx - 92},${cy - 76} ${cx - 88},${cy - 63}" fill="#ffd700" stroke="#d50000" stroke-width="1" />
            <!-- Swan Beak -->
            <polygon points="${cx - 102},${cy - 56} ${cx - 116},${cy - 52} ${cx - 100},${cy - 48}" fill="#ff3d00" stroke="#b71c1c" stroke-width="0.8" />
            <!-- Ruby Eye -->
            <circle cx="${cx - 95}" cy="${cy - 55}" r="2" fill="#d50000" />
            <circle cx="${cx - 95}" cy="${cy - 55}" r="0.8" fill="#ffffff" />
            
            <!-- Swan Tail Feathers (Back Right) -->
            <path d="M ${cx + 85} ${cy + 16} C ${cx + 105} ${cy} ${cx + 118} ${cy - 30} ${cx + 108} ${cy - 42} C ${cx + 98} ${cy - 20} ${cx + 92} ${cy + 5} ${cx + 78} ${cy + 18} Z" fill="url(#gold-royal-grad)" stroke="#ff8f00" stroke-width="1.5" />
            <path d="M ${cx + 94} ${cy + 12} C ${cx + 112} ${cy - 8} ${cx + 124} ${cy - 25} ${cx + 116} ${cy - 35} Z" fill="#ffe57f" />
          </g>
        `;

      // 3. กระทงดาวประกายแสง (Twinkling Star 8-point)
      case 'golden_star':
        return `
          <g>
            <!-- 8-pointed layered golden star base -->
            ${this.generateStarPoints(cx, cy + 24, 8, 105, 68, 'url(#gold-royal-grad)', '#b78103')}
            ${this.generateStarPoints(cx, cy + 22, 8, 86, 55, '#ffe57f', '#ffd700')}
            <ellipse cx="${cx}" cy="${cy + 22}" rx="68" ry="24" fill="#2e7d32" stroke="#ffd700" stroke-width="2" />
            <!-- Sparkles -->
            <circle cx="${cx - 80}" cy="${cy + 22}" r="3" fill="#ffffff" filter="url(#flame-glow)" />
            <circle cx="${cx + 80}" cy="${cy + 22}" r="3" fill="#ffffff" filter="url(#flame-glow)" />
          </g>
        `;

      // 4. กระทงบัวหลวงชมพูบาน (Royal Pink Lotus Blossom)
      case 'lotus':
        return `
          <g>
            <!-- Outer blooming lotus petals -->
            ${this.generateLotusBaseRing(cx, cy + 28, 14, 102)}
            <!-- Inner blooming petal ring -->
            ${this.generateLotusBaseRing(cx, cy + 24, 10, 82)}
            <!-- Lotus Seed Pod Center disc -->
            <ellipse cx="${cx}" cy="${cy + 22}" rx="64" ry="22" fill="#cddc39" stroke="#8bc34a" stroke-width="2" />
            <circle cx="${cx - 25}" cy="${cy + 20}" r="2" fill="#33691e" />
            <circle cx="${cx + 25}" cy="${cy + 20}" r="2" fill="#33691e" />
            <circle cx="${cx}" cy="${cy + 25}" r="2.5" fill="#33691e" />
            <circle cx="${cx - 12}" cy="${cy + 16}" r="2" fill="#33691e" />
            <circle cx="${cx + 12}" cy="${cy + 16}" r="2" fill="#33691e" />
          </g>
        `;

      // 5. กระทงขนมปังน้องเต่าน้อย (Lucky Turtle Bread)
      case 'bread_turtle':
        return `
          <g>
            <!-- 4 Flippers -->
            <ellipse cx="${cx - 88}" cy="${cy + 12}" rx="24" ry="14" fill="#d7ccc8" stroke="#8d6e63" stroke-width="1.5" transform="rotate(-25 ${cx-88} ${cy+12})" />
            <ellipse cx="${cx + 88}" cy="${cy + 12}" rx="24" ry="14" fill="#d7ccc8" stroke="#8d6e63" stroke-width="1.5" transform="rotate(25 ${cx+88} ${cy+12})" />
            <ellipse cx="${cx - 78}" cy="${cy + 42}" rx="20" ry="12" fill="#bcaaa4" stroke="#8d6e63" stroke-width="1.5" />
            <ellipse cx="${cx + 78}" cy="${cy + 42}" rx="20" ry="12" fill="#bcaaa4" stroke="#8d6e63" stroke-width="1.5" />
            <!-- Head -->
            <circle cx="${cx}" cy="${cy - 36}" r="24" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2" />
            <circle cx="${cx - 8}" cy="${cy - 42}" r="3.5" fill="#3e2723" />
            <circle cx="${cx + 8}" cy="${cy - 42}" r="3.5" fill="#3e2723" />
            <circle cx="${cx - 7}" cy="${cy - 43}" r="1" fill="#ffffff" />
            <circle cx="${cx + 9}" cy="${cy - 43}" r="1" fill="#ffffff" />
            <circle cx="${cx - 15}" cy="${cy - 34}" r="4" fill="#ffab91" opacity="0.6" />
            <circle cx="${cx + 15}" cy="${cy - 34}" r="4" fill="#ffab91" opacity="0.6" />
            <path d="M ${cx - 6} ${cy - 30} Q ${cx} ${cy - 25} ${cx + 6} ${cy - 30}" stroke="#5d4037" stroke-width="2.5" fill="none" stroke-linecap="round" />
            <!-- Shell Body -->
            <ellipse cx="${cx}" cy="${cy + 26}" rx="96" ry="38" fill="url(#bread-grad)" stroke="#8d6e63" stroke-width="2.5" />
            <!-- Bread Texture Disc -->
            <ellipse cx="${cx}" cy="${cy + 20}" rx="86" ry="30" fill="#ffe0b2" opacity="0.95" />
            <!-- Hex Shell pattern stitches -->
            <polygon points="${cx},${cy+6} ${cx+32},${cy+14} ${cx+32},${cy+32} ${cx},${cy+40} ${cx-32},${cy+32} ${cx-32},${cy+14}" fill="none" stroke="#8d6e63" stroke-width="2" stroke-dasharray="4,2" />
          </g>
        `;

      // 6. กระทงขนมปังน้องแมว (Kawaii Kitty Bread)
      case 'bread_cat':
        return `
          <g>
            <!-- Cat Bread Body -->
            <ellipse cx="${cx}" cy="${cy + 26}" rx="96" ry="36" fill="url(#bread-grad)" stroke="#8d6e63" stroke-width="2.5" />
            <ellipse cx="${cx}" cy="${cy + 20}" rx="88" ry="28" fill="#ffe0b2" />
            
            <!-- Cat Ears (Left & Right) -->
            <polygon points="${cx - 75},${cy + 8} ${cx - 95},${cy - 20} ${cx - 55},${cy - 5}" fill="#d7ccc8" stroke="#8d6e63" stroke-width="2" />
            <polygon points="${cx - 75},${cy + 4} ${cx - 88},${cy - 14} ${cx - 60},${cy - 3}" fill="#ff80ab" />
            <polygon points="${cx + 75},${cy + 8} ${cx + 95},${cy - 20} ${cx + 55},${cy - 5}" fill="#d7ccc8" stroke="#8d6e63" stroke-width="2" />
            <polygon points="${cx + 75},${cy + 4} ${cx + 88},${cy - 14} ${cx + 60},${cy - 3}" fill="#ff80ab" />
            
            <!-- Cute Cat Paws resting on the front -->
            <ellipse cx="${cx - 45}" cy="${cy + 38}" rx="14" ry="9" fill="#ffffff" stroke="#8d6e63" stroke-width="1.5" />
            <ellipse cx="${cx + 45}" cy="${cy + 38}" rx="14" ry="9" fill="#ffffff" stroke="#8d6e63" stroke-width="1.5" />
            <!-- Cat Face Features -->
            <circle cx="${cx - 15}" cy="${cy + 4}" r="3" fill="#3e2723" />
            <circle cx="${cx + 15}" cy="${cy + 4}" r="3" fill="#3e2723" />
            <circle cx="${cx - 24}" cy="${cy + 10}" r="5" fill="#ff80ab" opacity="0.6" />
            <circle cx="${cx + 24}" cy="${cy + 10}" r="5" fill="#ff80ab" opacity="0.6" />
            <!-- Nose & mouth -->
            <polygon points="${cx - 3},${cy + 8} ${cx + 3},${cy + 8} ${cx},${cy + 11}" fill="#ff4081" />
            <path d="M ${cx - 4} ${cy + 12} Q ${cx - 2} ${cy + 16} ${cx} ${cy + 13} Q ${cx + 2} ${cy + 16} ${cx + 4} ${cy + 12}" stroke="#3e2723" stroke-width="1.5" fill="none" />
            <!-- Whiskers -->
            <line x1="${cx - 40}" y1="${cy + 7}" x2="${cx - 25}" y2="${cy + 8}" stroke="#5d4037" stroke-width="1.5" />
            <line x1="${cx - 40}" y1="${cy + 14}" x2="${cx - 26}" y2="${cy + 12}" stroke="#5d4037" stroke-width="1.5" />
            <line x1="${cx + 40}" y1="${cy + 7}" x2="${cx + 25}" y2="${cy + 8}" stroke="#5d4037" stroke-width="1.5" />
            <line x1="${cx + 40}" y1="${cy + 14}" x2="${cx + 26}" y2="${cy + 12}" stroke="#5d4037" stroke-width="1.5" />
          </g>
        `;

      // 7. กระทงขนมปังเป็ดเหลือง (Happy Yellow Duck)
      case 'bread_duck':
        return `
          <g>
            <!-- Duck Body -->
            <ellipse cx="${cx}" cy="${cy + 26}" rx="96" ry="36" fill="#fbc02d" stroke="#f57f17" stroke-width="2.5" />
            <ellipse cx="${cx}" cy="${cy + 20}" rx="86" ry="28" fill="#fff59d" />
            <!-- Duck Tail (Back Right) -->
            <polygon points="${cx + 80},${cy + 15} ${cx + 108},${cy - 2} ${cx + 70},${cy + 30}" fill="#fbc02d" stroke="#f57f17" stroke-width="1.5" />
            <!-- Duck Head (Front Left) -->
            <circle cx="${cx - 65}" cy="${cy - 8}" r="24" fill="#ffee58" stroke="#f57f17" stroke-width="2" />
            <!-- Big Cute Eye -->
            <circle cx="${cx - 72}" cy="${cy - 12}" r="5" fill="#212121" />
            <circle cx="${cx - 74}" cy="${cy - 14}" r="2" fill="#ffffff" />
            <circle cx="${cx - 60}" cy="${cy - 4}" r="5" fill="#ffab91" opacity="0.7" />
            <!-- Orange Duck Beak -->
            <ellipse cx="${cx - 92}" cy="${cy - 6}" rx="12" ry="6" fill="#ff6d00" stroke="#d84315" stroke-width="1.5" />
            <!-- Wing detail -->
            <path d="M ${cx - 15} ${cy + 18} C ${cx + 20} ${cy + 5} ${cx + 50} ${cy + 15} ${cx + 35} ${cy + 35} Z" fill="#ffd54f" stroke="#f57f17" stroke-width="1.5" />
          </g>
        `;

      // 8. กระทงกะลามะพร้าวเทียนหอม (Aromatic Coconut Shell with Garland)
      case 'coconut_shell':
        return `
          <g>
            <!-- Coconut Shell Body -->
            <ellipse cx="${cx}" cy="${cy + 36}" rx="95" ry="36" fill="url(#coconut-grad)" stroke="#271410" stroke-width="3" />
            <!-- Coconut White Rim -->
            <ellipse cx="${cx}" cy="${cy + 26}" rx="88" ry="30" fill="#ffffff" stroke="#d7ccc8" stroke-width="2" />
            <!-- Golden Fragrant Candle Wax Pool -->
            <ellipse cx="${cx}" cy="${cy + 25}" rx="80" ry="24" fill="#fff59d" stroke="#fbc02d" stroke-width="2" />
            <ellipse cx="${cx}" cy="${cy + 25}" rx="68" ry="18" fill="#fff9c4" />
            <!-- Jasmine Wreath on Coconut Rim -->
            ${this.generateJasmineBed(cx, cy + 20)}
          </g>
        `;

      // 9. กระทงโคนไอศกรีมพาสเทล (Pastel Ice Cream Cones)
      case 'ice_cream':
        return `
          <g>
            <!-- 8 Cones & Scoops surrounding the base -->
            ${this.generateIceCreamBase(cx, cy + 28)}
            <!-- Center Waffle Disc -->
            <ellipse cx="${cx}" cy="${cy + 24}" rx="78" ry="26" fill="url(#cone-grad)" stroke="#d7ccc8" stroke-width="2" />
            <!-- Center Strawberry frosting pool -->
            <ellipse cx="${cx}" cy="${cy + 22}" rx="64" ry="18" fill="#f8bbd0" stroke="#f48fb1" stroke-width="1.5" />
          </g>
        `;

      // 10. กระทงคริสตัลแก้วใส (Glowing Crystal Lantern)
      case 'crystal_glow':
        return `
          <g>
            <!-- Outer Prismatic Glass Hexagon -->
            <ellipse cx="${cx}" cy="${cy + 34}" rx="102" ry="34" fill="url(#crystal-grad)" stroke="#e0f7fa" stroke-width="3" opacity="0.9" />
            <ellipse cx="${cx}" cy="${cy + 24}" rx="88" ry="28" fill="rgba(255, 255, 255, 0.45)" stroke="#80deea" stroke-width="2" />
            <!-- Facet Lines -->
            <polygon points="${cx-75},${cy+22} ${cx-40},${cy+8} ${cx+40},${cy+8} ${cx+75},${cy+22} ${cx+40},${cy+38} ${cx-40},${cy+38}" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" />
            <line x1="${cx-75}" y1="${cy+22}" x2="${cx+75}" y2="${cy+22}" stroke="rgba(0,229,255,0.6)" stroke-width="1" />
          </g>
        `;

      // 11. กระทงมงกุฎทองคำ (Royal Thai Crown)
      case 'royal_crown':
        return `
          <g>
            <!-- Golden Crown Rim Tier 1 -->
            <ellipse cx="${cx}" cy="${cy + 36}" rx="100" ry="34" fill="#b78103" />
            <ellipse cx="${cx}" cy="${cy + 28}" rx="96" ry="30" fill="url(#gold-royal-grad)" stroke="#ffd700" stroke-width="2" />
            <!-- Crown Points Tier -->
            <polygon points="${cx-85},${cy+18} ${cx-70},${cy-2} ${cx-55},${cy+18} ${cx-35},${cy-10} ${cx-15},${cy+18} ${cx},${cy-18} ${cx+15},${cy+18} ${cx+35},${cy-10} ${cx+55},${cy+18} ${cx+70},${cy-2} ${cx+85},${cy+18}" fill="url(#gold-royal-grad)" stroke="#ff8f00" stroke-width="2" />
            <!-- Deck & Jewels -->
            <ellipse cx="${cx}" cy="${cy + 22}" rx="78" ry="24" fill="#880e4f" stroke="#ffd700" stroke-width="2" />
            <circle cx="${cx - 70}" cy="${cy - 2}" r="3" fill="#d50000" />
            <circle cx="${cx - 35}" cy="${cy - 10}" r="3.5" fill="#00e5ff" />
            <circle cx="${cx}" cy="${cy - 18}" r="4.5" fill="#d50000" filter="url(#flame-glow)" />
            <circle cx="${cx + 35}" cy="${cy - 10}" r="3.5" fill="#00e5ff" />
            <circle cx="${cx + 70}" cy="${cy - 2}" r="3" fill="#d50000" />
          </g>
        `;

      // 12. กระทงใบบัวธรรมชาติ (Victoria Waterlily Pad)
      case 'lotus_leaf':
        return `
          <g>
            <!-- Giant Upturned Lotus Pad -->
            <ellipse cx="${cx}" cy="${cy + 36}" rx="102" ry="36" fill="#1b5e20" stroke="#004d40" stroke-width="2" />
            <!-- Upturned Rim wall -->
            <ellipse cx="${cx}" cy="${cy + 28}" rx="100" ry="34" fill="url(#lilypad-grad)" stroke="#a5d6a7" stroke-width="3" />
            <ellipse cx="${cx}" cy="${cy + 22}" rx="92" ry="28" fill="#43a047" />
            <!-- Leaf Veins -->
            <path d="M ${cx} ${cy+22} L ${cx-75} ${cy+12} M ${cx} ${cy+22} L ${cx+75} ${cy+12} M ${cx} ${cy+22} L ${cx-50} ${cy+38} M ${cx} ${cy+22} L ${cx+50} ${cy+38} M ${cx} ${cy+22} L ${cx-30} ${cy+2} M ${cx} ${cy+22} L ${cx+30} ${cy+2}" stroke="#81c784" stroke-width="1.5" opacity="0.7" />
            <!-- Water Droplets -->
            <circle cx="${cx - 40}" cy="${cy + 18}" r="4" fill="rgba(255,255,255,0.7)" />
            <circle cx="${cx + 45}" cy="${cy + 26}" r="3" fill="rgba(255,255,255,0.7)" />
            <circle cx="${cx - 10}" cy="${cy + 32}" r="2.5" fill="rgba(255,255,255,0.7)" />
          </g>
        `;

      // 13. กระทงขนมปังโดนัทสายรุ้ง (Sweet Rainbow Donut)
      case 'donut_sweet':
        return `
          <g>
            <!-- Baked Donut Dough Base -->
            <ellipse cx="${cx}" cy="${cy + 34}" rx="100" ry="34" fill="#d7ccc8" stroke="#8d6e63" stroke-width="2" />
            <ellipse cx="${cx}" cy="${cy + 28}" rx="98" ry="32" fill="#ffe0b2" stroke="#ffb74d" stroke-width="2" />
            <!-- Wavy Strawberry Glaze -->
            <ellipse cx="${cx}" cy="${cy + 22}" rx="90" ry="26" fill="url(#donut-glaze)" stroke="#ff4081" stroke-width="2" />
            <!-- Center Donut Hole (Water showthrough) -->
            <ellipse cx="${cx}" cy="${cy + 22}" rx="28" ry="12" fill="#15264f" stroke="#ffb74d" stroke-width="2" />
            <!-- Colorful Sprinkles -->
            <rect x="${cx - 65}" y="${cy + 14}" width="8" height="3" rx="1.5" fill="#ffeb3b" transform="rotate(25 ${cx-65} ${cy+14})" />
            <rect x="${cx - 45}" y="${cy + 26}" width="8" height="3" rx="1.5" fill="#00e5ff" transform="rotate(-35 ${cx-45} ${cy+26})" />
            <rect x="${cx + 45}" y="${cy + 12}" width="8" height="3" rx="1.5" fill="#76ff03" transform="rotate(45 ${cx+45} ${cy+12})" />
            <rect x="${cx + 60}" y="${cy + 25}" width="8" height="3" rx="1.5" fill="#ffffff" transform="rotate(-15 ${cx+60} ${cy+25})" />
            <rect x="${cx - 20}" y="${cy + 30}" width="8" height="3" rx="1.5" fill="#ffeb3b" transform="rotate(10 ${cx-20} ${cy+30})" />
            <rect x="${cx + 25}" y="${cy + 32}" width="8" height="3" rx="1.5" fill="#ff4081" transform="rotate(-40 ${cx+25} ${cy+32})" />
          </g>
        `;

      // 14. กระทงโคมประทีปล้านนา (Lanna Paper Lantern Float)
      case 'lanna_lantern':
        return `
          <g>
            <!-- Hexagonal wooden float base -->
            <polygon points="${cx-95},${cy+28} ${cx-50},${cy+48} ${cx+50},${cy+48} ${cx+95},${cy+28} ${cx+50},${cy+8} ${cx-50},${cy+8}" fill="#5d4037" stroke="#3e2723" stroke-width="3" />
            <!-- Glowing Translucent Lantern Panels -->
            <polygon points="${cx-85},${cy+24} ${cx-45},${cy+42} ${cx+45},${cy+42} ${cx+85},${cy+24} ${cx+45},${cy+6} ${cx-45},${cy+6}" fill="url(#lanna-glow)" stroke="#ffd700" stroke-width="2" filter="url(#flame-glow)" />
            <!-- Inner Deck -->
            <ellipse cx="${cx}" cy="${cy + 22}" rx="68" ry="22" fill="#fff9c4" stroke="#ff8f00" stroke-width="1.5" />
            <!-- Hanging Golden Tassels -->
            <line x1="${cx - 95}" y1="${cy + 28}" x2="${cx - 95}" y2="${cy + 48}" stroke="#ffd700" stroke-width="2" />
            <circle cx="${cx - 95}" cy="${cy + 48}" r="3" fill="#ff3d00" />
            <line x1="${cx + 95}" y1="${cy + 28}" x2="${cx + 95}" y2="${cy + 48}" stroke="#ffd700" stroke-width="2" />
            <circle cx="${cx + 95}" cy="${cy + 48}" r="3" fill="#ff3d00" />
          </g>
        `;

      // 15. กระทงใบตองวิจิตรดั้งเดิม (Traditional Banana Leaf Masterpiece)
      default:
      case 'banana_leaf':
        return `
          <g>
            <!-- Layered Banana Trunk Base Cylinder -->
            <ellipse cx="${cx}" cy="${cy + 38}" rx="102" ry="34" fill="#1b5e20" stroke="#004d40" stroke-width="2" />
            <!-- Folded Banana Leaves Wall Rim -->
            ${this.generateFoldedLeaves(cx, cy + 28, 14, 102, '#388e3c', '#1b5e20')}
            <!-- Banana Trunk Bark Rim -->
            <ellipse cx="${cx}" cy="${cy + 28}" rx="96" ry="30" fill="url(#banana-leaf)" stroke="#81c784" stroke-width="2" />
            <!-- Clean Green Leaf Disc Deck -->
            <ellipse cx="${cx}" cy="${cy + 22}" rx="86" ry="25" fill="url(#banana-disc)" stroke="#66bb6a" stroke-width="1.5" />
            <!-- Wooden Pins Stitches -->
            <circle cx="${cx - 70}" cy="${cy + 22}" r="2" fill="#ffd54f" />
            <circle cx="${cx + 70}" cy="${cy + 22}" r="2" fill="#ffd54f" />
            <circle cx="${cx}" cy="${cy + 38}" r="2" fill="#ffd54f" />
          </g>
        `;
    }
  }

  // --- CANDLE FLAME WITH ANIMATION ---
  generateFlame(fx, fy, w, h) {
    return `
      <!-- Candle Flame & Dynamic Glow -->
      <g>
        <ellipse cx="${fx}" cy="${fy + 4}" rx="${w * 2}" ry="${h * 1.5}" fill="url(#candle-halo)" filter="url(#flame-glow)" opacity="0.85">
          <animate attributeName="rx" values="${w * 1.9};${w * 2.2};${w * 1.9}" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="ry" values="${h * 1.4};${h * 1.6};${h * 1.4}" dur="1.2s" repeatCount="indefinite" />
        </ellipse>
        
        <path d="M ${fx} ${fy - h/2} C ${fx + w} ${fy} ${fx + w*0.8} ${fy + h/2} ${fx} ${fy + h/2} C ${fx - w*0.8} ${fy + h/2} ${fx - w} ${fy} ${fx} ${fy - h/2} Z"
              fill="#ff9800" filter="url(#flame-glow)">
          <animate attributeName="d" dur="0.8s" repeatCount="indefinite"
            values="
              M ${fx} ${fy - h/2} C ${fx + w} ${fy} ${fx + w*0.8} ${fy + h/2} ${fx} ${fy + h/2} C ${fx - w*0.8} ${fy + h/2} ${fx - w} ${fy} ${fx} ${fy - h/2} Z;
              M ${fx + 2} ${fy - h/2 - 2} C ${fx + w*1.1} ${fy} ${fx + w*0.7} ${fy + h/2} ${fx} ${fy + h/2} C ${fx - w*0.7} ${fy + h/2} ${fx - w*0.9} ${fy - 2} ${fx + 2} ${fy - h/2 - 2} Z;
              M ${fx} ${fy - h/2} C ${fx + w} ${fy} ${fx + w*0.8} ${fy + h/2} ${fx} ${fy + h/2} C ${fx - w*0.8} ${fy + h/2} ${fx - w} ${fy} ${fx} ${fy - h/2} Z
            " />
        </path>

        <path d="M ${fx} ${fy - h/4} C ${fx + w*0.5} ${fy} ${fx + w*0.4} ${fy + h/2 - 2} ${fx} ${fy + h/2 - 2} C ${fx - w*0.4} ${fy + h/2 - 2} ${fx - w*0.5} ${fy} ${fx} ${fy - h/4} Z"
              fill="#ffffff" />
      </g>
    `;
  }

  // --- PHOTO LAYER WITH FRAMES ---
  generatePhotoLayer(cx, cy, photo) {
    const px = cx + photo.x;
    const py = cy + photo.y;
    const rot = photo.rotate || 0;
    const sc = photo.scale || 1.0;

    let frameHtml = '';

    if (photo.frame === 'heart') {
      frameHtml = `
        <!-- Heart Frame with Bamboo Pin -->
        <g transform="translate(${px}, ${py}) rotate(${rot}) scale(${sc})">
          <line x1="0" y1="20" x2="0" y2="70" stroke="#8d6e63" stroke-width="4" stroke-linecap="round" />
          <path d="M 0 -22 C -18 -42 -40 -15 -40 8 C -40 32 -10 46 0 62 C 10 46 40 32 40 8 C 40 -15 18 -42 0 -22 Z"
                fill="none" stroke="#ffd700" stroke-width="12" opacity="0.4" filter="url(#flame-glow)" />
          <path d="M 0 -22 C -18 -42 -40 -15 -40 8 C -40 32 -10 46 0 62 C 10 46 40 32 40 8 C 40 -15 18 -42 0 -22 Z"
                fill="#ff4081" stroke="#ffd700" stroke-width="4" />
          <g clip-path="url(#heart-clip)">
            <image href="${photo.dataUrl}" xlink:href="${photo.dataUrl}" x="-40" y="-35" width="80" height="95" preserveAspectRatio="xMidYMid slice" />
          </g>
          <circle cx="0" cy="62" r="3" fill="#ffe57f" />
        </g>
      `;
    } else if (photo.frame === 'polaroid') {
      frameHtml = `
        <g transform="translate(${px}, ${py}) rotate(${rot}) scale(${sc})">
          <line x1="0" y1="35" x2="0" y2="75" stroke="#8d6e63" stroke-width="4" stroke-linecap="round" />
          <rect x="-35" y="-45" width="70" height="85" rx="3" fill="#ffffff" stroke="#e0e0e0" stroke-width="1" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))" />
          <image href="${photo.dataUrl}" xlink:href="${photo.dataUrl}" x="-30" y="-40" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          <text x="0" y="32" font-family="'TH Sarabun PSK', 'TH Sarabun New', 'Sarabun', sans-serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#d81b60">Love You ❤️</text>
        </g>
      `;
    } else if (photo.frame === 'circle') {
      frameHtml = `
        <g transform="translate(${px}, ${py}) rotate(${rot}) scale(${sc})">
          <line x1="0" y1="20" x2="0" y2="70" stroke="#8d6e63" stroke-width="4" stroke-linecap="round" />
          <circle cx="0" cy="0" r="38" fill="none" stroke="#ff80ab" stroke-width="10" opacity="0.3" filter="url(#flame-glow)" />
          <circle cx="0" cy="0" r="34" fill="#ffffff" stroke="#ffd700" stroke-width="3" />
          <g clip-path="url(#circle-clip)">
            <image href="${photo.dataUrl}" xlink:href="${photo.dataUrl}" x="-34" y="-34" width="68" height="68" preserveAspectRatio="xMidYMid slice" />
          </g>
        </g>
      `;
    } else {
      frameHtml = `
        <g transform="translate(${px}, ${py}) rotate(${rot}) scale(${sc})">
          <line x1="0" y1="25" x2="0" y2="75" stroke="#8d6e63" stroke-width="4" stroke-linecap="round" />
          <rect x="-34" y="-34" width="68" height="68" fill="#fff8e1" stroke="#bcaaa4" stroke-dasharray="3,3" stroke-width="3" />
          <image href="${photo.dataUrl}" xlink:href="${photo.dataUrl}" x="-28" y="-28" width="56" height="56" preserveAspectRatio="xMidYMid slice" />
        </g>
      `;
    }

    return frameHtml;
  }

  // --- HELPER RENDERERS FOR BASES, PETALS, & FLOWERS ---
  generateStarPoints(cx, cy, count, outerR, innerR, fill, stroke) {
    let pts = [];
    for (let i = 0; i < count * 2; i++) {
      const angle = (i / (count * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * (r * 0.35);
      pts.push(`${x},${y}`);
    }
    return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
  }

  generateLotusBaseRing(cx, cy, count, radius) {
    let petals = '';
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const px = cx + Math.cos(angle) * radius * 0.95;
      const py = cy + Math.sin(angle) * (radius * 0.35);
      petals += `
        <ellipse cx="${px}" cy="${py}" rx="22" ry="14" fill="url(#lotus-petal-grad)" stroke="#ff4081" stroke-width="1"
          transform="rotate(${(angle * 180 / Math.PI) + 90} ${px} ${py})" />
      `;
    }
    return petals;
  }

  generateIceCreamBase(cx, cy) {
    let cones = '';
    const colors = ['#f48fb1', '#81d4fa', '#ffe082', '#a5d6a7', '#ce93d8'];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI;
      const px = cx + Math.cos(angle - Math.PI/2) * 85;
      const py = cy + Math.sin(angle - Math.PI/2) * 25 + 10;
      const color = colors[i % colors.length];
      cones += `
        <g transform="translate(${px}, ${py})">
          <circle cx="0" cy="-6" r="14" fill="${color}" stroke="#ffffff" stroke-width="1.5" />
          <polygon points="-12,0 12,0 0,22" fill="url(#cone-grad)" stroke="#d7ccc8" stroke-width="1" />
        </g>
      `;
    }
    return cones;
  }

  generateFoldedLeaves(cx, cy, count, radius, col1, col2) {
    let leaves = '';
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * (radius * 0.35);
      const rot = (angle * 180 / Math.PI) + 90;
      leaves += `
        <g transform="translate(${px}, ${py}) rotate(${rot})">
          <polygon points="0,-18 -14,10 14,10" fill="${col1}" stroke="${col2}" stroke-width="1.5" />
          <polygon points="0,-12 -8,10 8,10" fill="#a5d6a7" />
          <circle cx="0" cy="6" r="1.5" fill="#fbc02d" />
        </g>
      `;
    }
    return leaves;
  }

  generateSharpPetals(cx, cy, count, radius, col1, col2) {
    let items = '';
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * (radius * 0.35);
      const rot = (angle * 180 / Math.PI) + 90;
      items += `
        <polygon points="0,-22 -11,8 11,8" transform="translate(${px}, ${py}) rotate(${rot})" fill="${col1}" stroke="${col2}" stroke-width="1.5" />
      `;
    }
    return items;
  }

  generateGoldBorder(cx, cy, count, radius) {
    let items = '';
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * (radius * 0.35);
      items += `
        <circle cx="${px}" cy="${py}" r="6" fill="#ffd700" stroke="#ffab00" stroke-width="1.5" filter="url(#flame-glow)" />
      `;
    }
    return items;
  }

  generateRosePetalsRim(cx, cy, count, radius) {
    let items = '';
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * (radius * 0.35);
      const rot = (angle * 180 / Math.PI) + 90;
      items += `
        <ellipse cx="${px}" cy="${py}" rx="14" ry="10" fill="#e91e63" stroke="#880e4f" stroke-width="1" transform="rotate(${rot} ${px} ${py})" />
      `;
    }
    return items;
  }

  generateCrystalStars(cx, cy, count, radius) {
    let items = '';
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * (radius * 0.35);
      items += `
        <g transform="translate(${px}, ${py})">
          <polygon points="0,-8 2,-2 8,0 2,2 0,8 -2,2 -8,0 -2,-2" fill="#ffffff" filter="url(#flame-glow)" />
        </g>
      `;
    }
    return items;
  }

  // --- FLOWER BEDS ---
  generateMarigoldBed(cx, cy) {
    let out = '<g>';
    out += this.renderMarigoldFlower(cx, cy + 8, 30);
    out += this.renderMarigoldFlower(cx - 36, cy + 16, 20);
    out += this.renderMarigoldFlower(cx + 36, cy + 16, 20);
    out += this.renderMarigoldFlower(cx - 22, cy - 2, 18);
    out += this.renderMarigoldFlower(cx + 22, cy - 2, 18);
    out += '</g>';
    return out;
  }

  renderMarigoldFlower(x, y, size) {
    let petals = '';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = x + Math.cos(angle) * (size * 0.4);
      const py = y + Math.sin(angle) * (size * 0.3);
      petals += `<circle cx="${px}" cy="${py}" r="${size * 0.35}" fill="#ffb300" opacity="0.9" />`;
    }
    return `
      <g>
        <circle cx="${x}" cy="${y}" r="${size * 0.6}" fill="#ff8f00" />
        ${petals}
        <circle cx="${x}" cy="${y}" r="${size * 0.35}" fill="#fff59d" />
      </g>
    `;
  }

  generateLotusBed(cx, cy) {
    return `
      <g transform="translate(${cx}, ${cy + 6})">
        <ellipse cx="0" cy="0" rx="36" ry="18" fill="#f8bbd0" stroke="#ff4081" stroke-width="2" />
        <path d="M -30 0 C -20 -20 20 -20 30 0 C 15 15 -15 15 -30 0 Z" fill="#ff80ab" />
        <ellipse cx="0" cy="-4" rx="20" ry="10" fill="#ffffff" stroke="#ff4081" stroke-width="1" />
        <circle cx="0" cy="-4" r="6" fill="#ffd54f" />
      </g>
    `;
  }

  generateOrchidBed(cx, cy) {
    return `
      <g>
        ${this.renderOrchid(cx - 30, cy + 12, 18)}
        ${this.renderOrchid(cx + 30, cy + 12, 18)}
        ${this.renderOrchid(cx, cy + 4, 22)}
      </g>
    `;
  }

  renderOrchid(x, y, r) {
    return `
      <g transform="translate(${x}, ${y})">
        <circle cx="0" cy="-${r*0.6}" r="${r*0.5}" fill="#ba68c8" />
        <circle cx="-${r*0.6}" cy="${r*0.2}" r="${r*0.5}" fill="#ce93d8" />
        <circle cx="${r*0.6}" cy="${r*0.2}" r="${r*0.5}" fill="#ce93d8" />
        <ellipse cx="0" cy="${r*0.4}" rx="${r*0.6}" ry="${r*0.4}" fill="#ab47bc" />
        <circle cx="0" cy="0" r="${r*0.25}" fill="#fff59d" stroke="#fbc02d" stroke-width="1" />
      </g>
    `;
  }

  generateRoseBed(cx, cy) {
    return `
      <g>
        ${this.renderRose(cx - 26, cy + 10, 16, '#e53935')}
        ${this.renderRose(cx + 26, cy + 10, 16, '#ff4081')}
        ${this.renderRose(cx, cy + 6, 20, '#d81b60')}
      </g>
    `;
  }

  renderRose(x, y, r, color) {
    return `
      <g transform="translate(${x}, ${y})">
        <circle cx="0" cy="0" r="${r}" fill="${color}" />
        <circle cx="-2" cy="-2" r="${r*0.7}" fill="#b71c1c" opacity="0.6" />
        <path d="M -${r*0.5} 0 C -${r*0.3} -${r*0.6} ${r*0.3} -${r*0.6} ${r*0.5} 0 C 0 ${r*0.7} -${r*0.3} ${r*0.3} -${r*0.5} 0 Z" fill="#ffffff" opacity="0.3" />
      </g>
    `;
  }

  generateJasmineBed(cx, cy) {
    let out = '<g>';
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const jx = cx + Math.cos(angle) * 36;
      const jy = cy + Math.sin(angle) * 16 + 6;
      out += `
        <circle cx="${jx}" cy="${jy}" r="7" fill="#ffffff" stroke="#e0e0e0" stroke-width="1" />
        <circle cx="${jx}" cy="${jy}" r="3" fill="#fff9c4" />
      `;
    }
    out += `
      <circle cx="${cx}" cy="${cy + 6}" r="12" fill="#ffffff" stroke="#c8e6c9" stroke-width="1.5" />
      <circle cx="${cx}" cy="${cy + 6}" r="5" fill="#fff9c4" />
    </g>`;
    return out;
  }

  generateSunflowerBed(cx, cy) {
    return `
      <g transform="translate(${cx}, ${cy + 6})">
        ${this.renderSunflower(0, 0, 28)}
      </g>
    `;
  }

  renderSunflower(x, y, r) {
    let petals = '';
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * (r * 0.7);
      petals += `<ellipse cx="${px}" cy="${py}" rx="6" ry="12" fill="#fbc02d" stroke="#f57f17" stroke-width="0.5" transform="rotate(${(angle*180/Math.PI)+90} ${px} ${py})" />`;
    }
    return `
      <g transform="translate(${x}, ${y})">
        ${petals}
        <circle cx="0" cy="0" r="${r*0.5}" fill="#5d4037" stroke="#3e2723" stroke-width="2" />
        <circle cx="0" cy="0" r="${r*0.3}" fill="#3e2723" />
      </g>
    `;
  }

  generateMixedBed(cx, cy) {
    return `
      <g>
        ${this.renderMarigoldFlower(cx, cy + 8, 22)}
        ${this.renderRose(cx - 32, cy + 12, 14, '#e91e63')}
        ${this.renderOrchid(cx + 32, cy + 12, 14)}
        <circle cx="${cx - 15}" cy="${cy - 2}" r="6" fill="#ffffff" />
        <circle cx="${cx + 15}" cy="${cy - 2}" r="6" fill="#ffffff" />
      </g>
    `;
  }

  generateFairyLights(cx, cy, count, radius) {
    let lights = '';
    const colors = ['#ffeb3b', '#ff4081', '#00e5ff', '#76ff03', '#ffd700'];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * (radius * 0.35);
      const col = colors[i % colors.length];
      lights += `
        <circle cx="${px}" cy="${py}" r="4" fill="${col}" filter="url(#flame-glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="${1 + (i % 3) * 0.4}s" repeatCount="indefinite" />
        </circle>
      `;
    }
    return `<g>${lights}</g>`;
  }

  getCandleColor(candleType) {
    switch (candleType) {
      case 'pink_love':
        return { body: '#ff80ab', stroke: '#ff4081' };
      case 'white_scent':
        return { body: '#ffffff', stroke: '#cfd8dc' };
      case 'red_lucky':
        return { body: '#d32f2f', stroke: '#b71c1c' };
      case 'gold_sparkle':
        return { body: '#ffd700', stroke: '#ff8f00' };
      default:
        return { body: '#fbc02d', stroke: '#f57f17' };
    }
  }

  // Render to a DOM element container
  render(containerElement) {
    if (typeof containerElement === 'string') {
      containerElement = document.querySelector(containerElement);
    }
    if (containerElement) {
      containerElement.innerHTML = this.generateSVG();
    }
  }

  // Export config as JSON string (to send via Realtime to partner)
  exportConfig() {
    return JSON.parse(JSON.stringify(this.config));
  }

  // Import config from partner
  importConfig(newConfig) {
    Object.assign(this.config, newConfig);
  }
}

window.KrathongBuilder = KrathongBuilder;
