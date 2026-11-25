// Main 2D Game Engine — Super Tech Bros: Deploy Defense

(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // HUD & UI Elements
  const healthFill = document.getElementById('healthFill');
  const healthText = document.getElementById('healthText');
  const coinCountEl = document.getElementById('coinCount');
  const scoreCountEl = document.getElementById('scoreCount');
  const seniorityBadgeEl = document.getElementById('seniorityBadge');
  const specialFillEl = document.getElementById('specialFill');
  const stageTitleBadge = document.getElementById('stageTitleBadge');
  const bannerTitle = document.getElementById('bannerTitle');
  const activeCharEmoji = document.getElementById('activeCharEmoji');
  const activeCharName = document.getElementById('activeCharName');
  const modalOverlay = document.getElementById('modalOverlay');
  const optionsModal = document.getElementById('optionsModal');
  const toastBanner = document.getElementById('toastBanner');

  // Game State
  let currentLevelIdx = 0;
  let selectedChar = 'programmer';
  let difficulty = 1.0;
  let particlesEnabled = true;
  let isPaused = false; // Starts live in background so user immediately sees the lush world!
  let modalOpen = false; // Let's allow immediate play or modal toggle

  let level = null;
  let player = null;
  let cameraX = 0;
  let coins = [];
  let mysteryBlocks = [];
  let powerUps = [];
  let enemies = [];
  let boss = null;
  let projectiles = [];
  let enemyProjectiles = [];
  let floatingTexts = [];
  let particles = [];
  let sparkles = [];

  let score = 0;
  let coinTotal = 0;
  let keys = {};
  let toastTimeout = null;

  // Initialize ambient sparkles (like the golden stars in the reference image)
  function initSparkles(worldW) {
    sparkles = [];
    for (let i = 0; i < 45; i++) {
      sparkles.push({
        x: 120 + Math.random() * (worldW - 240),
        y: 120 + Math.random() * 500,
        size: 3 + Math.random() * 5,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function showToast(msg, duration = 2600) {
    toastBanner.textContent = msg;
    toastBanner.classList.remove('hidden');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastBanner.classList.add('hidden');
    }, duration);
  }

  function spawnFloatingText(x, y, text, color = '#ffeb3b') {
    floatingTexts.push({ x, y, text, color, life: 50, vy: -1.3 });
  }

  function spawnParticles(x, y, color, count = 10) {
    if (!particlesEnabled) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 4.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 1.5,
        color,
        size: 3 + Math.random() * 4,
        life: 22 + Math.floor(Math.random() * 18)
      });
    }
  }

  function loadLevel(idx, keepStats = false) {
    currentLevelIdx = idx % window.LEVELS.length;
    const raw = window.LEVELS[currentLevelIdx];
    level = JSON.parse(JSON.stringify(raw));

    const prevSen = keepStats && player ? player.seniority : 1;
    const prevDuck = keepStats && player ? player.hasDuckShield : false;

    player = new window.Player(level.playerStart.x, level.playerStart.y, selectedChar);
    player.seniority = prevSen;
    player.hasDuckShield = prevDuck;

    cameraX = 0;
    coins = level.coins.map(c => ({ ...c, collected: false }));
    mysteryBlocks = level.mysteryBlocks.map(b => ({ ...b, bumpOffset: 0 }));
    powerUps = [];
    projectiles = [];
    enemyProjectiles = [];
    floatingTexts = [];
    particles = [];

    enemies = level.enemies.map(e => new window.Enemy(e, difficulty));
    boss = level.boss ? new window.Boss(level.boss, difficulty) : null;

    initSparkles(level.worldWidth);

    stageTitleBadge.textContent = level.name;
    bannerTitle.textContent = level.banner;

    // Update stage buttons in modal
    document.querySelectorAll('.stage-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === currentLevelIdx);
    });

    updateHUD();
    showToast(`🚀 ${level.name} — Herói: ${player.cfg.name}!`);
  }

  function switchCharacter(charId) {
    if (!window.CHAR_CONFIG[charId]) return;
    selectedChar = charId;
    if (player) {
      player.setCharacter(charId, false);
      spawnParticles(player.x + player.w / 2, player.y + player.h / 2, player.cfg.color, 16);
      spawnFloatingText(player.x + player.w / 2, player.y - 10, `CLASSE: ${player.cfg.name.toUpperCase()}!`, player.cfg.color);
      window.sfx.powerupCollect();
    }

    // Update UI badges
    const cfg = window.CHAR_CONFIG[charId];
    activeCharEmoji.textContent = cfg.emoji;
    activeCharName.textContent = cfg.shortName;

    document.querySelectorAll('.mini-char-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.char === charId);
    });
    document.querySelectorAll('.char-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.selectChar === charId);
    });

    updateHUD();
  }

  function updateHUD() {
    if (!player) return;
    const pct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
    healthFill.style.width = `${pct}%`;
    healthText.textContent = `${Math.max(0, Math.ceil(player.hp))} / ${player.maxHp}`;

    if (pct > 50) {
      healthFill.style.background = 'linear-gradient(180deg, #a6ff4d 0%, #68d81b 55%, #46a808 100%)';
    } else if (pct > 25) {
      healthFill.style.background = 'linear-gradient(180deg, #ffee58 0%, #fbc02d 55%, #f57f17 100%)';
    } else {
      healthFill.style.background = 'linear-gradient(180deg, #ff5252 0%, #d50000 100%)';
    }

    coinCountEl.textContent = coinTotal;
    scoreCountEl.textContent = score;
    seniorityBadgeEl.textContent = player.getSeniorityTitle();
    specialFillEl.style.width = `${Math.floor(player.specialEnergy)}%`;
  }

  // Player Shooting Action
  function fireWeapon() {
    if (!player || isPaused || modalOpen || player.fireTimer > 0) return;
    player.fireTimer = player.cfg.fireCooldown;
    window.sfx.shoot(player.charType);

    const dir = player.facing;
    const sx = dir > 0 ? player.x + player.w + 2 : player.x - 24;
    const sy = player.y + 18;

    if (player.charType === 'programmer') {
      // Dev: Fast code bursts; shoots 2 parallel streams at Pleno+
      projectiles.push(new window.Projectile(sx, sy, dir * 10.5, 0, 'player', 'programmer', player.seniority));
      if (player.seniority >= 2) {
        projectiles.push(new window.Projectile(sx, sy - 12, dir * 10.5, -0.6, 'player', 'programmer', player.seniority));
      }
      if (player.seniority >= 3) {
        projectiles.push(new window.Projectile(sx, sy + 10, dir * 10.5, 0.6, 'player', 'programmer', player.seniority));
      }
    } else if (player.charType === 'tester') {
      // QA: High-speed piercing Assertion Beam
      projectiles.push(new window.Projectile(sx, sy, dir * 13.5, 0, 'player', 'tester', player.seniority));
      if (player.seniority >= 2) {
        projectiles.push(new window.Projectile(sx, sy - 10, dir * 12.5, -1.2, 'player', 'tester', player.seniority));
      }
    } else {
      // Intern: 3-Way StackOverflow Copy-Paste Spread!
      const spreads = player.seniority >= 2 ? [-2.6, -1.2, 0, 1.2, 2.6] : [-2.0, 0, 2.0];
      spreads.forEach(vy => {
        projectiles.push(new window.Projectile(sx, sy, dir * 9.5, vy, 'player', 'intern', player.seniority));
      });
    }
  }

  // Player Ultimate / Special Attack
  function triggerUltimate() {
    if (!player || isPaused || modalOpen) return;
    if (player.specialEnergy < 100) {
      showToast(`⚡ Energia de Ultimate em ${Math.floor(player.specialEnergy)}% — Elimine bugs ou pegue moedas!`);
      return;
    }

    player.specialEnergy = 0;
    window.sfx.special();
    updateHUD();

    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;

    if (player.charType === 'programmer') {
      // Giant git push --force wave in both directions
      showToast('💻 ULTIMATE: git push --force origin main!');
      projectiles.push(new window.Projectile(cx, cy - 18, player.facing * 12, 0, 'player', 'programmer', player.seniority, true));
      projectiles.push(new window.Projectile(cx, cy - 46, player.facing * 11, -1.5, 'player', 'programmer', player.seniority, true));
      projectiles.push(new window.Projectile(cx, cy + 10, player.facing * 11, 1.5, 'player', 'programmer', player.seniority, true));
    } else if (player.charType === 'tester') {
      // 360-degree Automated Regression Test Suite
      showToast('🕵️‍♂️ ULTIMATE: Suíte de Testes Automatizados 360°!');
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        projectiles.push(
          new window.Projectile(
            cx - 20,
            cy - 15,
            Math.cos(ang) * 10,
            Math.sin(ang) * 10,
            'player',
            'tester',
            player.seniority,
            true
          )
        );
      }
    } else {
      // Intern: Super Mario Star Mode (Overdose de Café / Deploy na Sexta)
      showToast('☕ ULTIMATE: OVERDOSE DE CAFÉ — Invencibilidade + Turbo!');
      player.starTimer = 360; // 6 seconds at 60fps
      player.hp = Math.min(player.maxHp, player.hp + 25);
    }

    spawnParticles(cx, cy, '#ffea00', 28);
    updateHUD();
  }

  function triggerMysteryBlock(block) {
    if (block.hit) return;
    block.hit = true;
    block.bumpOffset = -12;
    window.sfx.blockBump();

    if (block.content === 'coins') {
      coinTotal += 5;
      score += 250;
      player.specialEnergy = Math.min(100, player.specialEnergy + 25);
      window.sfx.coin();
      spawnFloatingText(block.x + 22, block.y - 12, '+5 MOEDAS DEPLOY!', '#ffd700');
      spawnParticles(block.x + 22, block.y, '#ffd700', 16);
    } else {
      window.sfx.powerupSpawn();
      powerUps.push(new window.PowerUp(block.x + 6, block.y - 34, block.content));
      const label = block.content === 'coffee' ? '☕ CAFÉ EXPRESSO!' : (block.content === 'duck' ? '🦆 RUBBER DUCK!' : '⭐ DEPLOY TURBO!');
      spawnFloatingText(block.x + 22, block.y - 14, label, '#00e5ff');
    }
    updateHUD();
  }

  function damagePlayer(amount, sourceLabel = 'BUG') {
    if (player.invincibleTimer > 0 || player.starTimer > 0) return;

    if (player.hasDuckShield) {
      player.hasDuckShield = false;
      player.invincibleTimer = 60;
      window.sfx.blockBump();
      spawnFloatingText(player.x + 18, player.y - 12, '🦆 PATO BLOQUEOU O BUG!', '#ffeb3b');
      spawnParticles(player.x + 18, player.y + 20, '#ffeb3b', 18);
      return;
    }

    player.hp -= amount;
    player.invincibleTimer = 55;
    window.sfx.hurt();
    spawnFloatingText(player.x + 18, player.y - 10, `-${amount} HP (${sourceLabel})`, '#ff5252');
    spawnParticles(player.x + 18, player.y + 24, '#ff5252', 14);
    updateHUD();

    if (player.hp <= 0) {
      showToast('💥 Rollback! Sistema caiu em produção — Reiniciando Sprint...');
      loadLevel(currentLevelIdx, false);
    }
  }

  function jumpAction() {
    if (!player || isPaused || modalOpen) return;
    if (player.onGround || player.onLadder) {
      player.vy = -player.cfg.jumpForce;
      player.onGround = false;
      player.onLadder = false;
      player.jumpsLeft = player.cfg.maxJumps - 1;
      window.sfx.jump();
      spawnParticles(player.x + player.w / 2, player.y + player.h, '#ffffff', 6);
    } else if (player.jumpsLeft > 0) {
      player.vy = -player.cfg.jumpForce * 0.92;
      player.jumpsLeft--;
      window.sfx.jump();
      spawnFloatingText(player.x + 18, player.y + 10, 'await jump()', '#00e5ff');
      spawnParticles(player.x + player.w / 2, player.y + player.h, '#00e5ff', 8);
    }
  }

  // ==================== MAIN PHYSICS & GAMEPLAY UPDATE ====================
  function update(time) {
    if (isPaused || modalOpen || !player || !level) return;

    if (player.fireTimer > 0) player.fireTimer--;
    if (player.invincibleTimer > 0) player.invincibleTimer--;
    if (player.starTimer > 0) {
      player.starTimer--;
      if (player.starTimer % 12 === 0) {
        // Star mode shoots mini rubber ducks automatically
        projectiles.push(
          new window.Projectile(
            player.x + player.w / 2,
            player.y + 16,
            player.facing * 11,
            (Math.random() - 0.5) * 4,
            'player',
            player.charType,
            player.seniority
          )
        );
      }
    }

    // Horizontal Movement
    const moveLeft = keys['ArrowLeft'] || keys['KeyA'];
    const moveRight = keys['ArrowRight'] || keys['KeyD'];
    const moveUp = keys['ArrowUp'] || keys['KeyW'];
    const moveDown = keys['ArrowDown'] || keys['KeyS'];
    const shooting = keys['KeyJ'] || keys['KeyZ'] || keys['KeyF'];

    const speedMult = player.starTimer > 0 ? 1.3 : 1.0;
    if (moveLeft) {
      player.vx = -player.cfg.speed * speedMult;
      player.facing = -1;
    } else if (moveRight) {
      player.vx = player.cfg.speed * speedMult;
      player.facing = 1;
    } else {
      player.vx *= 0.78;
      if (Math.abs(player.vx) < 0.1) player.vx = 0;
    }

    if (shooting) fireWeapon();

    // Check Wooden Ladder Overlap
    const pCenterX = player.x + player.w / 2;
    let touchingLadder = null;
    for (const lad of level.ladders) {
      if (
        pCenterX >= lad.x - 10 &&
        pCenterX <= lad.x + 48 &&
        player.y + player.h >= lad.y - 10 &&
        player.y <= lad.y + lad.h
      ) {
        touchingLadder = lad;
        break;
      }
    }

    if (touchingLadder && (moveUp || moveDown)) {
      player.onLadder = true;
      player.jumpsLeft = player.cfg.maxJumps;
    } else if (!touchingLadder) {
      player.onLadder = false;
    }

    if (player.onLadder && touchingLadder) {
      player.vy = 0;
      if (moveUp) player.vy = -4.2;
      if (moveDown) player.vy = 4.2;
    } else {
      // Gravity
      player.vy = Math.min(player.vy + 0.58, 13.5);
    }

    // Apply Horizontal velocity & world bounds
    player.x += player.vx;
    if (player.x < 20) player.x = 20;
    if (player.x + player.w > level.worldWidth - 20) {
      player.x = level.worldWidth - 20 - player.w;
    }

    // Horizontal collision with solid stone walls & server pipes
    for (const p of level.platforms) {
      if (p.type === 'stone_wall' || p.type === 'server') {
        if (
          player.x + player.w > p.x &&
          player.x < p.x + p.w &&
          player.y + player.h > p.y + 8 &&
          player.y < p.y + p.h - 8
        ) {
          if (player.vx > 0) player.x = p.x - player.w;
          else if (player.vx < 0) player.x = p.x + p.w;
        }
      }
    }

    // Apply Vertical velocity
    const prevBottom = player.y + player.h;
    const prevTop = player.y;
    player.y += player.vy;
    player.onGround = false;

    // Platform Landing Collisions
    for (const p of level.platforms) {
      const horizOverlap = player.x + player.w - 6 > p.x && player.x + 6 < p.x + p.w;
      if (!horizOverlap) continue;

      // Landing on top of platform (allow climbing down if pressing Down on a ladder)
      const climbingDown = player.onLadder && moveDown;
      if (!climbingDown && player.vy >= 0 && prevBottom <= p.y + 14 && player.y + player.h >= p.y) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.onGround = true;
        player.onLadder = false;
        player.jumpsLeft = player.cfg.maxJumps;
      }
    }

    // Mystery Blocks [?] Collisions (Stand on top OR Mario head-bump from below!)
    for (const b of mysteryBlocks) {
      if (b.bumpOffset < 0) b.bumpOffset += 1.5;
      const bw = 44;
      const bh = 44;
      const horizOverlap = player.x + player.w - 4 > b.x && player.x + 4 < b.x + bw;
      if (!horizOverlap) continue;

      // Landing on top of block
      if (player.vy >= 0 && prevBottom <= b.y + 10 && player.y + player.h >= b.y) {
        player.y = b.y - player.h;
        player.vy = 0;
        player.onGround = true;
        player.jumpsLeft = player.cfg.maxJumps;
      }
      // Hitting block from below with head (Super Mario style!)
      else if (player.vy < 0 && prevTop >= b.y + bh - 10 && player.y <= b.y + bh) {
        player.y = b.y + bh;
        player.vy = 2.5;
        triggerMysteryBlock(b);
      }
    }

    // Fall into abyss check
    if (player.y > 780) {
      damagePlayer(35, 'STACK OVERFLOW');
      player.x = Math.max(180, player.x - 160);
      player.y = 220;
      player.vy = 0;
    }

    // Smooth Camera Follow (keeps reference scene framed at start of Sprint 1)
    const targetCamX = Math.max(0, Math.min(level.worldWidth - canvas.width, player.x - canvas.width * 0.38));
    cameraX += (targetCamX - cameraX) * 0.1;

    // Collect Gold Deploy Coins
    for (const c of coins) {
      if (c.collected) continue;
      const dx = (player.x + player.w / 2) - c.x;
      const dy = (player.y + player.h / 2) - c.y;
      if (Math.hypot(dx, dy) < 34) {
        c.collected = true;
        coinTotal++;
        score += 50;
        player.specialEnergy = Math.min(100, player.specialEnergy + 8);
        window.sfx.coin();
        spawnFloatingText(c.x, c.y - 10, '+50 ₿', '#ffd700');
        spawnParticles(c.x, c.y, '#ffd700', 8);
        updateHUD();
      }
    }

    // Update & Collect PowerUps
    for (const pu of powerUps) {
      if (pu.collected) continue;
      pu.update(level.platforms);
      if (
        player.x + player.w > pu.x &&
        player.x < pu.x + pu.w &&
        player.y + player.h > pu.y &&
        player.y < pu.y + pu.h
      ) {
        pu.collected = true;
        window.sfx.powerupCollect();
        if (pu.type === 'coffee') {
          player.seniority = Math.min(4, player.seniority + 1);
          player.hp = Math.min(player.maxHp, player.hp + 35);
          spawnFloatingText(pu.x, pu.y - 12, `PROMOVIDO: ${player.getSeniorityTitle()}!`, '#76ff03');
        } else if (pu.type === 'duck') {
          player.hasDuckShield = true;
          spawnFloatingText(pu.x, pu.y - 12, '🦆 ESCUDO RUBBER DUCK ATIVO!', '#ffeb3b');
        } else if (pu.type === 'star') {
          player.starTimer = 360;
          spawnFloatingText(pu.x, pu.y - 12, '⭐ DEPLOY TURBO INVENCÍVEL!', '#00e5ff');
        }
        spawnParticles(pu.x + 16, pu.y + 16, '#76ff03', 18);
        updateHUD();
      }
    }

    // Update Player Projectiles
    for (const proj of projectiles) {
      proj.update();

      // Check if projectile hits a Mystery Block [?]
      for (const b of mysteryBlocks) {
        if (
          !b.hit &&
          proj.x + proj.w > b.x &&
          proj.x < b.x + 44 &&
          proj.y + proj.h > b.y &&
          proj.y < b.y + 44
        ) {
          triggerMysteryBlock(b);
          if (!proj.piercing) proj.dead = true;
        }
      }

      // Check collision with Enemies
      for (const en of enemies) {
        if (en.dead || proj.hitIds.has(en.id)) continue;
        if (
          proj.x + proj.w > en.x &&
          proj.x < en.x + en.w &&
          proj.y + proj.h > en.y &&
          proj.y < en.y + en.h
        ) {
          proj.hitIds.add(en.id);
          if (!proj.piercing) proj.dead = true;

          // Tester does bonus Critical Bug Damage
          const dmg = player.charType === 'tester' ? Math.round(proj.damage * 1.25) : proj.damage;
          en.hp -= dmg;
          en.hitFlash = 6;
          window.sfx.enemyHit();
          spawnParticles(proj.x, proj.y, proj.color, 6);

          if (en.hp <= 0) {
            defeatEnemy(en);
          }
        }
      }

      // Check collision with Boss
      if (boss && !boss.dead && !proj.hitIds.has('boss')) {
        if (
          proj.x + proj.w > boss.x &&
          proj.x < boss.x + boss.w &&
          proj.y + proj.h > boss.y &&
          proj.y < boss.y + boss.h
        ) {
          proj.hitIds.add('boss');
          if (!proj.piercing) proj.dead = true;
          boss.hp -= proj.damage;
          boss.hitFlash = 5;
          window.sfx.enemyHit();
          spawnParticles(proj.x, proj.y, '#ff1744', 8);

          if (boss.hp <= 0) {
            boss.dead = true;
            score += 2000;
            window.sfx.victory();
            spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, '#ffea00', 45);
            spawnFloatingText(boss.x + 40, boss.y, 'MONOLITO REFATORADO! +2000', '#76ff03');
            showToast('🏆 BOSS DERROTADO! Corra até o Servidor de Produção à direita!');
            updateHUD();
          }
        }
      }
    }
    projectiles = projectiles.filter(p => !p.dead);

    // Update Enemy Projectiles
    for (const ep of enemyProjectiles) {
      ep.update();
      if (
        ep.x + ep.w > player.x &&
        ep.x < player.x + player.w &&
        ep.y + ep.h > player.y &&
        ep.y < player.y + player.h
      ) {
        ep.dead = true;
        damagePlayer(ep.damage, ep.label);
      }
    }
    enemyProjectiles = enemyProjectiles.filter(ep => !ep.dead);

    // Update Enemies & Check Mario Stomp vs Body Collision
    for (const en of enemies) {
      if (en.dead) continue;
      en.update(time, player, enemyProjectiles);

      if (
        player.x + player.w - 4 > en.x &&
        player.x + 4 < en.x + en.w &&
        player.y + player.h > en.y &&
        player.y < en.y + en.h
      ) {
        // Star invincibility OR Super Mario Stomp from above!
        const isStomp = player.vy > 0 && prevBottom <= en.y + 18;
        if (player.starTimer > 0 || isStomp) {
          if (isStomp) {
            player.vy = -10.5; // Mario bounce!
            player.jumpsLeft = player.cfg.maxJumps;
          }
          window.sfx.stomp();
          defeatEnemy(en);
        } else {
          damagePlayer(18, en.name);
        }
      }
    }
    enemies = enemies.filter(e => !e.dead);

    // Update Boss
    if (boss && !boss.dead) {
      boss.update(time, player, enemyProjectiles, enemies);
      if (
        player.x + player.w - 6 > boss.x &&
        player.x + 6 < boss.x + boss.w &&
        player.y + player.h > boss.y &&
        player.y < boss.y + boss.h
      ) {
        if (player.vy > 0 && prevBottom <= boss.y + 20) {
          player.vy = -12;
          boss.hp -= 35;
          boss.hitFlash = 8;
          window.sfx.stomp();
          spawnFloatingText(boss.x + 40, boss.y - 10, 'HOTFIX STOMP! -35', '#ffea00');
        } else {
          damagePlayer(24, 'DEPLOY 18H');
        }
      }
    }

    // Check Goal / Production Deploy Server Flagpole
    if (Math.abs((player.x + player.w / 2) - level.goalX) < 48 && player.y + player.h >= level.goalY - 160) {
      if (boss && !boss.dead) {
        showToast('⚠️ Derrote o Monolito de Produção antes de fazer o Deploy!');
      } else {
        window.sfx.victory();
        score += 500;
        const nextIdx = (currentLevelIdx + 1) % window.LEVELS.length;
        showToast(`🎉 SPRINT CONCLUÍDA COM SUCESSO! Avançando para ${window.LEVELS[nextIdx].name}...`, 3500);
        loadLevel(nextIdx, true);
      }
    }

    // Update Particles & Floating Texts
    for (const pt of particles) {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.18;
      pt.life--;
    }
    particles = particles.filter(pt => pt.life > 0);

    for (const ft of floatingTexts) {
      ft.y += ft.vy;
      ft.life--;
    }
    floatingTexts = floatingTexts.filter(ft => ft.life > 0);
  }

  function defeatEnemy(en) {
    en.dead = true;
    score += en.scoreValue;
    player.specialEnergy = Math.min(100, player.specialEnergy + 16);
    spawnParticles(en.x + en.w / 2, en.y + en.h / 2, '#76ff03', 14);
    spawnFloatingText(en.x + en.w / 2, en.y - 8, `FIXED! +${en.scoreValue}`, '#76ff03');

    // Merge Conflict splits into 2 mini conflicts!
    if (en.type === 'conflict') {
      enemies.push(new window.Enemy({ type: 'mini_conflict', x: en.x - 12, y: en.y + 12, minX: en.minX, maxX: en.maxX }, difficulty));
      enemies.push(new window.Enemy({ type: 'mini_conflict', x: en.x + 18, y: en.y + 12, minX: en.minX, maxX: en.maxX }, difficulty));
    }

    updateHUD();
  }

  // ==================== RENDERING (2D Game Design Pack Aesthetic) ====================
  function drawBackground(time) {
    // Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, level.skyTop);
    skyGrad.addColorStop(1, level.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Soft Fluffy Clouds (Parallax 0.15)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    for (let i = 0; i < 9; i++) {
      const cx = ((i * 380 - cameraX * 0.15) % (canvas.width + 400) + (canvas.width + 400)) % (canvas.width + 400) - 150;
      const cy = 90 + (i % 3) * 65;
      ctx.beginPath();
      ctx.arc(cx, cy, 42, 0, Math.PI * 2);
      ctx.arc(cx + 34, cy - 10, 52, 0, Math.PI * 2);
      ctx.arc(cx + 72, cy, 38, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant Parallax Mountains & Floating Crags (Matches Reference Image!)
    const peaks = [
      { x: 180, y: 240, w: 220, h: 420, color: '#6b8ba4' },
      { x: 380, y: 170, w: 210, h: 320, color: '#78909c', floating: true },
      { x: 680, y: 310, w: 300, h: 380, color: '#5c7c94' },
      { x: 1080, y: 220, w: 260, h: 440, color: '#6b8ba4' },
      { x: 1550, y: 200, w: 250, h: 460, color: '#78909c', floating: true },
      { x: 2050, y: 250, w: 320, h: 430, color: '#5c7c94' }
    ];

    peaks.forEach(pk => {
      const px = pk.x - cameraX * 0.35;
      if (px + pk.w < -100 || px > canvas.width + 100) return;

      ctx.save();
      // Faceted Rocky Peak
      ctx.fillStyle = pk.color;
      ctx.beginPath();
      ctx.moveTo(px, pk.y + pk.h);
      ctx.lineTo(px + pk.w * 0.25, pk.y + 45);
      ctx.lineTo(px + pk.w * 0.5, pk.y);
      ctx.lineTo(px + pk.w * 0.78, pk.y + 55);
      ctx.lineTo(px + pk.w, pk.y + pk.h);
      ctx.closePath();
      ctx.fill();

      // Lighter rock facet highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.beginPath();
      ctx.moveTo(px + pk.w * 0.5, pk.y);
      ctx.lineTo(px + pk.w * 0.78, pk.y + 55);
      ctx.lineTo(px + pk.w * 0.55, pk.y + pk.h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // Distant lush green hills at horizon
    ctx.fillStyle = 'rgba(76, 175, 80, 0.35)';
    for (let i = 0; i < 8; i++) {
      const hx = i * 320 - (cameraX * 0.25) % 320;
      ctx.beginPath();
      ctx.arc(hx, 680, 210, Math.PI, 0, false);
      ctx.fill();
    }
  }

  // Draw Grass-Topped Dirt & Stone Tiles (Reference Image Style)
  function drawPlatform(p) {
    const tileSize = 46;
    const cols = Math.max(1, Math.round(p.w / tileSize));
    const rows = Math.max(1, Math.round(p.h / tileSize));
    const cellW = p.w / cols;
    const cellH = p.h / rows;

    if (p.type === 'server') {
      // Super Mario style metallic Server Pipe
      const grad = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y);
      grad.addColorStop(0, '#263238');
      grad.addColorStop(0.35, '#607d8b');
      grad.addColorStop(1, '#1c262b');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;

      // Pipe body
      ctx.fillRect(p.x + 6, p.y + 24, p.w - 12, p.h - 24);
      ctx.strokeRect(p.x + 6, p.y + 24, p.w - 12, p.h - 24);
      // Pipe rim
      ctx.fillRect(p.x, p.y, p.w, 26);
      ctx.strokeRect(p.x, p.y, p.w, 26);

      // Glowing server label
      ctx.fillStyle = '#00e5ff';
      ctx.font = '900 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.label || 'SRV', p.x + p.w / 2, p.y + 17);
      return;
    }

    // Hanging Vines underneath platform (like the reference image)
    if (p.vines) {
      ctx.strokeStyle = '#33691e';
      ctx.lineWidth = 2.5;
      for (let vx = p.x + 18; vx < p.x + p.w - 14; vx += 28) {
        const vLen = 18 + ((vx * 13) % 26);
        ctx.beginPath();
        ctx.moveTo(vx, p.y + p.h - 4);
        ctx.quadraticCurveTo(vx + 6, p.y + p.h + vLen * 0.5, vx - 2, p.y + p.h + vLen);
        ctx.stroke();
      }
    }

    // Draw Brown Stone/Dirt Tiles
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tx = p.x + c * cellW;
        const ty = p.y + r * cellH;

        // Rich brown block base
        ctx.fillStyle = '#6d4428';
        ctx.strokeStyle = '#3b2110';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(tx + 1, ty + 1, cellW - 2, cellH - 2, 5);
        ctx.fill();
        ctx.stroke();

        // Inner beveled highlight
        ctx.strokeStyle = 'rgba(255, 204, 153, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(tx + 4, ty + 4, cellW - 8, cellH - 8);

        // Decorative stone facet lines
        ctx.fillStyle = '#53321b';
        ctx.beginPath();
        ctx.arc(tx + cellW * 0.35, ty + cellH * 0.6, 5, 0, Math.PI * 2);
        ctx.arc(tx + cellW * 0.7, ty + cellH * 0.45, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Lush Green Grass Cap on Top (for 'grass' platforms)
    if (p.type === 'grass') {
      const grassGrad = ctx.createLinearGradient(0, p.y - 6, 0, p.y + 18);
      grassGrad.addColorStop(0, '#9cff2e');
      grassGrad.addColorStop(0.55, '#56c914');
      grassGrad.addColorStop(1, '#2e7d0b');

      ctx.fillStyle = grassGrad;
      ctx.strokeStyle = '#1f5406';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(p.x - 3, p.y - 5, p.w + 6, 18, 8);
      ctx.fill();
      ctx.stroke();

      // Grass blades & tufts sticking up
      ctx.fillStyle = '#76ff03';
      for (let gx = p.x + 8; gx < p.x + p.w - 10; gx += 18) {
        ctx.beginPath();
        ctx.moveTo(gx, p.y - 3);
        ctx.lineTo(gx + 4, p.y - 12);
        ctx.lineTo(gx + 8, p.y - 3);
        ctx.fill();
      }
    }
  }

  // Draw Wooden Ladder (Reference Image Style)
  function drawLadder(lad) {
    const w = 38;
    ctx.save();
    // Side rails
    ctx.fillStyle = '#9c5a25';
    ctx.strokeStyle = '#4a2608';
    ctx.lineWidth = 2;

    ctx.fillRect(lad.x, lad.y, 7, lad.h);
    ctx.strokeRect(lad.x, lad.y, 7, lad.h);

    ctx.fillRect(lad.x + w - 7, lad.y, 7, lad.h);
    ctx.strokeRect(lad.x + w - 7, lad.y, 7, lad.h);

    // Horizontal wooden rungs
    for (let ry = lad.y + 10; ry < lad.y + lad.h - 6; ry += 20) {
      ctx.fillStyle = '#b86f32';
      ctx.beginPath();
      ctx.roundRect(lad.x - 2, ry, w + 4, 7, 3);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw Lush Trees & Boulders (Reference Image Style)
  function drawDecoration(d) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.scale(d.scale || 1, d.scale || 1);

    if (d.type === 'rock') {
      // Faceted Gray Stone Boulder
      ctx.fillStyle = '#607d8b';
      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(-20, -24);
      ctx.lineTo(-4, -34);
      ctx.lineTo(16, -26);
      ctx.lineTo(24, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#90a4ae';
      ctx.beginPath();
      ctx.moveTo(-20, -24);
      ctx.lineTo(-4, -34);
      ctx.lineTo(2, -14);
      ctx.closePath();
      ctx.fill();
    } else if (d.type === 'tree') {
      // Curved Brown Trunk
      ctx.fillStyle = '#5d3a1a';
      ctx.strokeStyle = '#2e1a08';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.quadraticCurveTo(-6, -40, -14, -75);
      ctx.lineTo(14, -75);
      ctx.quadraticCurveTo(6, -40, 10, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Lush 3-Cluster Glossy Green Canopy
      const blobs = [
        { cx: -26, cy: -78, r: 28 },
        { cx: 26, cy: -76, r: 26 },
        { cx: 0, cy: -98, r: 34 }
      ];
      blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.cx - 8, b.cy - 10, 4, b.cx, b.cy, b.r);
        g.addColorStop(0, '#b2ff59');
        g.addColorStop(0.55, '#55c914');
        g.addColorStop(1, '#256605');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.cx, b.cy, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1b4d03';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
    ctx.restore();
  }

  // Draw Super Mario Style [?] Mystery Block
  function drawMysteryBlock(b, time) {
    const by = b.y + (b.bumpOffset || 0);
    ctx.save();
    if (b.hit) {
      ctx.fillStyle = '#78909c';
      ctx.strokeStyle = '#263238';
    } else {
      const pulse = Math.sin(time * 0.008) * 15;
      ctx.fillStyle = `rgb(255, ${185 + pulse}, 0)`;
      ctx.strokeStyle = '#fff';
    }
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(b.x, by, 44, 44, 7);
    ctx.fill();
    ctx.stroke();

    // Corner rivets
    ctx.fillStyle = '#3e2723';
    [[5, 5], [35, 5], [5, 35], [35, 35]].forEach(([rx, ry]) => {
      ctx.fillRect(b.x + rx, by + ry, 4, 4);
    });

    ctx.fillStyle = b.hit ? '#cfd8dc' : '#3e2723';
    ctx.font = '900 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.hit ? '✓' : '?', b.x + 22, by + 23);
    ctx.restore();
  }

  // Draw Gold Coin (Exact match to Reference Image Gold Diamond-Circle Coins)
  function drawCoin(c, time) {
    if (c.collected) return;
    const bob = Math.sin(time * 0.006 + c.x * 0.05) * 4;
    const cy = c.y + bob;

    ctx.save();
    const grad = ctx.createRadialGradient(c.x - 5, cy - 5, 2, c.x, cy, 18);
    grad.addColorStop(0, '#fff59d');
    grad.addColorStop(0.55, '#ffc107');
    grad.addColorStop(1, '#e65100');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.x, cy, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner diamond emblem (just like the reference image coins)
    ctx.strokeStyle = '#b26a00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x, cy - 8);
    ctx.lineTo(c.x + 8, cy);
    ctx.lineTo(c.x, cy + 8);
    ctx.lineTo(c.x - 8, cy);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  // Draw End-of-Sprint Production Deploy Server Gate / Flagpole
  function drawGoalGate(time) {
    const gx = level.goalX;
    const gy = level.goalY;

    ctx.save();
    // Base pedestal
    ctx.fillStyle = '#263238';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 3;
    ctx.fillRect(gx - 32, gy - 24, 64, 24);
    ctx.strokeRect(gx - 32, gy - 24, 64, 24);

    // Flagpole mast
    ctx.fillStyle = '#eceff1';
    ctx.fillRect(gx - 4, gy - 210, 8, 186);

    // Top glowing orb
    ctx.fillStyle = '#00e676';
    ctx.beginPath();
    ctx.arc(gx, gy - 216, 12, 0, Math.PI * 2);
    ctx.fill();

    // Waving DEPLOY Banner
    const wave = Math.sin(time * 0.008) * 6;
    ctx.fillStyle = '#00c853';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx + 4, gy - 200);
    ctx.lineTo(gx + 108, gy - 185 + wave);
    ctx.lineTo(gx + 4, gy - 160);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '900 11px monospace';
    ctx.fillText('DEPLOY OK', gx + 14, gy - 178 + wave * 0.5);
    ctx.restore();
  }

  function render(time) {
    if (!level) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground(time);

    ctx.save();
    ctx.translate(-Math.round(cameraX), 0);

    // Ambient Golden Sparkles (matching reference image)
    if (particlesEnabled) {
      for (const sp of sparkles) {
        const sAlpha = 0.35 + 0.65 * Math.abs(Math.sin(time * 0.004 + sp.phase));
        ctx.fillStyle = `rgba(255, 245, 157, ${sAlpha})`;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Decorations behind player (Trees & Rocks)
    level.decorations.forEach(drawDecoration);

    // Platforms
    level.platforms.forEach(drawPlatform);

    // Wooden Ladders
    level.ladders.forEach(drawLadder);

    // Mystery Blocks [?]
    mysteryBlocks.forEach(b => drawMysteryBlock(b, time));

    // Production Deploy Goal Gate
    drawGoalGate(time);

    // Coins
    coins.forEach(c => drawCoin(c, time));

    // PowerUps
    powerUps.forEach(pu => {
      if (!pu.collected) pu.draw(ctx, time);
    });

    // Enemies & Boss
    enemies.forEach(en => en.draw(ctx, time));
    if (boss) boss.draw(ctx, time);

    // Player Hero
    if (player) player.draw(ctx, time);

    // Projectiles
    projectiles.forEach(p => p.draw(ctx));
    enemyProjectiles.forEach(ep => ep.draw(ctx));

    // Particles
    for (const pt of particles) {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floating Score / Status Texts
    for (const ft of floatingTexts) {
      ctx.save();
      ctx.font = '900 14px sans-serif';
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }

  function gameLoop(time) {
    update(time);
    render(time);

    // Animate Cyberpunk character portraits inside selection modal at crisp 1:1 pixel ratio
    if (window.cyberSprites && window.cyberSprites.ready) {
      const poseIdx = Math.floor(time / 700) % 3;
      document.querySelectorAll('.card-sprite-cvs').forEach(cEl => {
        const cType = cEl.dataset.char;
        const frames = window.cyberSprites.frames[cType];
        if (frames && frames[poseIdx]) {
          const spr = frames[poseIdx];
          if (cEl.width !== spr.width) cEl.width = spr.width;
          if (cEl.height !== spr.height) cEl.height = spr.height;
          const cctx = cEl.getContext('2d');
          cctx.clearRect(0, 0, cEl.width, cEl.height);
          cctx.imageSmoothingEnabled = false;
          cctx.drawImage(spr, 0, 0);
        }
      });
    }

    requestAnimationFrame(gameLoop);
  }

  // ==================== INPUT & UI EVENT LISTENERS ====================
  window.addEventListener('keydown', e => {
    keys[e.code] = true;

    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      if (!player?.onLadder) {
        jumpAction();
      }
    }
    if (e.code === 'KeyK' || e.code === 'KeyX' || e.code === 'KeyE') {
      triggerUltimate();
    }
    if (e.code === 'Digit1') switchCharacter('programmer');
    if (e.code === 'Digit2') switchCharacter('tester');
    if (e.code === 'Digit3') switchCharacter('intern');

    if (e.code === 'KeyP' || e.code === 'Escape') {
      toggleModal();
    }
    if (e.code === 'KeyM') {
      toggleSound();
    }
  });

  window.addEventListener('keyup', e => {
    keys[e.code] = false;
  });

  // Mouse click on canvas fires weapon toward click
  canvas.addEventListener('mousedown', e => {
    if (modalOpen || isPaused) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width) + cameraX;
    if (player) {
      player.facing = clickX >= player.x + player.w / 2 ? 1 : -1;
      fireWeapon();
    }
  });

  // Action Wheel Buttons
  document.getElementById('btnShootWheel').addEventListener('click', () => fireWeapon());
  document.getElementById('btnJumpAction').addEventListener('click', () => jumpAction());
  document.getElementById('btnSpecialAction').addEventListener('click', () => triggerUltimate());

  // Left Dock Buttons
  function toggleModal(forceState) {
    modalOpen = typeof forceState === 'boolean' ? forceState : !modalOpen;
    modalOverlay.classList.toggle('hidden', !modalOpen);
  }

  document.getElementById('btnPlayResume').addEventListener('click', () => {
    toggleModal(false);
    isPaused = false;
    showToast('▶ Jogo em andamento!');
  });

  document.getElementById('btnCharSelect').addEventListener('click', () => toggleModal(true));
  document.getElementById('btnCharMenu').addEventListener('click', () => toggleModal(true));
  document.getElementById('btnPauseLeft').addEventListener('click', () => toggleModal());
  document.getElementById('btnPauseRight').addEventListener('click', () => toggleModal());

  document.getElementById('btnRestart').addEventListener('click', () => {
    loadLevel(currentLevelIdx, false);
    toggleModal(false);
  });

  document.getElementById('btnOptions').addEventListener('click', () => {
    optionsModal.classList.remove('hidden');
  });

  document.getElementById('btnCloseOptions').addEventListener('click', () => {
    difficulty = parseFloat(document.getElementById('selDifficulty').value) || 1.0;
    particlesEnabled = document.getElementById('chkParticles').checked;
    window.sfx.enabled = document.getElementById('chkSound').checked;
    document.getElementById('soundIcon').textContent = window.sfx.enabled ? '🔊' : '🔇';
    optionsModal.classList.add('hidden');
    showToast('⚙️ Configurações salvas!');
  });

  function toggleSound() {
    window.sfx.enabled = !window.sfx.enabled;
    document.getElementById('chkSound').checked = window.sfx.enabled;
    document.getElementById('soundIcon').textContent = window.sfx.enabled ? '🔊' : '🔇';
  }
  document.getElementById('btnSound').addEventListener('click', toggleSound);

  // Quick Character Switch Buttons on Left Dock
  document.querySelectorAll('.mini-char-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchCharacter(btn.dataset.char);
    });
  });

  // Modal Character Selection Cards
  document.querySelectorAll('.char-card').forEach(card => {
    card.addEventListener('click', () => {
      switchCharacter(card.dataset.selectChar);
    });
  });

  // Modal Stage Selection Buttons
  document.querySelectorAll('.stage-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stg = parseInt(btn.dataset.stage, 10);
      loadLevel(stg, false);
    });
  });

  document.getElementById('btnStartGame').addEventListener('click', () => {
    window.sfx.init();
    toggleModal(false);
    isPaused = false;
  });

  // Start the game! Keep modal hidden initially so the iconic reference scene is immediately playable,
  // or accessible with 1 click on the character/gear button!
  modalOverlay.classList.add('hidden');
  loadLevel(0, false);
  requestAnimationFrame(gameLoop);
})();

