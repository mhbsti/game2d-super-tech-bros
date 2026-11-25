// Entities: Playable Tech Heroes (Programmer, QA Tester, Intern), Projectiles, PowerUps, Enemies & Boss

const CHAR_CONFIG = {
  programmer: {
    id: 'programmer',
    name: 'Programador',
    shortName: 'DEV',
    emoji: '👨‍💻',
    speed: 4.7,
    jumpForce: 13.2,
    maxJumps: 2, // Async/Await Double Jump
    maxHp: 100,
    fireCooldown: 13,
    color: '#00d2ff',
    hoodieColor: '#1e3c72',
    ultName: 'git push --force'
  },
  tester: {
    id: 'tester',
    name: 'Testador QA',
    shortName: 'QA',
    emoji: '🕵️‍♂️',
    speed: 4.3,
    jumpForce: 12.8,
    maxJumps: 1,
    maxHp: 130, // Tankier QA
    fireCooldown: 18,
    color: '#76ff03',
    hoodieColor: '#2e7d32',
    ultName: 'Suíte de Testes 360°'
  },
  intern: {
    id: 'intern',
    name: 'Estagiário',
    shortName: 'ESTAG',
    emoji: '☕',
    speed: 6.0, // Caffeinated speedrunner
    jumpForce: 14.3,
    maxJumps: 2,
    maxHp: 90,
    fireCooldown: 11,
    color: '#ffab00',
    hoodieColor: '#e65100',
    ultName: 'Overdose de Café (Star)'
  }
};

class Player {
  constructor(x, y, charType = 'programmer') {
    this.x = x;
    this.y = y;
    this.w = 38;
    this.h = 52;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1 right, -1 left
    this.onGround = false;
    this.onLadder = false;
    this.jumpsLeft = 2;

    this.seniority = 1; // 1: Júnior, 2: Pleno, 3: Sênior, 4: Staff/Tech Lead
    this.hasDuckShield = false;
    this.invincibleTimer = 0; // Hit i-frames
    this.starTimer = 0; // Super Mario Star / Friday Deploy mode
    this.specialEnergy = 100; // 0..100
    this.fireTimer = 0;
    this.animFrame = 0;

    this.setCharacter(charType, true);
  }

  setCharacter(charType, fullHeal = false) {
    const cfg = CHAR_CONFIG[charType] || CHAR_CONFIG.programmer;
    const hpRatio = this.maxHp ? this.hp / this.maxHp : 1;
    this.charType = cfg.id;
    this.cfg = cfg;
    this.maxHp = cfg.maxHp;
    this.hp = fullHeal ? this.maxHp : Math.max(15, Math.round(this.maxHp * hpRatio));
    this.jumpsLeft = cfg.maxJumps;
  }

  getSeniorityTitle() {
    const titles = ['Estagiário', 'Júnior Lv.1', 'Pleno Lv.2', 'Sênior Lv.3', 'Tech Lead MAX'];
    return titles[Math.min(this.seniority, 4)];
  }

  draw(ctx, time) {
    if (window.cyberSprites && window.cyberSprites.drawPlayer(ctx, this, time)) {
      return;
    }
    ctx.save();

    // Blink on damage i-frames
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;

    // Star / Overdose de Café Rainbow Aura
    if (this.starTimer > 0) {
      const hue = (time * 0.6) % 360;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 36 + Math.sin(time * 0.02) * 4, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.35)`;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
      ctx.stroke();
      ctx.restore();
    }

    // Orbiting Rubber Duck Shield (Debugging Duck)
    if (this.hasDuckShield) {
      const dAngle = time * 0.005;
      const dx = cx + Math.cos(dAngle) * 34;
      const dy = cy - 8 + Math.sin(dAngle * 2) * 8;
      ctx.save();
      ctx.beginPath();
      ctx.arc(dx, dy, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ffeb3b';
      ctx.fill();
      ctx.strokeStyle = '#f57f17';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Duck beak
      ctx.fillStyle = '#ff6d00';
      ctx.fillRect(dx + 6, dy - 2, 6, 4);
      // Duck eye
      ctx.fillStyle = '#000';
      ctx.fillRect(dx + 2, dy - 4, 2.5, 2.5);
      ctx.restore();
    }

    ctx.translate(cx, cy);
    ctx.scale(this.facing, 1);

    const walkSwing = this.onGround && Math.abs(this.vx) > 0.3
      ? Math.sin(time * 0.018) * 6
      : 0;

    // Legs / Boots
    ctx.fillStyle = '#1c2833';
    ctx.beginPath();
    ctx.roundRect(-11 + walkSwing, 12, 9, 14, 4);
    ctx.roundRect(2 - walkSwing, 12, 9, 14, 4);
    ctx.fill();

    // Torso / Hoodie
    ctx.fillStyle = this.cfg.hoodieColor;
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-14, -6, 28, 22, 6);
    ctx.fill();
    ctx.stroke();

    // Class-specific chest details
    if (this.charType === 'programmer') {
      // "</>" logo on hoodie
      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('</>', 0, 8);
    } else if (this.charType === 'tester') {
      // QA Tactical Crossbelt & Badge
      ctx.fillStyle = '#c6ff00';
      ctx.fillRect(-10, -2, 20, 4);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QA', 0, 11);
    } else if (this.charType === 'intern') {
      // Intern Swinging Lanyard / Crachá
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-4, -5);
      ctx.lineTo(0, 5);
      ctx.lineTo(4, -5);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fillRect(-5, 4, 10, 9);
      ctx.fillStyle = '#e53935';
      ctx.fillRect(-4, 5, 8, 3);
    }

    // Head
    ctx.fillStyle = '#ffcc99';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-13, -25, 26, 21, 8);
    ctx.fill();
    ctx.stroke();

    // Hair / Hat per class
    if (this.charType === 'programmer') {
      // Messy dev hair + Cyan Coding Headband + Headphones
      ctx.fillStyle = '#2c1d11';
      ctx.beginPath();
      ctx.roundRect(-14, -28, 28, 8, 4);
      ctx.fill();
      // Cyan headband
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(-14, -22, 28, 4);
      // Glasses
      ctx.fillStyle = '#111';
      ctx.fillRect(0, -18, 12, 6);
      ctx.fillStyle = '#80d8ff';
      ctx.fillRect(2, -17, 4, 4);
      ctx.fillRect(7, -17, 4, 4);
    } else if (this.charType === 'tester') {
      // QA Detective Cap + Green Laser Visor Scouter
      ctx.fillStyle = '#1b5e20';
      ctx.beginPath();
      ctx.roundRect(-15, -28, 32, 8, 4);
      ctx.fill();
      ctx.stroke();
      // Green Bug-Scouter lens over eye
      ctx.fillStyle = 'rgba(118, 255, 3, 0.85)';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(6, -15, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Intern Spiky Caffeinated Hair + Wide Eyes
      ctx.fillStyle = '#4e342e';
      ctx.beginPath();
      ctx.moveTo(-14, -23);
      ctx.lineTo(-8, -32);
      ctx.lineTo(-2, -25);
      ctx.lineTo(5, -33);
      ctx.lineTo(10, -25);
      ctx.lineTo(15, -30);
      ctx.lineTo(13, -22);
      ctx.closePath();
      ctx.fill();
      // Wide hyper eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(5, -15, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(6, -15, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Weapon in hand
    if (this.charType === 'programmer') {
      // RGB Mechanical Keyboard Blaster
      ctx.fillStyle = '#263238';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(4, -2, 20, 9, 3);
      ctx.fill();
      ctx.stroke();
    } else if (this.charType === 'tester') {
      // QA Magnifying Assertion Cannon
      ctx.fillStyle = '#37474f';
      ctx.fillRect(4, -2, 22, 7);
      ctx.strokeStyle = '#76ff03';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(26, 1, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Intern Dual Espresso Mug Launcher
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#d84315';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(7, -4, 12, 12, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffab00';
      ctx.fillRect(9, -1, 8, 5);
    }

    ctx.restore();
  }
}

class Projectile {
  constructor(x, y, vx, vy, owner, charType, seniority = 1, isUltimate = false) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.owner = owner; // 'player' or 'enemy'
    this.charType = charType;
    this.isUltimate = isUltimate;
    this.dead = false;
    this.life = isUltimate ? 110 : 75;
    this.hitIds = new Set();

    if (owner === 'player') {
      if (isUltimate) {
        this.w = 56;
        this.h = 36;
        this.damage = 45 + seniority * 10;
        this.piercing = true;
        this.label = charType === 'programmer' ? 'git push -f' : (charType === 'tester' ? 'ASSERT ALL!' : 'DEPLOY 18H!');
        this.color = '#ffea00';
      } else if (charType === 'programmer') {
        this.w = 24;
        this.h = 14;
        this.damage = 16 + (seniority - 1) * 5;
        this.piercing = seniority >= 4;
        const tokens = ['</>', '{ }', '===', ';', 'npm'];
        this.label = tokens[Math.floor(Math.random() * tokens.length)];
        this.color = '#00e5ff';
      } else if (charType === 'tester') {
        this.w = 34;
        this.h = 12;
        this.damage = 24 + (seniority - 1) * 7;
        this.piercing = true; // QA shots pierce bugs!
        this.label = '✓ PASS';
        this.color = '#76ff03';
      } else {
        // Intern
        this.w = 20;
        this.h = 16;
        this.damage = 11 + (seniority - 1) * 4;
        this.piercing = false;
        const tokens = ['Ctrl+V', '☕', 'Stack', 'TODO'];
        this.label = tokens[Math.floor(Math.random() * tokens.length)];
        this.color = '#ffab00';
      }
    } else {
      // Enemy projectile
      this.w = 18;
      this.h = 18;
      this.damage = 16;
      this.piercing = false;
      this.label = charType || '500';
      this.color = '#ff1744';
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.life <= 0) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;

    if (this.owner === 'player') {
      // Glowing code pill / laser
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.isUltimate ? 16 : 8;
      ctx.fillStyle = '#0d1b2a';
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.isUltimate ? 3.5 : 2.2;
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.w, this.h, 7);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${this.isUltimate ? 12 : 10}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.label, cx, cy);
    } else {
      // Red Error Orb
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#d50000';
      ctx.strokeStyle = '#ff8a80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, this.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.label, cx, cy);
    }
    ctx.restore();
  }
}

class Enemy {
  constructor(def, difficulty = 1) {
    this.id = Math.random().toString(36).slice(2);
    this.type = def.type; // 'bug', 'nullpointer', 'legacy', 'conflict', 'mini_conflict'
    this.x = def.x;
    this.y = def.y;
    this.baseY = def.y;
    this.minX = def.minX ?? (def.x - 120);
    this.maxX = def.maxX ?? (def.x + 120);
    this.dead = false;
    this.hitFlash = 0;
    this.shootTimer = 60 + Math.floor(Math.random() * 80);

    if (this.type === 'bug') {
      this.name = 'Syntax Bug';
      this.w = 40;
      this.h = 34;
      this.vx = 1.6 * difficulty;
      this.maxHp = Math.round(30 * difficulty);
      this.scoreValue = 100;
    } else if (this.type === 'nullpointer') {
      this.name = 'NullPointer';
      this.w = 42;
      this.h = 38;
      this.vx = 2.1 * difficulty;
      this.maxHp = Math.round(42 * difficulty);
      this.scoreValue = 150;
    } else if (this.type === 'legacy') {
      this.name = 'COBOL Legacy';
      this.w = 48;
      this.h = 48;
      this.vx = 0.8 * difficulty;
      this.maxHp = Math.round(75 * difficulty);
      this.scoreValue = 250;
    } else if (this.type === 'conflict') {
      this.name = 'Merge Conflict';
      this.w = 46;
      this.h = 42;
      this.vx = 2.2 * difficulty;
      this.maxHp = Math.round(55 * difficulty);
      this.scoreValue = 200;
    } else {
      // mini_conflict
      this.name = 'HEAD>>>';
      this.w = 28;
      this.h = 26;
      this.vx = (Math.random() > 0.5 ? 2.8 : -2.8) * difficulty;
      this.maxHp = Math.round(22 * difficulty);
      this.scoreValue = 80;
    }
    this.hp = this.maxHp;
  }

  update(time, player, enemyProjectiles) {
    if (this.hitFlash > 0) this.hitFlash--;

    this.x += this.vx;
    if (this.x < this.minX) {
      this.x = this.minX;
      this.vx = Math.abs(this.vx);
    } else if (this.x + this.w > this.maxX) {
      this.x = this.maxX - this.w;
      this.vx = -Math.abs(this.vx);
    }

    if (this.type === 'nullpointer') {
      this.y = this.baseY + Math.sin(time * 0.005 + this.x * 0.02) * 24;
    }

    // Ranged attack for Legacy Turret & NullPointer when near player
    if (this.type === 'legacy' || this.type === 'nullpointer') {
      const dist = Math.hypot((player.x - this.x), (player.y - this.y));
      if (dist < 520) {
        this.shootTimer--;
        if (this.shootTimer <= 0) {
          this.shootTimer = this.type === 'legacy' ? 115 : 140;
          const dir = player.x >= this.x ? 1 : -1;
          const label = this.type === 'legacy' ? '500' : 'NaN';
          enemyProjectiles.push(
            new Projectile(
              this.x + this.w / 2,
              this.y + this.h / 2 - 6,
              dir * 4.5,
              this.type === 'nullpointer' ? 1.2 : 0,
              'enemy',
              label
            )
          );
        }
      }
    }
  }

  draw(ctx, time) {
    if (window.cyberSprites && window.cyberSprites.drawEnemy(ctx, this, time)) {
      return;
    }
    ctx.save();
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;

    if (this.hitFlash > 0) {
      ctx.filter = 'brightness(2.2)';
    }

    if (this.type === 'bug') {
      // Red/Purple Syntax Beetle Bug
      ctx.fillStyle = '#c62828';
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy + 4, 18, Math.PI, 0, false);
      ctx.lineTo(this.x + this.w - 2, this.y + this.h);
      ctx.lineTo(this.x + 2, this.y + this.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Label on shell
      ctx.fillStyle = '#ffeb3b';
      ctx.font = '900 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BUG', cx, cy + 2);

      // Angry eyes
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - 10, cy - 8, 6, 6);
      ctx.fillRect(cx + 4, cy - 8, 6, 6);
      ctx.fillStyle = '#000';
      ctx.fillRect(cx - 8, cy - 6, 3, 3);
      ctx.fillRect(cx + 6, cy - 6, 3, 3);
    } else if (this.type === 'nullpointer') {
      // Floating Purple/Cyan Glitch Ghost
      const wingY = Math.sin(time * 0.02) * 6;
      ctx.fillStyle = '#6a1b9a';
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;

      // Wings
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy);
      ctx.lineTo(cx - 28, cy - 10 + wingY);
      ctx.lineTo(cx - 22, cy + 8);
      ctx.moveTo(cx + 14, cy);
      ctx.lineTo(cx + 28, cy - 10 + wingY);
      ctx.lineTo(cx + 22, cy + 8);
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(this.x + 4, this.y + 4, this.w - 8, this.h - 8, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NULL!', cx, cy + 3);
    } else if (this.type === 'legacy') {
      // Heavy Old-School COBOL Monitor Block
      ctx.fillStyle = '#37474f';
      ctx.strokeStyle = '#eceff1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.w, this.h, 6);
      ctx.fill();
      ctx.stroke();

      // Green phosphor CRT screen
      ctx.fillStyle = '#003300';
      ctx.fillRect(this.x + 6, this.y + 7, this.w - 12, 24);
      ctx.fillStyle = '#00e676';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('COBOL', cx, this.y + 18);
      ctx.fillText('ERR!', cx, this.y + 28);
    } else {
      // Merge Conflict (<<<<<<< HEAD)
      ctx.fillStyle = '#e65100';
      ctx.strokeStyle = '#ffeb3b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.w, this.h, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '900 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.type === 'conflict' ? '<<<HEAD' : '>>>', cx, cy - 2);
      ctx.fillText(this.type === 'conflict' ? '=======' : '===', cx, cy + 9);
    }

    // Mini HP bar if damaged
    if (this.hp < this.maxHp) {
      const bw = this.w;
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(this.x, this.y - 10, bw, 5);
      ctx.fillStyle = '#ff5252';
      ctx.fillRect(this.x, this.y - 10, bw * (this.hp / this.maxHp), 5);
    }

    ctx.restore();
  }
}

class Boss {
  constructor(def, difficulty = 1) {
    this.name = def.name;
    this.x = def.x;
    this.y = def.y;
    this.w = def.w;
    this.h = def.h;
    this.maxHp = Math.round(def.maxHp * difficulty);
    this.hp = this.maxHp;
    this.minX = def.minX;
    this.maxX = def.maxX;
    this.vx = 2.0;
    this.vy = 0;
    this.baseY = def.y;
    this.dead = false;
    this.hitFlash = 0;
    this.attackTimer = 90;
  }

  update(time, player, enemyProjectiles, enemies) {
    if (this.dead) return;
    if (this.hitFlash > 0) this.hitFlash--;

    // Patrol & Chase
    this.x += this.vx;
    if (this.x < this.minX) {
      this.x = this.minX;
      this.vx = Math.abs(this.vx);
    } else if (this.x + this.w > this.maxX) {
      this.x = this.maxX - this.w;
      this.vx = -Math.abs(this.vx);
    }

    // Hover / Stomp wave
    this.y = this.baseY + Math.sin(time * 0.004) * 10;

    this.attackTimer--;
    if (this.attackTimer <= 0) {
      this.attackTimer = this.hp < this.maxHp * 0.5 ? 65 : 95;
      const dir = player.x + player.w / 2 < this.x + this.w / 2 ? -1 : 1;

      // Fan of 3 error projectiles
      const labels = ['500 ERR', 'DEADLINE', 'ESCOPO!'];
      [-1.8, 0, 1.8].forEach((vy, idx) => {
        enemyProjectiles.push(
          new Projectile(
            this.x + this.w / 2 - 10,
            this.y + this.h / 2,
            dir * 5.2,
            vy,
            'enemy',
            labels[idx]
          )
        );
      });

      // Spawn a syntax bug occasionally if fewer than 5 enemies
      if (enemies.length < 5 && Math.random() < 0.45) {
        enemies.push(
          new Enemy({
            type: 'bug',
            x: this.x + 20,
            y: 595,
            minX: this.minX,
            maxX: this.maxX
          })
        );
      }
    }
  }

  draw(ctx, time) {
    if (window.cyberSprites && window.cyberSprites.drawBoss(ctx, this, time)) {
      return;
    }
    if (this.dead) return;
    ctx.save();
    if (this.hitFlash > 0) ctx.filter = 'brightness(2.0)';

    // Giant Server Monolith Body
    ctx.fillStyle = '#212121';
    ctx.strokeStyle = '#ff1744';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.w, this.h, 12);
    ctx.fill();
    ctx.stroke();

    // Angry Evil Screen Face
    ctx.fillStyle = '#3e0000';
    ctx.fillRect(this.x + 14, this.y + 16, this.w - 28, 52);

    // Glowing Red Eyes
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(this.x + 26, this.y + 28, 20, 12);
    ctx.fillRect(this.x + this.w - 46, this.y + 28, 20, 12);

    // Server rack blinking LEDs
    for (let i = 0; i < 3; i++) {
      const ry = this.y + 80 + i * 16;
      ctx.fillStyle = '#424242';
      ctx.fillRect(this.x + 14, ry, this.w - 28, 10);
      ctx.fillStyle = (Math.floor(time / 150) + i) % 2 === 0 ? '#00e676' : '#ff1744';
      ctx.beginPath();
      ctx.arc(this.x + 24, ry + 5, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#ffeb3b';
    ctx.font = '900 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DEPLOY 18H', this.x + this.w / 2, this.y + 58);

    // Boss Overhead Health Bar
    const bw = 150;
    const bx = this.x + this.w / 2 - bw / 2;
    const by = this.y - 24;
    ctx.fillStyle = '#111';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.fillRect(bx, by, bw, 12);
    ctx.strokeRect(bx, by, bw, 12);
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(bx + 2, by + 2, (bw - 4) * Math.max(0, this.hp / this.maxHp), 8);

    ctx.restore();
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.w = 32;
    this.h = 32;
    this.type = type; // 'coffee', 'duck', 'star'
    this.vy = -5.5;
    this.vx = 1.2;
    this.collected = false;
  }

  update(platforms) {
    this.vy = Math.min(this.vy + 0.35, 8);
    this.x += this.vx;
    this.y += this.vy;

    for (const p of platforms) {
      if (
        this.x + this.w > p.x &&
        this.x < p.x + p.w &&
        this.y + this.h >= p.y &&
        this.y + this.h - this.vy <= p.y + 14 &&
        this.vy >= 0
      ) {
        this.y = p.y - this.h;
        this.vy = 0;
      }
    }
  }

  draw(ctx, time) {
    ctx.save();
    const bob = Math.sin(time * 0.008) * 3;
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2 + bob;

    ctx.beginPath();
    ctx.arc(cx, cy, 17, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icon = this.type === 'coffee' ? '☕' : (this.type === 'duck' ? '🦆' : '⭐');
    ctx.fillText(icon, cx, cy);
    ctx.restore();
  }
}

window.CHAR_CONFIG = CHAR_CONFIG;
window.Player = Player;
window.Projectile = Projectile;
window.Enemy = Enemy;
window.Boss = Boss;
window.PowerUp = PowerUp;

