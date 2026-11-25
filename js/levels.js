// Level Definitions for Super Tech Bros: Deploy Defense
// Includes exact architectural homage to the 2D Game Design Pack in Sprint 1 + extended Mario-style course

const LEVELS = [
  // =========================================================================
  // SPRINT 1: LOCALHOST VALLEY (Matches Reference Image + Extended Mario Course)
  // =========================================================================
  {
    id: 0,
    name: "Sprint 1: Localhost Valley",
    banner: "Full 2D Tech Bros Pack — Sprint 1",
    skyTop: "#3d9be9",
    skyBottom: "#bce4ff",
    worldWidth: 3400,
    playerStart: { x: 220, y: 530 },

    // Solid Grass-Topped Dirt Platforms & Floating Stone Blocks
    // type: 'grass' (lush green top + brown stone tiles), 'brick' (floating brown blocks), 'server' (metallic pipe/rack)
    platforms: [
      // --- SECTION 1: Reference Image Iconic Layout (x: 130 .. 1250) ---
      // Bottom-left stepped base & main bottom grassy floor
      { x: 130, y: 580, w: 96, h: 140, type: 'grass' },
      { x: 220, y: 636, w: 590, h: 84, type: 'grass' },

      // Left upper stepped grassy ledges
      { x: 130, y: 310, w: 96, h: 90, type: 'grass' },
      { x: 220, y: 365, w: 96, h: 95, type: 'grass' },
      { x: 300, y: 415, w: 96, h: 55, type: 'grass' },

      // Upper-mid cliff with hanging vines
      { x: 410, y: 315, w: 135, h: 95, type: 'grass', vines: true },
      { x: 500, y: 235, w: 90, h: 130, type: 'grass' },

      // Floating brown block bridge in upper center
      { x: 590, y: 280, w: 220, h: 46, type: 'brick' },

      // Center grassy island platform (middle tier)
      { x: 585, y: 468, w: 245, h: 58, type: 'grass', vines: true },

      // Stepped grassy stairs rising to the right
      { x: 825, y: 420, w: 90, h: 60, type: 'grass' },
      { x: 910, y: 345, w: 190, h: 55, type: 'grass' },

      // High right cliff with 3 trees on top + deep stone wall on right edge
      { x: 965, y: 215, w: 260, h: 65, type: 'grass', vines: true },
      { x: 1135, y: 275, w: 90, h: 365, type: 'stone_wall' },
      { x: 965, y: 595, w: 175, h: 55, type: 'grass', vines: true },
      { x: 1030, y: 650, w: 230, h: 70, type: 'grass' },

      // --- SECTION 2: Mario-Style Tech Course Extension (x: 1300 .. 3350) ---
      { x: 1310, y: 636, w: 560, h: 84, type: 'grass' },
      // Server Pipes (Mario green pipes style)
      { x: 1470, y: 540, w: 68, h: 96, type: 'server', label: 'API' },
      { x: 1690, y: 500, w: 68, h: 136, type: 'server', label: 'DB' },

      // Elevated mid-course platforms
      { x: 1530, y: 390, w: 180, h: 46, type: 'brick' },
      { x: 1820, y: 460, w: 190, h: 56, type: 'grass', vines: true },
      { x: 1950, y: 636, w: 580, h: 84, type: 'grass' },

      // Upper QA Sniper Ridge
      { x: 2040, y: 330, w: 280, h: 55, type: 'grass', vines: true },
      { x: 2380, y: 450, w: 180, h: 52, type: 'grass' },

      // Final Sprint Stretch + Staircase to Production Deploy Flagpole
      { x: 2610, y: 636, w: 740, h: 84, type: 'grass' },
      { x: 2680, y: 540, w: 90, h: 96, type: 'brick' },
      { x: 2770, y: 470, w: 90, h: 166, type: 'brick' },
      { x: 2860, y: 400, w: 90, h: 236, type: 'brick' }
    ],

    // Climbable Wooden Ladders (Exact placements from Reference Image + Course)
    ladders: [
      { x: 318, y: 415, h: 221 }, // Left wooden ladder
      { x: 726, y: 280, h: 188 }, // Center upper wooden ladder
      { x: 996, y: 345, h: 250 }, // Right tall wooden ladder
      { x: 2070, y: 330, h: 306 } // Course extension ladder
    ],

    // Super Mario Style [?] Mystery Blocks & Destructible Code Bricks
    // content: 'coffee' (Upgrade weapon/heal), 'duck' (Rubber Duck shield), 'coins' (Multi-coin burst), 'star' (Friday Deploy Turbo)
    mysteryBlocks: [
      { x: 465, y: 185, content: 'coffee', hit: false },
      { x: 650, y: 165, content: 'coins', hit: false },
      { x: 700, y: 165, content: 'duck', hit: false },
      { x: 1575, y: 260, content: 'coffee', hit: false },
      { x: 1630, y: 260, content: 'coins', hit: false },
      { x: 2150, y: 200, content: 'star', hit: false },
      { x: 2450, y: 320, content: 'coffee', hit: false }
    ],

    // Decorative Trees & Rocks (Matching Reference Image)
    decorations: [
      { type: 'rock', x: 605, y: 235, scale: 1.0 },
      { type: 'tree', x: 495, y: 636, scale: 1.05 },
      { type: 'tree', x: 555, y: 636, scale: 0.88 },
      { type: 'tree', x: 1005, y: 215, scale: 1.0 },
      { type: 'tree', x: 1095, y: 215, scale: 1.18 },
      { type: 'tree', x: 1175, y: 215, scale: 0.92 },
      { type: 'tree', x: 1390, y: 636, scale: 1.05 },
      { type: 'rock', x: 1880, y: 460, scale: 0.9 },
      { type: 'tree', x: 2180, y: 330, scale: 1.1 },
      { type: 'tree', x: 2300, y: 636, scale: 1.0 }
    ],

    // Gold Coins (Reference Image positions + trails)
    coins: [
      { x: 400, y: 585 },
      { x: 655, y: 585 },
      { x: 730, y: 585 },
      { x: 660, y: 390 },
      { x: 940, y: 225 },
      // Trail on upper bridge
      { x: 620, y: 230 }, { x: 670, y: 230 }, { x: 720, y: 230 },
      // Course extension coins
      { x: 1380, y: 560 }, { x: 1420, y: 560 },
      { x: 1560, y: 340 }, { x: 1610, y: 340 }, { x: 1660, y: 340 },
      { x: 1860, y: 400 }, { x: 1910, y: 400 },
      { x: 2100, y: 275 }, { x: 2150, y: 275 }, { x: 2200, y: 275 },
      { x: 2790, y: 390 }, { x: 2880, y: 320 }
    ],

    // Tech World Enemies
    // types: 'bug' (Syntax Bug), 'nullpointer' (Flying Glitch), 'legacy' (COBOL Turret), 'conflict' (Merge Conflict)
    enemies: [
      { type: 'bug', x: 560, y: 590, minX: 350, maxX: 780 },
      { type: 'bug', x: 680, y: 420, minX: 595, maxX: 810 },
      { type: 'nullpointer', x: 850, y: 280, minX: 740, maxX: 960 },
      { type: 'legacy', x: 1070, y: 165, minX: 980, maxX: 1180 },
      { type: 'bug', x: 1410, y: 590, minX: 1320, maxX: 1460 },
      { type: 'conflict', x: 1610, y: 590, minX: 1545, maxX: 1680 },
      { type: 'nullpointer', x: 1880, y: 360, minX: 1750, maxX: 2020 },
      { type: 'legacy', x: 2180, y: 280, minX: 2050, maxX: 2290 },
      { type: 'conflict', x: 2220, y: 590, minX: 1980, maxX: 2480 },
      { type: 'bug', x: 2450, y: 400, minX: 2390, maxX: 2540 },
      { type: 'legacy', x: 2630, y: 590, minX: 2610, maxX: 2670 }
    ],

    goalX: 3120,
    goalY: 636,
    boss: null
  },

  // =========================================================================
  // SPRINT 2: CLOUD STAGING MOUNTAINS (Homologação & QA Stress Test)
  // =========================================================================
  {
    id: 1,
    name: "Sprint 2: Cloud Staging",
    banner: "Sprint 2 — Homologação nas Nuvens",
    skyTop: "#2b5876",
    skyBottom: "#4e4376",
    worldWidth: 3200,
    playerStart: { x: 180, y: 540 },

    platforms: [
      { x: 100, y: 620, w: 520, h: 100, type: 'grass' },
      { x: 260, y: 460, w: 220, h: 52, type: 'grass', vines: true },
      { x: 520, y: 340, w: 240, h: 52, type: 'brick' },
      { x: 700, y: 540, w: 380, h: 65, type: 'grass', vines: true },
      { x: 960, y: 390, w: 250, h: 55, type: 'grass' },
      { x: 1180, y: 250, w: 280, h: 55, type: 'grass', vines: true },
      { x: 1240, y: 620, w: 560, h: 100, type: 'grass' },
      { x: 1480, y: 490, w: 68, h: 130, type: 'server', label: 'CI/CD' },
      { x: 1680, y: 440, w: 260, h: 55, type: 'brick' },
      { x: 1920, y: 310, w: 280, h: 58, type: 'grass', vines: true },
      { x: 2020, y: 620, w: 520, h: 100, type: 'grass' },
      { x: 2260, y: 460, w: 240, h: 55, type: 'grass' },
      { x: 2580, y: 620, w: 600, h: 100, type: 'grass' }
    ],

    ladders: [
      { x: 330, y: 460, h: 160 },
      { x: 730, y: 340, h: 200 },
      { x: 1020, y: 390, h: 150 },
      { x: 1360, y: 250, h: 370 },
      { x: 2080, y: 310, h: 310 }
    ],

    mysteryBlocks: [
      { x: 370, y: 330, content: 'coffee', hit: false },
      { x: 620, y: 210, content: 'duck', hit: false },
      { x: 1300, y: 130, content: 'star', hit: false },
      { x: 1780, y: 310, content: 'coffee', hit: false },
      { x: 2350, y: 330, content: 'coins', hit: false }
    ],

    decorations: [
      { type: 'tree', x: 180, y: 620, scale: 1.0 },
      { type: 'rock', x: 420, y: 460, scale: 1.0 },
      { type: 'tree', x: 860, y: 540, scale: 1.1 },
      { type: 'tree', x: 1260, y: 250, scale: 1.05 },
      { type: 'rock', x: 1620, y: 620, scale: 1.1 },
      { type: 'tree', x: 2020, y: 310, scale: 1.1 },
      { type: 'tree', x: 2720, y: 620, scale: 1.15 }
    ],

    coins: [
      { x: 300, y: 400 }, { x: 350, y: 400 }, { x: 400, y: 400 },
      { x: 580, y: 280 }, { x: 640, y: 280 }, { x: 700, y: 280 },
      { x: 1040, y: 330 }, { x: 1100, y: 330 },
      { x: 1250, y: 190 }, { x: 1320, y: 190 }, { x: 1390, y: 190 },
      { x: 1740, y: 380 }, { x: 1800, y: 380 },
      { x: 2000, y: 250 }, { x: 2060, y: 250 },
      { x: 2320, y: 400 }, { x: 2380, y: 400 }
    ],

    enemies: [
      { type: 'bug', x: 420, y: 580, minX: 250, maxX: 590 },
      { type: 'conflict', x: 820, y: 500, minX: 710, maxX: 1050 },
      { type: 'nullpointer', x: 640, y: 250, minX: 520, maxX: 760 },
      { type: 'legacy', x: 1120, y: 340, minX: 970, maxX: 1190 },
      { type: 'conflict', x: 1340, y: 200, minX: 1190, maxX: 1440 },
      { type: 'bug', x: 1600, y: 580, minX: 1550, maxX: 1780 },
      { type: 'legacy', x: 1820, y: 390, minX: 1690, maxX: 1920 },
      { type: 'nullpointer', x: 2050, y: 220, minX: 1920, maxX: 2180 },
      { type: 'conflict', x: 2250, y: 580, minX: 2040, maxX: 2500 },
      { type: 'legacy', x: 2420, y: 410, minX: 2270, maxX: 2480 }
    ],

    goalX: 2950,
    goalY: 620,
    boss: null
  },

  // =========================================================================
  // SPRINT 3: PRODUÇÃO NA SEXTA-FEIRA 18H (BOSS BATTLE!)
  // =========================================================================
  {
    id: 2,
    name: "Sprint 3: Deploy na Sexta 18h (BOSS)",
    banner: "⚠️ ALERTA: O MONOLITO DE PRODUÇÃO ⚠️",
    skyTop: "#3a1c71",
    skyBottom: "#d76d77",
    worldWidth: 2400,
    playerStart: { x: 180, y: 540 },

    platforms: [
      { x: 80, y: 630, w: 2240, h: 90, type: 'grass' },
      { x: 260, y: 460, w: 240, h: 50, type: 'grass', vines: true },
      { x: 580, y: 340, w: 240, h: 50, type: 'brick' },
      { x: 900, y: 460, w: 240, h: 50, type: 'grass', vines: true },

      // Boss Arena Multi-Tier Platforms + Ladders
      { x: 1260, y: 470, w: 230, h: 48, type: 'grass' },
      { x: 1580, y: 330, w: 250, h: 48, type: 'brick' },
      { x: 1900, y: 470, w: 230, h: 48, type: 'grass' }
    ],

    ladders: [
      { x: 350, y: 460, h: 170 },
      { x: 990, y: 460, h: 170 },
      { x: 1340, y: 470, h: 160 },
      { x: 1980, y: 470, h: 160 }
    ],

    mysteryBlocks: [
      { x: 370, y: 320, content: 'coffee', hit: false },
      { x: 690, y: 200, content: 'duck', hit: false },
      { x: 1370, y: 330, content: 'coffee', hit: false },
      { x: 1700, y: 190, content: 'star', hit: false },
      { x: 2010, y: 330, content: 'coffee', hit: false }
    ],

    decorations: [
      { type: 'tree', x: 160, y: 630, scale: 1.0 },
      { type: 'rock', x: 430, y: 460, scale: 1.0 },
      { type: 'tree', x: 1180, y: 630, scale: 1.1 }
    ],

    coins: [
      { x: 320, y: 400 }, { x: 380, y: 400 },
      { x: 640, y: 280 }, { x: 700, y: 280 }, { x: 760, y: 280 },
      { x: 1400, y: 410 }, { x: 1660, y: 270 }, { x: 1740, y: 270 }
    ],

    enemies: [
      { type: 'bug', x: 520, y: 590, minX: 380, maxX: 820 },
      { type: 'conflict', x: 700, y: 290, minX: 590, maxX: 800 },
      { type: 'legacy', x: 1020, y: 410, minX: 910, maxX: 1120 }
    ],

    goalX: 2220,
    goalY: 630,

    // Final Boss: O Monolito Legado / Deploy de Sexta-Feira 18h
    boss: {
      name: "MONOLITO LEGADO (Deploy 18h)",
      x: 1750,
      y: 490,
      w: 116,
      h: 140,
      hp: 450,
      maxHp: 450,
      minX: 1320,
      maxX: 2080
    }
  }
];

window.LEVELS = LEVELS;

