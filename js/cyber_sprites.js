// ============================================================================
// 2D GAME CHARACTER ILLUSTRATION ENGINE (CEL-SHADED HD VECTOR ART)
// High-definition 2D illustrated characters faithful to the Tech World theme:
// 1. Programador (Hoodie, Glasses, RGB Headset, Laptop Backpack, Mech-Keyboard Gun)
// 2. Testador QA (Inspector Cap, Targeting Monocle, Bug-Zapper Pack, Magnifying-Glass Laser Rifle)
// 3. Estagiário (Oversized Swinging Lanyard Badge, Spiky Caffeinated Hair, Sticky Notes, Espresso Cannon)
// ============================================================================

class TechHeroIllustrator {
  constructor() {
    this.ready = true;
    // Pre-rendered high-DPI portrait canvases for UI cards
    this.frames = {
      programmer: [null, null, null],
      tester: [null, null, null],
      intern: [null, null, null]
    };
    this.buildPortraits();
  }

  buildPortraits() {
    ['programmer', 'tester', 'intern'].forEach(charKey => {
      for (let pose = 0; pose < 3; pose++) {
        const cvs = document.createElement('canvas');
        cvs.width = 96;
        cvs.height = 96;
        const ctx = cvs.getContext('2d');
        const dummyPlayer = {
          charType: charKey,
          x: 29,
          y: 28,
          w: 38,
          h: 52,
          vx: pose === 1 ? 3 : 0,
          vy: 0,
          facing: 1,
          onGround: true,
          fireTimer: pose === 1 ? 10 : 0,
          starTimer: pose === 2 ? 100 : 0,
          hasDuckShield: pose === 2 && charKey === 'tester',
          invincibleTimer: 0
        };
        this.drawPlayer(ctx, dummyPlayer, pose * 450);
        this.frames[charKey][pose] = cvs;
      }
    });
  }

  drawPlayer(ctx, player, time) {
    const charKey = player.charType || 'programmer';
    ctx.save();

    // Blink on damage i-frames
    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    const footX = Math.round(player.x + player.w / 2);
    const footY = Math.round(player.y + player.h);

    const isMoving = Math.abs(player.vx) > 0.35;
    const isShooting = player.fireTimer > 2;
    const isUlt = player.starTimer > 0;

    const walkCycle = isMoving && player.onGround ? Math.sin(time * 0.022) : 0;
    const bobY = isMoving && player.onGround
      ? Math.abs(Math.sin(time * 0.022)) * 3.5
      : Math.sin(time * 0.006) * 1.2;

    // 1. ULTIMATE / STAR OVERCLOCK AURA
    if (isUlt) {
      const hue = (time * 0.5) % 360;
      ctx.save();
      const grad = ctx.createRadialGradient(footX, footY - 28, 6, footX, footY - 28, 44);
      grad.addColorStop(0, `hsla(${hue}, 100%, 65%, 0.45)`);
      grad.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(footX, footY - 28, 44, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(footX, footY - 28, 36 + Math.sin(time * 0.02) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. GROUND SHADOW
    if (player.onGround) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(footX, footY, 18, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.translate(footX, footY - bobY);
    ctx.scale(player.facing, 1);

    // Delegate to the specific character's 2D Cel-Shaded Illustration
    if (charKey === 'programmer') {
      this.drawProgrammer(ctx, time, walkCycle, isShooting, isUlt, player);
    } else if (charKey === 'tester') {
      this.drawTesterQA(ctx, time, walkCycle, isShooting, isUlt, player);
    } else {
      this.drawIntern(ctx, time, walkCycle, isShooting, isUlt, player);
    }

    // 3. ORBITING RUBBER DUCK DEBUGGING SHIELD
    if (player.hasDuckShield) {
      this.drawOrbitingDuck(ctx, time);
    }

    ctx.restore();
    return true;
  }

  // ==========================================================================
  // 1. PROGRAMADOR (Fullstack Dev: Hoodie, Glasses, RGB Headset, Mech Keyboard)
  // ==========================================================================
  drawProgrammer(ctx, time, walk, isShooting, isUlt) {
    const INK = '#121722';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // --- A. BACKPACK WITH SILVER LAPTOP STICKING OUT ---
    ctx.save();
    ctx.fillStyle = '#263238';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-21, -38, 12, 22, 4);
    ctx.fill();
    ctx.stroke();

    // Silver MacBook/Laptop peeking out of backpack top
    ctx.save();
    ctx.rotate(-0.18);
    ctx.fillStyle = '#cfd8dc';
    ctx.beginPath();
    ctx.roundRect(-14, -48, 10, 14, 2);
    ctx.fill();
    ctx.stroke();
    // Glowing cyan code sticker on laptop
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(-9, -43, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();

    // --- B. LEGS (Dark Denim Jeans & Cyan/White Sneakers) ---
    const lSwing = walk * 7;
    const rSwing = -walk * 7;

    // Left Leg
    this.drawLegAndSneaker(ctx, -10 + lSwing, -16, '#1a2533', '#00b0ff', '#ffffff', INK);
    // Right Leg
    this.drawLegAndSneaker(ctx, 2 + rSwing, -16, '#243447', '#00e5ff', '#ffffff', INK);

    // --- C. TORSO (Cobalt Developer Hoodie with "</>" Logo & Kangaroo Pocket) ---
    const hoodieGrad = ctx.createLinearGradient(0, -39, 0, -14);
    hoodieGrad.addColorStop(0, '#1e88e5');
    hoodieGrad.addColorStop(1, '#0d47a1');
    ctx.fillStyle = hoodieGrad;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-14, -38, 28, 24, 7);
    ctx.fill();
    ctx.stroke();

    // Hoodie Specular Rim Highlight on Shoulder
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath();
    ctx.roundRect(-12, -36, 10, 18, 4);
    ctx.fill();

    // Kangaroo Pocket seam
    ctx.strokeStyle = 'rgba(13, 35, 68, 0.7)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-9, -15);
    ctx.lineTo(-6, -21);
    ctx.lineTo(6, -21);
    ctx.lineTo(9, -15);
    ctx.stroke();

    // Glowing "</>" Chest Print
    ctx.fillStyle = '#00ffff';
    ctx.font = '900 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('</>', 1, -25);

    // White Hoodie Drawstrings
    ctx.strokeStyle = '#eceff1';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-3, -36);
    ctx.lineTo(-4, -29);
    ctx.moveTo(4, -36);
    ctx.lineTo(5, -29);
    ctx.stroke();

    // --- D. HEAD, MESSY HAIR, GEEK GLASSES & RGB GAMING HEADSET ---
    ctx.save();
    // Head Base
    ctx.fillStyle = '#ffcfb3';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-13, -61, 26, 24, 9);
    ctx.fill();
    ctx.stroke();

    // Cheek shadow & light stubble (Dev who coded all night)
    ctx.fillStyle = '#ebae8d';
    ctx.beginPath();
    ctx.roundRect(-11, -44, 22, 6, 4);
    ctx.fill();

    // Messy Dark-Brown Developer Hair
    ctx.fillStyle = '#2d1e18';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-14, -54);
    ctx.quadraticCurveTo(-16, -65, -6, -66);
    ctx.lineTo(-2, -69);
    ctx.lineTo(3, -65);
    ctx.lineTo(10, -68);
    ctx.lineTo(12, -63);
    ctx.lineTo(16, -63);
    ctx.quadraticCurveTo(15, -56, 12, -55);
    ctx.quadraticCurveTo(4, -59, -14, -54);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Thick Black-Framed Developer Glasses (with glowing Cyan Code Reflection!)
    ctx.fillStyle = '#111622';
    // Left Lens Frame
    ctx.fillRect(-2, -54, 9, 8);
    // Right Lens Frame
    ctx.fillRect(8, -54, 8, 8);
    // Bridge
    ctx.fillRect(6, -52, 3, 2.5);
    // Temple stem
    ctx.fillRect(-12, -52, 11, 2.5);

    // Glowing Blue-Light Filter Lenses
    const lensColor = isShooting || isUlt ? '#80ffff' : '#40c4ff';
    ctx.fillStyle = lensColor;
    ctx.fillRect(-0.5, -52.5, 6, 5);
    ctx.fillRect(9.5, -52.5, 5, 5);

    // White Diagonal Specular Glint on Glasses
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0.5, -52, 2, 2);
    ctx.fillRect(10.5, -52, 2, 2);

    // Focused Eyebrows
    ctx.strokeStyle = '#2d1e18';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-1, -56);
    ctx.lineTo(6, -55);
    ctx.moveTo(9, -55);
    ctx.lineTo(15, -56);
    ctx.stroke();

    // Confident smirk / mouth
    ctx.strokeStyle = '#7a4932';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(2, -42);
    ctx.quadraticCurveTo(6, -41, 8, -43);
    ctx.stroke();

    // RGB Gaming Headset (Headband + Glowing Cyan Earcup + Boom Mic)
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(-2, -54, 13, Math.PI * 1.1, Math.PI * 1.75);
    ctx.stroke();

    // Earcup
    ctx.fillStyle = '#1c262b';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-13, -55, 8, 12, 4);
    ctx.fill();
    ctx.stroke();

    // Glowing Cyan RGB Ring on Earcup
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-11, -53, 4, 8, 2);
    ctx.stroke();

    // Headset Boom Mic
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -44);
    ctx.quadraticCurveTo(-4, -39, 2, -40);
    ctx.stroke();
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(2, -40, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- E. ARMS & RGB MECHANICAL KEYBOARD BLASTER ("KEYCANNON") ---
    ctx.save();
    const recoil = isShooting ? -3 : 0;
    ctx.translate(recoil, 0);

    // Sleeve
    ctx.fillStyle = '#1976d2';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-4, -32, 12, 8, 4);
    ctx.fill();
    ctx.stroke();

    // Custom Mechanical Keyboard Gun Body
    ctx.fillStyle = '#212121';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(4, -34, 24, 11, 3);
    ctx.fill();
    ctx.stroke();

    // Glowing RGB Underglow strip
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(6, -25, 20, 2);

    // Colorful Mechanical Keycaps (Red ESC, Cyan Keys, Gold Spacebar)
    ctx.fillStyle = '#ff1744'; // ESC key
    ctx.fillRect(6, -32, 3, 3);
    ctx.fillStyle = '#eceff1'; // Alpha keys
    ctx.fillRect(10, -32, 3, 3);
    ctx.fillRect(14, -32, 3, 3);
    ctx.fillRect(18, -32, 3, 3);
    ctx.fillStyle = '#00e5ff'; // Enter key
    ctx.fillRect(22, -32, 4, 3);
    ctx.fillStyle = '#ffca28'; // Spacebar
    ctx.fillRect(10, -28, 10, 2.5);

    // Front Emitter Barrel
    ctx.fillStyle = '#00e5ff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(27, -32, 5, 7, 2);
    ctx.fill();
    ctx.stroke();

    // Hand gripping keyboard blaster
    ctx.fillStyle = '#ffcfb3';
    ctx.beginPath();
    ctx.arc(8, -26, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Muzzle Flash / Syntax Burst when firing!
    if (isShooting) {
      ctx.fillStyle = '#80ffff';
      ctx.beginPath();
      ctx.arc(36, -28.5, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 10px monospace';
      ctx.fillText(';', 37, -25);
    }
    ctx.restore();
  }

  // ==========================================================================
  // 2. TESTADOR QA (Inspector Cap, Targeting Monocle, Bug-Zapper, Magnifying Rifle)
  // ==========================================================================
  drawTesterQA(ctx, time, walk, isShooting, isUlt, player) {
    const INK = '#121a14';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // --- A. "BUG EXTERMINATOR" TANK BACKPACK & RADAR ANTENNA ---
    ctx.save();
    // Radar antenna on top of pack
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-16, -38);
    ctx.lineTo(-16, -49);
    ctx.stroke();
    ctx.fillStyle = '#76ff03';
    ctx.beginPath();
    ctx.arc(-16, -50, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pressurized Green/Yellow Bug-Zapper Tank
    ctx.fillStyle = '#fbc02d';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-22, -40, 12, 24, 5);
    ctx.fill();
    ctx.stroke();

    // Hazard stripe on tank
    ctx.fillStyle = '#263238';
    ctx.fillRect(-21, -30, 10, 4);
    ctx.restore();

    // --- B. LEGS (Khaki Inspector Trousers & Heavy Combat Boots) ---
    const lSwing = walk * 6.5;
    const rSwing = -walk * 6.5;
    this.drawLegAndSneaker(ctx, -10 + lSwing, -16, '#5d4037', '#37474f', '#cfd8dc', INK);
    this.drawLegAndSneaker(ctx, 2 + rSwing, -16, '#6d4c41', '#455a64', '#cfd8dc', INK);

    // --- C. TORSO (Olive QA Inspector Trenchcoat/Vest + Shirt & Red Tie + Clipboard) ---
    const vestGrad = ctx.createLinearGradient(0, -39, 0, -14);
    vestGrad.addColorStop(0, '#43a047');
    vestGrad.addColorStop(1, '#1b5e20');
    ctx.fillStyle = vestGrad;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-14, -38, 28, 24, 6);
    ctx.fill();
    ctx.stroke();

    // White Dress Shirt V-Neck & Red Tie in center!
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-4, -38);
    ctx.lineTo(5, -38);
    ctx.lineTo(1, -26);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#d50000';
    ctx.beginPath();
    ctx.moveTo(-1, -37);
    ctx.lineTo(2, -37);
    ctx.lineTo(3, -27);
    ctx.lineTo(0.5, -24);
    ctx.lineTo(-2, -27);
    ctx.closePath();
    ctx.fill();

    // Gold "QA" Inspector Shield Badge on Left Chest
    ctx.fillStyle = '#ffd600';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-6, -30, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Utility Belt with QA Checklist Clipboard hanging at hip
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-13, -19, 26, 4);
    ctx.fillStyle = '#ffd600';
    ctx.fillRect(-2, -19, 6, 4);

    // Mini Clipboard "[✓]" on hip
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.fillRect(-13, -22, 8, 10);
    ctx.strokeRect(-13, -22, 8, 10);
    ctx.fillStyle = '#00c853';
    ctx.fillRect(-11, -19, 4, 2);
    ctx.fillStyle = '#d50000';
    ctx.fillRect(-11, -15, 4, 2);

    // --- D. HEAD, QA INSPECTOR CAP & TARGETING MONOCLE SCOUTER ---
    ctx.save();
    // Head Base
    ctx.fillStyle = '#f5cba7';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-13, -61, 26, 24, 9);
    ctx.fill();
    ctx.stroke();

    // Stern Inspector Jawline & Determined Mouth
    ctx.strokeStyle = '#6e473b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, -42);
    ctx.lineTo(8, -42);
    ctx.stroke();

    // Left Normal Eye + Raised Analytical Eyebrow
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(1, -50, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Right Eye Covered by Glowing Green Targeting Monocle / Bug-Scouter!
    ctx.fillStyle = 'rgba(118, 255, 3, 0.88)';
    ctx.strokeStyle = '#ffd600';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(10, -50, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red/Dark Target Crosshair inside the Monocle!
    ctx.strokeStyle = '#1b5e20';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(6, -50);
    ctx.lineTo(14, -50);
    ctx.moveTo(10, -54);
    ctx.lineTo(10, -46);
    ctx.stroke();

    // QA Inspector Detective Cap / Visor Hat
    ctx.fillStyle = '#1b5e20';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-14, -67, 26, 10, 5);
    ctx.fill();
    ctx.stroke();

    // Gold Band & Visor Brim
    ctx.fillStyle = '#ffd600';
    ctx.fillRect(-13, -59, 25, 2.5);
    ctx.fillStyle = '#111622';
    ctx.beginPath();
    ctx.roundRect(2, -59, 17, 4, 2);
    ctx.fill();
    ctx.stroke();

    // "QA" Emblem on front of Cap
    ctx.fillStyle = '#76ff03';
    ctx.font = '900 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QA', 2, -60.5);
    ctx.restore();

    // --- E. MAGNIFYING GLASS LASER RIFLE ("ASSERTION CANNON") ---
    ctx.save();
    const recoil = isShooting ? -3.5 : 0;
    ctx.translate(recoil, 0);

    // Rifle Stock & Body
    ctx.fillStyle = '#37474f';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.roundRect(-2, -31, 24, 7, 3);
    ctx.fill();
    ctx.stroke();

    // Glowing Green Energy Chamber on Rifle
    ctx.fillStyle = '#76ff03';
    ctx.fillRect(5, -29.5, 11, 4);

    // Giant Detective Magnifying Glass Lens mounted at the Muzzle!
    ctx.fillStyle = 'rgba(128, 216, 255, 0.65)';
    ctx.strokeStyle = '#ffd600';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(26, -28, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Specular shine on Magnifying Lens
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(24, -30, 4.5, Math.PI * 1.1, Math.PI * 1.6);
    ctx.stroke();

    // Hand holding rifle
    ctx.fillStyle = '#f5cba7';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(6, -25, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Laser Focal Flash when firing
    if (isShooting) {
      ctx.fillStyle = '#76ff03';
      ctx.beginPath();
      ctx.arc(35, -28, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(35, -28, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ==========================================================================
  // 3. ESTAGIÁRIO (Spiky Hair, Wide Caffeinated Eyes, Big Lanyard Badge, Espresso Gun)
  // ==========================================================================
  drawIntern(ctx, time, walk, isShooting, isUlt) {
    const INK = '#1a120b';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // --- A. SCHOOL BACKPACK WITH "JS" BOOK & RUBBER DUCK PEEKING OUT ---
    ctx.save();
    ctx.fillStyle = '#1565c0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-21, -37, 12, 21, 5);
    ctx.fill();
    ctx.stroke();

    // Cute Yellow Rubber Duck head peeking out of the top of the Intern's backpack!
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(-16, -41, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Duck bill
    ctx.fillStyle = '#ff6d00';
    ctx.fillRect(-23, -42, 4, 3);
    // Duck eye
    ctx.fillStyle = '#000';
    ctx.fillRect(-18, -43, 2, 2);
    ctx.restore();

    // --- B. LEGS (Jeans & Fast Orange/White Running Sneakers) ---
    const lSwing = walk * 8.5;
    const rSwing = -walk * 8.5;
    this.drawLegAndSneaker(ctx, -10 + lSwing, -16, '#283593', '#ff6d00', '#ffffff', INK);
    this.drawLegAndSneaker(ctx, 2 + rSwing, -16, '#303f9f', '#ff9100', '#ffffff', INK);

    // --- C. TORSO (Orange Intern T-Shirt + Yellow Sticky Notes + Giant Swinging Lanyard Badge!) ---
    const shirtGrad = ctx.createLinearGradient(0, -38, 0, -14);
    shirtGrad.addColorStop(0, '#ff9100');
    shirtGrad.addColorStop(1, '#e65100');
    ctx.fillStyle = shirtGrad;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-13, -37, 26, 23, 6);
    ctx.fill();
    ctx.stroke();

    // Yellow Post-it Sticky Note stuck on torso ("TODO")
    ctx.save();
    ctx.rotate(-0.12);
    ctx.fillStyle = '#fff59d';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.fillRect(-10, -31, 8, 8);
    ctx.strokeRect(-10, -31, 8, 8);
    ctx.fillStyle = '#d84315';
    ctx.fillRect(-8, -28, 4, 1.5);
    ctx.restore();

    // Blue Lanyard Strap around neck
    ctx.strokeStyle = '#00b0ff';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(-4, -37);
    ctx.lineTo(3, -25);
    ctx.lineTo(6, -37);
    ctx.stroke();

    // OVERSIZED SWINGING INTERN ID BADGE (Crachá de Estagiário!)
    ctx.save();
    const badgeSwing = walk * 0.25 + Math.sin(time * 0.01) * 0.08;
    ctx.translate(3, -25);
    ctx.rotate(badgeSwing);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-6, 0, 12, 14, 2);
    ctx.fill();
    ctx.stroke();
    // Red "ESTAG" header bar on badge
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(-4.5, 1.5, 9, 3.5);
    // Tiny photo & lines on badge
    ctx.fillStyle = '#2979ff';
    ctx.fillRect(-4, 6.5, 3.5, 4);
    ctx.fillStyle = '#90a4ae';
    ctx.fillRect(1, 7, 3.5, 1.5);
    ctx.fillRect(1, 9.5, 3.5, 1.5);
    ctx.restore();

    // --- D. HEAD, WILD SPIKY CAFFEINATED HAIR, WIDE EYES & SWEAT DROP ---
    ctx.save();
    // Head Base
    ctx.fillStyle = '#ffd5b8';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-13, -60, 26, 23, 9);
    ctx.fill();
    ctx.stroke();

    // Wild Spiky Caffeinated Hair (10 Espresso Shots!)
    ctx.fillStyle = '#3e2723';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-14, -53);
    ctx.lineTo(-19, -61);
    ctx.lineTo(-11, -60);
    ctx.lineTo(-13, -69);
    ctx.lineTo(-4, -63);
    ctx.lineTo(1, -72);
    ctx.lineTo(6, -63);
    ctx.lineTo(14, -70);
    ctx.lineTo(12, -60);
    ctx.lineTo(18, -61);
    ctx.lineTo(13, -53);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White & Cyan Headband ("CTRL+V")
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-13, -57, 26, 4.5);
    ctx.strokeRect(-13, -57, 26, 4.5);
    ctx.fillStyle = '#00b0ff';
    ctx.fillRect(-12, -55.5, 24, 1.5);

    // HUGE WIDE CAFFEINATED EYES!
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    // Left eye
    ctx.beginPath();
    ctx.arc(1, -48, 4.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Right eye
    ctx.beginPath();
    ctx.arc(10, -48, 4.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hyper-focused tiny pupils + white caffeine sparkle
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(2, -48, 2.1, 0, Math.PI * 2);
    ctx.arc(11, -48, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0.5, -50, 1.5, 1.5);
    ctx.fillRect(9.5, -50, 1.5, 1.5);

    // Excited / Nervous Open Smile
    ctx.fillStyle = '#d84315';
    ctx.beginPath();
    ctx.arc(6, -41.5, 3, 0, Math.PI, false);
    ctx.fill();
    ctx.stroke();

    // Comic Blue Sweat Drop on temple (Friday Deploy panic!)
    ctx.fillStyle = '#40c4ff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, -53);
    ctx.quadraticCurveTo(-11, -47, -8, -46);
    ctx.quadraticCurveTo(-5, -47, -8, -53);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // --- E. GIANT STEAMING ESPRESSO MUG CANNON ("CTRL+C / CTRL+V BLASTER") ---
    ctx.save();
    const recoil = isShooting ? -4 : 0;
    ctx.translate(recoil, 0);

    // Espresso Blaster Barrel & Mug Body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(6, -36, 18, 15, 4);
    ctx.fill();
    ctx.stroke();

    // Mug Handle
    ctx.beginPath();
    ctx.arc(6, -28.5, 5, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();

    // Orange Coffee Stripe & "☕" / "V" Label on Mug
    ctx.fillStyle = '#ff6d00';
    ctx.fillRect(8, -31, 14, 7);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('☕V', 15, -25);

    // Hot Coffee Liquid rim at top of mug
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(8, -35, 14, 3);

    // Pressurized Spout Nozzle on right of Mug
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.roundRect(24, -32, 7, 7, 2);
    ctx.fill();
    ctx.stroke();

    // Rising White Steam Puffs above the Espresso Mug!
    const steamOff = (time * 0.015) % 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.beginPath();
    ctx.arc(13, -39 - steamOff, 3.5, 0, Math.PI * 2);
    ctx.arc(18, -42 - steamOff * 0.8, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Hand holding mug cannon
    ctx.fillStyle = '#ffd5b8';
    ctx.beginPath();
    ctx.arc(6, -26, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (isShooting) {
      ctx.fillStyle = '#ffab00';
      ctx.beginPath();
      ctx.arc(34, -28.5, 6.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Helper to draw a crisp cel-shaded leg & sneaker
  drawLegAndSneaker(ctx, x, y, pantsCol, shoeCol, soleCol, inkCol) {
    ctx.save();
    ctx.fillStyle = pantsCol;
    ctx.strokeStyle = inkCol;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.roundRect(x, y, 8, 11, 3);
    ctx.fill();
    ctx.stroke();

    // Sneaker
    ctx.fillStyle = shoeCol;
    ctx.beginPath();
    ctx.roundRect(x - 1, y + 9, 12, 6, 3);
    ctx.fill();
    ctx.stroke();

    // White Sneaker Sole
    ctx.fillStyle = soleCol;
    ctx.fillRect(x, y + 13, 10, 2);
    ctx.restore();
  }

  // Helper to draw the Orbiting Rubber Duck Companion
  drawOrbitingDuck(ctx, time) {
    const dAngle = time * 0.005;
    const dx = Math.cos(dAngle) * 36;
    const dy = -30 + Math.sin(dAngle * 2) * 7;

    ctx.save();
    ctx.translate(dx, dy);
    ctx.fillStyle = '#ffeb3b';
    ctx.strokeStyle = '#121722';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Orange Beak
    ctx.fillStyle = '#ff6d00';
    ctx.beginPath();
    ctx.roundRect(5, -2, 6, 4, 1.5);
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(2, -2.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ==========================================================================
  // 2D CEL-SHADED ENEMIES OF CLEAN CODE & BOSS ILLUSTRATOR
  // ==========================================================================
  drawEnemy(ctx, en, time) {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (en.hitFlash > 0) {
      ctx.filter = 'brightness(2.1)';
    }

    const cx = Math.round(en.x + en.w / 2);
    const cy = Math.round(en.y + en.h / 2);
    const dir = en.vx >= 0 ? 1 : -1;

    ctx.translate(cx, cy);

    if (en.type === 'bug') {
      ctx.scale(dir, 1);
      this.drawSyntaxBug(ctx, time);
    } else if (en.type === 'nullpointer') {
      this.drawNullPointer(ctx, time);
    } else if (en.type === 'legacy') {
      ctx.scale(dir, 1);
      this.drawLegacyCobol(ctx, time);
    } else {
      // 'conflict' or 'mini_conflict'
      this.drawMergeConflict(ctx, time, en.type === 'mini_conflict');
    }

    ctx.restore();

    // Overhead Health Bar when damaged
    if (en.hp < en.maxHp) {
      const bw = en.w + 6;
      const bx = Math.round(en.x - 3);
      const by = Math.round(en.y - 12);
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(bx, by, bw, 6);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(bx + 1, by + 1, (bw - 2) * Math.max(0, en.hp / en.maxHp), 4);
      ctx.restore();
    }
    return true;
  }

  // 1. SYNTAX BUG: Red "{404}" Beetle, ";" Antennae, "< >" Pincers & 6 Robotic Legs
  drawSyntaxBug(ctx, time) {
    const INK = '#12151f';
    const scuttle = Math.sin(time * 0.025) * 3.5;

    // 6 Robotic Microchip Legs
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 2.8;
    [-12, -3, 6].forEach((lx, i) => {
      const legOff = (i % 2 === 0 ? scuttle : -scuttle);
      ctx.beginPath();
      ctx.moveTo(lx, 6);
      ctx.lineTo(lx - 4 + legOff * 0.5, 13);
      ctx.lineTo(lx - 2 + legOff, 18);
      ctx.stroke();

      // Glowing joint dot
      ctx.fillStyle = '#ffca28';
      ctx.beginPath();
      ctx.arc(lx - 4 + legOff * 0.5, 13, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Glossy Red "{404}" Beetle Shell (Carapace)
    const shellGrad = ctx.createRadialGradient(-6, -8, 3, -2, 0, 22);
    shellGrad.addColorStop(0, '#ff5252');
    shellGrad.addColorStop(0.6, '#d50000');
    shellGrad.addColorStop(1, '#7f0000');
    ctx.fillStyle = shellGrad;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-2, 7, 19, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Specular highlight on shell
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(-7, -5, 7, 3.2, -0.35, 0, Math.PI * 2);
    ctx.fill();

    // "{404}" Code Stamp on Back of Shell
    ctx.fillStyle = '#1a0000';
    ctx.font = '900 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('{404}', -5, 3);

    // Dark Cyber-Head on Front Right
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(11, 3, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing Angry Yellow Eyes
    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.arc(12, 1, 3.5, 0, Math.PI * 2);
    ctx.arc(17, 1, 3, 0, Math.PI * 2);
    ctx.fill();
    // Angry brow
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(9, -3);
    ctx.lineTo(19, 0);
    ctx.stroke();

    // Sharp Metallic "<" and ">" Angle-Bracket Pincer Mandibles!
    const snap = Math.abs(Math.sin(time * 0.015)) * 2.5;
    ctx.strokeStyle = '#cfd8dc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(15, 7);
    ctx.lineTo(23, 5 + snap);
    ctx.lineTo(18, 12);
    ctx.stroke();

    // Semicolon ";" Antennae bobbing on top!
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, -6);
    ctx.quadraticCurveTo(13, -15, 18, -14 + scuttle * 0.4);
    ctx.stroke();
    ctx.fillStyle = '#00e5ff';
    ctx.font = '900 13px monospace';
    ctx.fillText(';', 20, -10 + scuttle * 0.4);
  }

  // 2. NULLPOINTER EXCEPTION: Missing-Texture Glitch Ghost with "NULL" Skull Visor & Wings
  drawNullPointer(ctx, time) {
    const bob = Math.sin(time * 0.008) * 3;
    const wingFlap = Math.sin(time * 0.02) * 7;

    ctx.save();
    ctx.translate(0, bob);

    // Jagged Cyan/Purple Glitch Bat-Wings
    ctx.fillStyle = '#4a148c';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.2;

    // Left Wing
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(-28, -14 + wingFlap);
    ctx.lineTo(-24, 2 + wingFlap * 0.5);
    ctx.lineTo(-18, -2);
    ctx.lineTo(-14, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(12, -4);
    ctx.lineTo(28, -14 + wingFlap);
    ctx.lineTo(24, 2 + wingFlap * 0.5);
    ctx.lineTo(18, -2);
    ctx.lineTo(14, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ghost Body Cloak (Deep Purple with Magenta/Black Missing-Texture Checkerboard!)
    const ghostGrad = ctx.createLinearGradient(0, -18, 0, 18);
    ghostGrad.addColorStop(0, '#7b1fa2');
    ghostGrad.addColorStop(1, '#311b92');
    ctx.fillStyle = ghostGrad;
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -4, 15, Math.PI, 0, false);
    ctx.lineTo(15, 14);
    ctx.lineTo(9, 10);
    ctx.lineTo(4, 16);
    ctx.lineTo(-2, 10);
    ctx.lineTo(-8, 16);
    ctx.lineTo(-15, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Missing-Texture Magenta/Black Checkerboard Glitch Patches on Body
    const sqs = [[-9, 2], [-3, 2], [3, 2], [-6, 8], [0, 8], [6, 8]];
    sqs.forEach(([sx, sy], i) => {
      ctx.fillStyle = i % 2 === 0 ? '#e040fb' : '#0a0612';
      ctx.fillRect(sx, sy, 5, 5);
    });

    // Dark Visor Screen with Glowing Cyan "NULL" Text & Skull Nose
    ctx.fillStyle = '#0a0e1a';
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-11, -13, 22, 13, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#00ffff';
    ctx.font = '900 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NULL', 0, -4);

    // Floating "undefined" text particles around ghost
    ctx.fillStyle = '#ea80fc';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('undef', -18, -16 - bob * 0.6);
    ctx.fillText('NaN', 19, 14 + bob * 0.6);
    ctx.restore();
  }

  // 3. CONFLITO DE MERGE: Two-Headed Mutant (Orange <<<HEAD vs Cyan >>>BRANCH) + Spaghetti Wires
  drawMergeConflict(ctx, time, isMini = false) {
    const INK = '#141018';
    const tug = Math.sin(time * 0.02) * 2.5;

    if (isMini) {
      // Mini split conflict head running fast!
      ctx.fillStyle = '#ff6d00';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-12, -12, 24, 22, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('>>>', 0, 2);
      return;
    }

    // Tangled Spaghetti-Code Wires wrapping the torso
    const wireColors = ['#ff1744', '#00e676', '#ffea00', '#00e5ff'];
    wireColors.forEach((wc, idx) => {
      ctx.strokeStyle = wc;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-18, -2 + idx * 3);
      ctx.quadraticCurveTo(0, 8 - idx * 4 + tug, 18, -2 + idx * 3);
      ctx.stroke();
    });

    // LEFT HALF: Angry Orange Fire Mutant ("<<<HEAD") pulling Left!
    ctx.fillStyle = '#ff6d00';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-21 - tug * 0.5, -18, 20, 32, 6);
    ctx.fill();
    ctx.stroke();

    // RIGHT HALF: Angry Cyan Ice Mutant (">>>BRANCH") pulling Right!
    ctx.fillStyle = '#00b0ff';
    ctx.beginPath();
    ctx.roundRect(1 + tug * 0.5, -18, 20, 32, 6);
    ctx.fill();
    ctx.stroke();

    // Glowing Yellow Electric Tear-Seam ("=======") down the center!
    ctx.fillStyle = '#ffea00';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-4, -19, 8, 34, 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.font = '900 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('===', 0, -7);
    ctx.fillText('===', 0, 2);
    ctx.fillText('===', 0, 11);

    // Angry Eyes on Both Heads
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-12, -9, 3.5, 0, Math.PI * 2);
    ctx.arc(12, -9, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Labels above/on sides
    ctx.fillStyle = '#ff9100';
    ctx.font = '900 7px monospace';
    ctx.fillText('<<HEAD', -14, -22);
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('>>MAIN', 14, -22);
  }

  // 4. TORRETA COBOL LEGADO: Beige 1980s CRT Monitor on Tank Treads, Duct Tape & Vacuum Tubes
  drawLegacyCobol(ctx, time) {
    const INK = '#181818';

    // 1. Caterpillar Tank Treads at Bottom
    ctx.fillStyle = '#37474f';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-22, 10, 44, 12, 6);
    ctx.fill();
    ctx.stroke();

    // Tank Wheels
    ctx.fillStyle = '#78909c';
    [-14, 0, 14].forEach(wx => {
      ctx.beginPath();
      ctx.arc(wx, 16, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // 2. Glowing Red Vacuum Tubes on Top of CRT
    [-10, 0, 10].forEach((tx, idx) => {
      ctx.fillStyle = (Math.floor(time / 180) + idx) % 2 === 0 ? '#ff1744' : '#ff9100';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(tx - 3, -26, 6, 9, 3);
      ctx.fill();
      ctx.stroke();
    });

    // 3. Vintage Beige 1980s CRT Monitor Case
    ctx.fillStyle = '#d7ccc8';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-20, -18, 40, 29, 5);
    ctx.fill();
    ctx.stroke();

    // Green Phosphor CRT Screen with Grumpy Face
    ctx.fillStyle = '#052e16';
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-14, -13, 28, 19, 3);
    ctx.fill();
    ctx.stroke();

    // Grumpy Green Phosphor Eyes & Frown
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    // Angry eyes
    ctx.moveTo(-9, -8);
    ctx.lineTo(-3, -5);
    ctx.moveTo(9, -8);
    ctx.lineTo(3, -5);
    // Grumpy frown
    ctx.moveTo(-7, 2);
    ctx.quadraticCurveTo(0, -3, 7, 2);
    ctx.stroke();

    // Silver Duct Tape ("Gambiarra") Patch on Corner!
    ctx.save();
    ctx.rotate(0.45);
    ctx.fillStyle = '#90a4ae';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    ctx.fillRect(6, -18, 11, 4);
    ctx.strokeRect(6, -18, 11, 4);
    ctx.restore();

    // Heavy Side Cannon Barrel
    ctx.fillStyle = '#546e7a';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(17, -6, 10, 9, 2);
    ctx.fill();
    ctx.stroke();
  }

  // 5. BOSS FINAL: MONOLITO DE PRODUÇÃO (DEPLOY 18H) — Server Rack Mech with 17:59 Clock Crown & Missile Pods
  drawBoss(ctx, boss, time) {
    if (boss.dead) return true;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (boss.hitFlash > 0) {
      ctx.filter = 'brightness(2.0)';
    }

    const INK = '#0d0d14';
    const cx = Math.round(boss.x + boss.w / 2);
    const cy = Math.round(boss.y + boss.h / 2);

    ctx.translate(cx, cy);

    // 1. Heavy Mech Legs (Black & Crimson Armor)
    [-26, 12].forEach(lx => {
      ctx.fillStyle = '#263238';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(lx, 32, 16, 30, 4);
      ctx.fill();
      ctx.stroke();

      // Crimson Knee & Boot Guard
      ctx.fillStyle = '#d50000';
      ctx.beginPath();
      ctx.roundRect(lx - 3, 52, 22, 12, 4);
      ctx.fill();
      ctx.stroke();
    });

    // 2. Shoulder Missile Pods ("DEADLINE" Launchers)
    [-54, 30].forEach(px => {
      ctx.fillStyle = '#1c262b';
      ctx.strokeStyle = '#ff1744';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.roundRect(px, -38, 24, 28, 5);
      ctx.fill();
      ctx.stroke();

      // Red Warhead Tips inside Pods
      ctx.fillStyle = '#ff1744';
      [[6, 8], [18, 8], [6, 20], [18, 20]].forEach(([mx, my]) => {
        ctx.beginPath();
        ctx.arc(px + mx, -38 + my, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // 3. Colossal Black & Red Server Rack Torso
    ctx.fillStyle = '#1a1d24';
    ctx.strokeStyle = '#ff1744';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(-36, -44, 72, 82, 8);
    ctx.fill();
    ctx.stroke();

    // 4. Digital "17:59" Alarm Clock + Gold Crown on Top!
    ctx.fillStyle = '#ffb300';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-14, -60);
    ctx.lineTo(-10, -70);
    ctx.lineTo(-3, -63);
    ctx.lineTo(0, -72);
    ctx.lineTo(4, -63);
    ctx.lineTo(10, -70);
    ctx.lineTo(14, -60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Digital Clock Box ("17:59")
    ctx.fillStyle = '#111';
    ctx.strokeStyle = '#ff1744';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-20, -61, 40, 16, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ff1744';
    ctx.font = '900 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('17:59', 0, -49);

    // 5. Demonic Red CRT Monitor Face inside Server Rack
    ctx.fillStyle = '#3b0000';
    ctx.strokeStyle = '#ff5252';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-26, -36, 52, 34, 4);
    ctx.fill();
    ctx.stroke();

    // Glowing Red Evil Eyes & Fangs
    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    ctx.moveTo(-18, -26);
    ctx.lineTo(-5, -20);
    ctx.lineTo(-16, -17);
    ctx.closePath();
    ctx.moveTo(18, -26);
    ctx.lineTo(5, -20);
    ctx.lineTo(16, -17);
    ctx.closePath();
    ctx.fill();

    // Jagged Red Mouth with Fangs
    ctx.strokeStyle = '#ff5252';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-12, -9);
    ctx.quadraticCurveTo(0, -14, 12, -9);
    ctx.stroke();

    // 6. Server Rack Bays with Blinking Red/Green LEDs
    for (let i = 0; i < 3; i++) {
      const by = 4 + i * 11;
      ctx.fillStyle = '#2c333d';
      ctx.fillRect(-26, by, 52, 8);
      ctx.fillStyle = (Math.floor(time / 140) + i) % 2 === 0 ? '#ff1744' : '#00e676';
      ctx.beginPath();
      ctx.arc(18, by + 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Overhead Boss Health Bar
    const bw = 160;
    const bx = Math.round(cx - bw / 2);
    const by = Math.round(boss.y - 34);
    ctx.save();
    ctx.fillStyle = '#111';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.fillRect(bx, by, bw, 13);
    ctx.strokeRect(bx, by, bw, 13);
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(bx + 2, by + 2, (bw - 4) * Math.max(0, boss.hp / boss.maxHp), 9);
    ctx.fillStyle = '#ffeb3b';
    ctx.font = '900 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MONOLITO DE PRODUÇÃO (17:59)', cx, by - 5);
    ctx.restore();
    return true;
  }
}

window.cyberSprites = new TechHeroIllustrator();

