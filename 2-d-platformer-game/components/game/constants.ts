// Game dimensions - larger canvas, smaller entities for strategic play
export const GAME_WIDTH = 960
export const GAME_HEIGHT = 540
export const TILE_SIZE = 20
export const PLAYER_SIZE = 18
export const WALL_WIDTH = 12

// Physics - slower, more deliberate
export const GRAVITY = 0.2
export const JUMP_FORCE = -7.0
export const MOVE_SPEED = 1.2
export const TELEPORT_DISTANCE = 90
export const TELEPORT_WINDUP_FRAMES = 10
export const TELEPORT_COOLDOWN_FRAMES = 40

// Colors - brighter to contrast the dark purple bg
export const NEON_PURPLE = '#a855f7'
export const NEON_GREEN = '#00ff88'
export const NEON_BLUE = '#00d4ff'
export const DARK_BG = '#0a0a12'
export const PLATFORM_COLOR = '#00ff8855'
export const PLATFORM_BORDER = '#00ffaa'
export const WALL_SOLID_COLOR = '#1a1a2e'
export const WALL_THIN_COLOR = '#a855f7'

// Level layout types
export interface Wall {
  x: number
  y: number
  w: number
  h: number
  isThin: boolean
}

export interface Platform {
  x: number
  y: number
  w: number
  h: number
}

export interface FlagPos {
  x: number
  y: number
}

export interface LevelData {
  name: string
  subtitle: string
  platforms: Platform[]
  walls: Wall[]
  playerStart: { x: number; y: number }
  playerStart2: { x: number; y: number } // second-run spawn
  flag: FlagPos
  hasTutorial?: boolean
}

// ============================================================
// Level 1 - "Temporal Grounds" (tutorial, path forces trace-back)
// Layout: player starts bottom-left, flag is bottom-right.
// To reach the flag you go RIGHT across the bottom, then UP the right side.
// Second spawn is top-left, so you MUST descend through your old path.
// ============================================================
const L1_FLOOR_Y = GAME_HEIGHT - 20
const level1Platforms: Platform[] = [
  // Ground - broken with gaps to force platforming
  { x: 0, y: L1_FLOOR_Y, w: 200, h: 20 },
  { x: 240, y: L1_FLOOR_Y, w: 160, h: 20 },
  { x: 440, y: L1_FLOOR_Y, w: 140, h: 20 },
  { x: 680, y: L1_FLOOR_Y, w: 280, h: 20 },

  // Mid-section stepping stones going right
  { x: 160, y: 430, w: 80, h: 12 },
  { x: 300, y: 400, w: 70, h: 12 },
  { x: 420, y: 370, w: 80, h: 12 },

  // Right tower ascent
  { x: 800, y: 420, w: 100, h: 12 },
  { x: 760, y: 350, w: 80, h: 12 },
  { x: 830, y: 280, w: 90, h: 12 },
  { x: 750, y: 210, w: 80, h: 12 },
  { x: 830, y: 150, w: 100, h: 12 },

  // Top bridge going left (return path for run 2)
  { x: 660, y: 150, w: 80, h: 12 },
  { x: 500, y: 130, w: 80, h: 12 },
  { x: 340, y: 120, w: 80, h: 12 },
  { x: 180, y: 110, w: 80, h: 12 },
  { x: 30, y: 100, w: 100, h: 12 },

  // Mid descent (run 2 crosses run 1 here)
  { x: 100, y: 220, w: 80, h: 12 },
  { x: 220, y: 290, w: 70, h: 12 },
  { x: 350, y: 300, w: 80, h: 12 },
  { x: 530, y: 280, w: 80, h: 12 },
  { x: 600, y: 340, w: 80, h: 12 },
  { x: 550, y: 430, w: 70, h: 12 },
]

const level1Walls: Wall[] = [
  { x: 0, y: 0, w: 12, h: GAME_HEIGHT, isThin: false },
  { x: GAME_WIDTH - 12, y: 0, w: 12, h: GAME_HEIGHT, isThin: false },
  // Thin walls forcing teleport usage
  { x: 580, y: L1_FLOOR_Y - 80, w: WALL_WIDTH, h: 80, isThin: true },
  { x: 720, y: 210, w: WALL_WIDTH, h: 80, isThin: true },
  { x: 440, y: 120, w: WALL_WIDTH, h: 70, isThin: true },
  { x: 250, y: 220, w: WALL_WIDTH, h: 80, isThin: true },
]

// ============================================================
// Level 2 - "Neon Abyss"
// Layout: spiral descent. Start top-left, flag bottom-center.
// Second spawn is bottom-right, must ascend through old descent path.
// ============================================================
const level2Platforms: Platform[] = [
  // Top ledges
  { x: 30, y: 80, w: 120, h: 12 },
  { x: 200, y: 80, w: 80, h: 12 },
  { x: 360, y: 60, w: 90, h: 12 },
  { x: 540, y: 80, w: 80, h: 12 },
  { x: 700, y: 60, w: 100, h: 12 },
  { x: 850, y: 80, w: 80, h: 12 },

  // Second tier (right to left)
  { x: 780, y: 160, w: 100, h: 12 },
  { x: 620, y: 170, w: 80, h: 12 },
  { x: 470, y: 155, w: 70, h: 12 },
  { x: 310, y: 170, w: 80, h: 12 },
  { x: 140, y: 180, w: 90, h: 12 },

  // Third tier (left to right)
  { x: 50, y: 270, w: 100, h: 12 },
  { x: 210, y: 260, w: 80, h: 12 },
  { x: 360, y: 250, w: 80, h: 12 },
  { x: 510, y: 260, w: 90, h: 12 },
  { x: 670, y: 250, w: 80, h: 12 },
  { x: 820, y: 270, w: 100, h: 12 },

  // Fourth tier (right to left)
  { x: 750, y: 350, w: 80, h: 12 },
  { x: 590, y: 360, w: 90, h: 12 },
  { x: 420, y: 350, w: 80, h: 12 },
  { x: 260, y: 360, w: 80, h: 12 },
  { x: 100, y: 370, w: 90, h: 12 },

  // Bottom platforms
  { x: 180, y: 450, w: 80, h: 12 },
  { x: 340, y: 460, w: 80, h: 12 },
  { x: 500, y: 470, w: 80, h: 12 },
  { x: 660, y: 450, w: 80, h: 12 },

  // Floor patches
  { x: 380, y: GAME_HEIGHT - 20, w: 200, h: 20 },
  { x: 700, y: GAME_HEIGHT - 20, w: 200, h: 20 },
]

const level2Walls: Wall[] = [
  { x: 0, y: 0, w: 12, h: GAME_HEIGHT, isThin: false },
  { x: GAME_WIDTH - 12, y: 0, w: 12, h: GAME_HEIGHT, isThin: false },
  { x: 280, y: 60, w: WALL_WIDTH, h: 70, isThin: true },
  { x: 460, y: 155, w: WALL_WIDTH, h: 60, isThin: true },
  { x: 350, y: 250, w: WALL_WIDTH, h: 60, isThin: true },
  { x: 580, y: 350, w: WALL_WIDTH, h: 60, isThin: true },
  { x: 250, y: 360, w: WALL_WIDTH, h: 70, isThin: true },
  { x: 700, y: 250, w: WALL_WIDTH, h: 60, isThin: true },
]

// ============================================================
// Level 3 - "Chrono Spire"
// Layout: central tower with wrapping platforms.
// Start bottom-left, flag at very top center.
// Second spawn is bottom-right, must cross ascending path.
// ============================================================
const level3Platforms: Platform[] = [
  // Ground
  { x: 0, y: GAME_HEIGHT - 20, w: 200, h: 20 },
  { x: 760, y: GAME_HEIGHT - 20, w: 200, h: 20 },

  // Outer left ascent
  { x: 40, y: 450, w: 90, h: 12 },
  { x: 30, y: 370, w: 80, h: 12 },
  { x: 50, y: 290, w: 90, h: 12 },
  { x: 30, y: 210, w: 80, h: 12 },

  // Left-center bridges
  { x: 180, y: 430, w: 70, h: 12 },
  { x: 200, y: 340, w: 80, h: 12 },
  { x: 180, y: 250, w: 70, h: 12 },
  { x: 200, y: 170, w: 80, h: 12 },

  // Central tower
  { x: 340, y: 460, w: 100, h: 12 },
  { x: 350, y: 380, w: 80, h: 12 },
  { x: 340, y: 300, w: 100, h: 12 },
  { x: 350, y: 220, w: 80, h: 12 },
  { x: 330, y: 140, w: 120, h: 12 },

  // Central-right bridges
  { x: 520, y: 460, w: 80, h: 12 },
  { x: 530, y: 380, w: 70, h: 12 },
  { x: 510, y: 300, w: 80, h: 12 },
  { x: 530, y: 220, w: 70, h: 12 },
  { x: 510, y: 140, w: 80, h: 12 },

  // Outer right ascent
  { x: 680, y: 450, w: 90, h: 12 },
  { x: 700, y: 370, w: 80, h: 12 },
  { x: 680, y: 290, w: 90, h: 12 },
  { x: 700, y: 210, w: 80, h: 12 },
  { x: 830, y: 350, w: 80, h: 12 },
  { x: 850, y: 250, w: 80, h: 12 },

  // Top crown
  { x: 180, y: 100, w: 80, h: 12 },
  { x: 400, y: 60, w: 160, h: 14 },
  { x: 680, y: 100, w: 80, h: 12 },
]

const level3Walls: Wall[] = [
  { x: 0, y: 0, w: 12, h: GAME_HEIGHT, isThin: false },
  { x: GAME_WIDTH - 12, y: 0, w: 12, h: GAME_HEIGHT, isThin: false },
  // Central tower walls
  { x: 330, y: 300, w: WALL_WIDTH, h: 80, isThin: true },
  { x: 440, y: 220, w: WALL_WIDTH, h: 80, isThin: true },
  { x: 330, y: 140, w: WALL_WIDTH, h: 60, isThin: true },
  // Outer walls
  { x: 160, y: 250, w: WALL_WIDTH, h: 70, isThin: true },
  { x: 660, y: 290, w: WALL_WIDTH, h: 70, isThin: true },
  { x: 500, y: 380, w: WALL_WIDTH, h: 80, isThin: true },
  { x: 260, y: 100, w: WALL_WIDTH, h: 70, isThin: true },
  { x: 600, y: 100, w: WALL_WIDTH, h: 70, isThin: true },
]

export const LEVELS: LevelData[] = [
  {
    name: 'TEMPORAL GROUNDS',
    subtitle: 'Learn the basics',
    platforms: level1Platforms,
    walls: level1Walls,
    playerStart: { x: 40, y: L1_FLOOR_Y - PLAYER_SIZE },
    playerStart2: { x: 50, y: 100 - PLAYER_SIZE },
    flag: { x: 870, y: 150 - 28 },
    hasTutorial: true,
  },
  {
    name: 'NEON ABYSS',
    subtitle: 'Mind the gaps',
    platforms: level2Platforms,
    walls: level2Walls,
    playerStart: { x: 50, y: 80 - PLAYER_SIZE },
    playerStart2: { x: 800, y: GAME_HEIGHT - 20 - PLAYER_SIZE },
    flag: { x: 440, y: GAME_HEIGHT - 20 - 28 },
  },
  {
    name: 'CHRONO SPIRE',
    subtitle: 'Ascend the tower',
    platforms: level3Platforms,
    walls: level3Walls,
    playerStart: { x: 60, y: GAME_HEIGHT - 20 - PLAYER_SIZE },
    playerStart2: { x: 850, y: GAME_HEIGHT - 20 - PLAYER_SIZE },
    flag: { x: 460, y: 60 - 28 },
  },
]
