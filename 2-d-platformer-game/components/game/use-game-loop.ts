import { useCallback, useEffect, useRef, useState } from 'react'
import {
  GRAVITY,
  JUMP_FORCE,
  MOVE_SPEED,
  TELEPORT_DISTANCE,
  TELEPORT_WINDUP_FRAMES,
  TELEPORT_COOLDOWN_FRAMES,
  PLAYER_SIZE,
  GAME_WIDTH,
  GAME_HEIGHT,
  type LevelData,
  type Platform,
  type Wall,
} from './constants'

export interface Position {
  x: number
  y: number
}

export interface TeleportTrail {
  id: number
  x: number
  y: number
  targetX: number
  frame: number
}

// Tutorial step definitions
export type TutorialStep = 'move' | 'jump' | 'teleport' | 'restart' | 'done'

interface GameState {
  playerPos: Position
  playerVel: { x: number; y: number }
  isGrounded: boolean
  isTeleporting: boolean
  teleportCooldown: number
  teleportWindup: number
  teleportDir: number
  teleportOriginX: number
  movementHistory: Position[]
  shadowHistory: Position[] | null
  shadowFrame: number
  shadowPos: Position | null
  isGlitching: boolean
  runNumber: number
  frameCount: number
  teleportTrails: TeleportTrail[]
  trailIdCounter: number
  reachedFlag: boolean
  showFlagMessage: boolean
  flagMessageTimer: number
  tutorialStep: TutorialStep
  tutorialMoved: boolean
  tutorialJumped: boolean
  tutorialTeleported: boolean
  hasLost: boolean
  showLoseMessage: boolean
  loseMessageTimer: number
}

function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

const FLAG_W = 18
const FLAG_H = 28

export function useGameLoop(level: LevelData) {
  const keysRef = useRef<Set<string>>(new Set())
  const levelRef = useRef(level)
  levelRef.current = level

  const gameStateRef = useRef<GameState>({
    playerPos: { ...level.playerStart },
    playerVel: { x: 0, y: 0 },
    isGrounded: false,
    isTeleporting: false,
    teleportCooldown: 0,
    teleportWindup: 0,
    teleportDir: 0,
    teleportOriginX: 0,
    movementHistory: [],
    shadowHistory: null,
    shadowFrame: 0,
    shadowPos: null,
    isGlitching: false,
    runNumber: 0,
    frameCount: 0,
    teleportTrails: [],
    trailIdCounter: 0,
    reachedFlag: false,
    showFlagMessage: false,
    flagMessageTimer: 0,
    tutorialStep: level.hasTutorial ? 'move' : 'done',
    tutorialMoved: false,
    tutorialJumped: false,
    tutorialTeleported: false,
    hasLost: false,
    showLoseMessage: false,
    loseMessageTimer: 0,
  })

  const [renderState, setRenderState] = useState({
    playerPos: { ...level.playerStart },
    shadowPos: null as Position | null,
    isGlitching: false,
    isTeleporting: false,
    isWindingUp: false,
    runNumber: 0,
    frameCount: 0,
    teleportTrails: [] as TeleportTrail[],
    reachedFlag: false,
    showFlagMessage: false,
    tutorialStep: (level.hasTutorial ? 'move' : 'done') as TutorialStep,
    hasLost: false,
    showLoseMessage: false,
  })

  const rafRef = useRef<number>(0)

  const restart = useCallback(() => {
    const gs = gameStateRef.current
    const lev = levelRef.current
    gs.shadowHistory =
      gs.movementHistory.length > 0 ? [...gs.movementHistory] : gs.shadowHistory
    gs.movementHistory = []
    // Use second spawn point if we've reached the flag at least once
    const spawn = gs.reachedFlag ? (lev.playerStart2 ?? lev.playerStart) : lev.playerStart
    gs.playerPos = { ...spawn }
    gs.playerVel = { x: 0, y: 0 }
    gs.isGrounded = false
    gs.isTeleporting = false
    gs.teleportCooldown = 0
    gs.teleportWindup = 0
    gs.teleportDir = 0
    gs.teleportOriginX = 0
    gs.shadowFrame = 0
    gs.shadowPos = gs.shadowHistory ? gs.shadowHistory[0] : null
    gs.isGlitching = false
    gs.runNumber += 1
    gs.frameCount = 0
    gs.teleportTrails = []
    gs.showFlagMessage = false
    gs.flagMessageTimer = 0
    gs.hasLost = false
    gs.showLoseMessage = false
    gs.loseMessageTimer = 0
    // Tutorial is done after first restart
    if (gs.tutorialStep !== 'done') {
      gs.tutorialStep = 'done'
    }
  }, [])

  const triggerGlitch = useCallback(() => {
    const gs = gameStateRef.current
    gs.isGlitching = true
    setRenderState((prev) => ({ ...prev, isGlitching: true }))
    setTimeout(() => {
      restart()
      setRenderState((prev) => ({ ...prev, isGlitching: false }))
    }, 600)
  }, [restart])

  const checkPlatformCollisions = useCallback(
    (pos: Position, vel: { x: number; y: number }, platforms: Platform[]) => {
      let grounded = false
      const newPos = { ...pos }
      const newVel = { ...vel }

      for (const plat of platforms) {
        if (rectsOverlap(newPos.x, newPos.y, PLAYER_SIZE, PLAYER_SIZE, plat.x, plat.y, plat.w, plat.h)) {
          if (vel.y > 0 && pos.y + PLAYER_SIZE <= plat.y + vel.y + 1) {
            newPos.y = plat.y - PLAYER_SIZE
            newVel.y = 0
            grounded = true
          } else if (vel.y < 0 && pos.y >= plat.y + plat.h - 1) {
            newPos.y = plat.y + plat.h
            newVel.y = 0
          } else if (vel.x > 0 && pos.x + PLAYER_SIZE <= plat.x + 2) {
            newPos.x = plat.x - PLAYER_SIZE
          } else if (vel.x < 0 && pos.x >= plat.x + plat.w - 2) {
            newPos.x = plat.x + plat.w
          }
        }
      }

      return { pos: newPos, vel: newVel, grounded }
    },
    []
  )

  const checkWallCollisions = useCallback(
    (pos: Position, vel: { x: number; y: number }, isTeleporting: boolean, walls: Wall[]) => {
      const newPos = { ...pos }

      for (const wall of walls) {
        if (isTeleporting && wall.isThin) continue

        if (rectsOverlap(newPos.x, newPos.y, PLAYER_SIZE, PLAYER_SIZE, wall.x, wall.y, wall.w, wall.h)) {
          if (vel.x > 0) {
            newPos.x = wall.x - PLAYER_SIZE
          } else if (vel.x < 0) {
            newPos.x = wall.x + wall.w
          }
        }
      }

      return newPos
    },
    []
  )

  const gameLoop = useCallback(() => {
    const gs = gameStateRef.current
    const lev = levelRef.current

    if (gs.isGlitching) {
      rafRef.current = requestAnimationFrame(gameLoop)
      return
    }

    // If showing flag message, just tick the timer
    if (gs.showFlagMessage) {
      gs.flagMessageTimer++
      if (gs.flagMessageTimer > 120) {
        gs.showFlagMessage = false
        // Auto-restart after showing message
        restart()
        setRenderState((prev) => ({ ...prev, showFlagMessage: false }))
      }
      rafRef.current = requestAnimationFrame(gameLoop)
      return
    }

    // If showing lose message, just tick the timer (wait for manual retry)
    if (gs.showLoseMessage) {
      gs.loseMessageTimer++
      setRenderState((prev) => ({ ...prev, showLoseMessage: true, hasLost: true }))
      rafRef.current = requestAnimationFrame(gameLoop)
      return
    }

    // If player has lost, don't update game state
    if (gs.hasLost) {
      rafRef.current = requestAnimationFrame(gameLoop)
      return
    }

    const keys = keysRef.current

    // Age and remove old trails
    gs.teleportTrails = gs.teleportTrails
      .map((t) => ({ ...t, frame: t.frame + 1 }))
      .filter((t) => t.frame < 20)

    // ===== TELEPORT WINDUP =====
    if (gs.teleportWindup > 0) {
      gs.teleportWindup--
      gs.playerVel.x = 0

      if (gs.teleportWindup === 0) {
        const originX = gs.playerPos.x
        gs.isTeleporting = true
        gs.playerPos.x += gs.teleportDir * TELEPORT_DISTANCE
        gs.playerPos.x = Math.max(12, Math.min(GAME_WIDTH - 12 - PLAYER_SIZE, gs.playerPos.x))
        gs.teleportCooldown = TELEPORT_COOLDOWN_FRAMES

        const startX = originX
        const endX = gs.playerPos.x
        const steps = 6
        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          gs.teleportTrails.push({
            id: gs.trailIdCounter++,
            x: startX + (endX - startX) * t,
            y: gs.playerPos.y + (Math.random() - 0.5) * 10,
            targetX: endX,
            frame: 0,
          })
        }

        gs.playerVel.x = 0

        // Tutorial: teleport done
        if (!gs.tutorialTeleported) {
          gs.tutorialTeleported = true
          if (gs.tutorialStep === 'teleport') gs.tutorialStep = 'restart'
        }
      }

      gs.movementHistory.push({ x: gs.playerPos.x, y: gs.playerPos.y })

      // Shadow update during windup
      if (gs.shadowHistory && gs.shadowFrame < gs.shadowHistory.length) {
        gs.shadowPos = gs.shadowHistory[gs.shadowFrame]
        gs.shadowFrame++
        if (gs.shadowPos) {
          const overlap = rectsOverlap(
            gs.playerPos.x, gs.playerPos.y, PLAYER_SIZE, PLAYER_SIZE,
            gs.shadowPos.x, gs.shadowPos.y, PLAYER_SIZE, PLAYER_SIZE
          )
          if (overlap && gs.frameCount > 10) {
            triggerGlitch()
            rafRef.current = requestAnimationFrame(gameLoop)
            return
          }
        }
      } else if (gs.shadowHistory && gs.shadowFrame >= gs.shadowHistory.length) {
        gs.shadowPos = null
      }

      gs.frameCount++

      setRenderState({
        playerPos: { ...gs.playerPos },
        shadowPos: gs.shadowPos ? { ...gs.shadowPos } : null,
        isGlitching: gs.isGlitching,
        isTeleporting: false,
        isWindingUp: true,
        runNumber: gs.runNumber,
        frameCount: gs.frameCount,
        teleportTrails: [...gs.teleportTrails],
        reachedFlag: gs.reachedFlag,
        showFlagMessage: gs.showFlagMessage,
        tutorialStep: gs.tutorialStep,
      })

      rafRef.current = requestAnimationFrame(gameLoop)
      return
    }

    // ===== NORMAL MOVEMENT =====
    gs.isTeleporting = false

    let moveX = 0
    if (keys.has('ArrowLeft') || keys.has('a')) moveX = -MOVE_SPEED
    if (keys.has('ArrowRight') || keys.has('d')) moveX = MOVE_SPEED
    gs.playerVel.x = moveX

    // Tutorial: movement detected
    if (moveX !== 0 && !gs.tutorialMoved) {
      gs.tutorialMoved = true
      if (gs.tutorialStep === 'move') gs.tutorialStep = 'jump'
    }

    // Jump
    if ((keys.has('ArrowUp') || keys.has('w') || keys.has(' ')) && gs.isGrounded) {
      gs.playerVel.y = JUMP_FORCE
      gs.isGrounded = false
      // Tutorial: jump done
      if (!gs.tutorialJumped) {
        gs.tutorialJumped = true
        if (gs.tutorialStep === 'jump') gs.tutorialStep = 'teleport'
      }
    }

    // Teleport initiation
    if (gs.teleportCooldown > 0) gs.teleportCooldown--
    if (keys.has('Shift') && gs.teleportCooldown === 0 && moveX !== 0) {
      gs.teleportWindup = TELEPORT_WINDUP_FRAMES
      gs.teleportDir = moveX > 0 ? 1 : -1
      gs.teleportOriginX = gs.playerPos.x
      gs.playerVel.x = 0
    }

    // Gravity
    gs.playerVel.y += GRAVITY

    // Apply velocity
    gs.playerPos.x += gs.playerVel.x
    gs.playerPos.y += gs.playerVel.y

    // Clamp to game bounds
    gs.playerPos.x = Math.max(12, Math.min(GAME_WIDTH - 12 - PLAYER_SIZE, gs.playerPos.x))
    if (gs.playerPos.y > GAME_HEIGHT + 40) {
      // Fell off - reset to spawn
      const spawn = gs.reachedFlag && gs.runNumber > 0 ? (lev.playerStart2 ?? lev.playerStart) : lev.playerStart
      gs.playerPos = { ...spawn }
      gs.playerVel = { x: 0, y: 0 }
    }

    // Check collisions
    const wallResult = checkWallCollisions(gs.playerPos, gs.playerVel, gs.isTeleporting, lev.walls)
    gs.playerPos = wallResult

    const platResult = checkPlatformCollisions(gs.playerPos, gs.playerVel, lev.platforms)
    gs.playerPos = platResult.pos
    gs.playerVel = platResult.vel
    gs.isGrounded = platResult.grounded

    // ===== FLAG CHECK =====
    if (lev.flag) {
      const flagOverlap = rectsOverlap(
        gs.playerPos.x, gs.playerPos.y, PLAYER_SIZE, PLAYER_SIZE,
        lev.flag.x, lev.flag.y, FLAG_W, FLAG_H
      )
      if (flagOverlap && !gs.showFlagMessage) {
        gs.reachedFlag = true
        gs.showFlagMessage = true
        gs.flagMessageTimer = 0
      }
    }

    // Record movement
    gs.movementHistory.push({ x: gs.playerPos.x, y: gs.playerPos.y })

    // Update shadow
    if (gs.shadowHistory && gs.shadowFrame < gs.shadowHistory.length) {
      gs.shadowPos = gs.shadowHistory[gs.shadowFrame]
      gs.shadowFrame++

      if (gs.shadowPos) {
        const overlap = rectsOverlap(
          gs.playerPos.x, gs.playerPos.y, PLAYER_SIZE, PLAYER_SIZE,
          gs.shadowPos.x, gs.shadowPos.y, PLAYER_SIZE, PLAYER_SIZE
        )
        if (overlap && gs.frameCount > 10) {
          triggerGlitch()
          rafRef.current = requestAnimationFrame(gameLoop)
          return
        }

        // Check if shadow reached flag before player
        if (lev.flag && gs.runNumber > 0 && !gs.reachedFlag) {
          const shadowFlagOverlap = rectsOverlap(
            gs.shadowPos.x, gs.shadowPos.y, PLAYER_SIZE, PLAYER_SIZE,
            lev.flag.x, lev.flag.y, FLAG_W, FLAG_H
          )
          if (shadowFlagOverlap) {
            gs.hasLost = true
            gs.showLoseMessage = true
            gs.loseMessageTimer = 0
          }
        }
      }
    } else if (gs.shadowHistory && gs.shadowFrame >= gs.shadowHistory.length) {
      gs.shadowPos = null
    }

    gs.frameCount++

    setRenderState({
      playerPos: { ...gs.playerPos },
      shadowPos: gs.shadowPos ? { ...gs.shadowPos } : null,
      isGlitching: gs.isGlitching,
      isTeleporting: gs.isTeleporting,
      isWindingUp: false,
      runNumber: gs.runNumber,
      frameCount: gs.frameCount,
      teleportTrails: [...gs.teleportTrails],
      reachedFlag: gs.reachedFlag,
      showFlagMessage: gs.showFlagMessage,
      tutorialStep: gs.tutorialStep,
      hasLost: gs.hasLost,
      showLoseMessage: gs.showLoseMessage,
    })

    rafRef.current = requestAnimationFrame(gameLoop)
  }, [checkPlatformCollisions, checkWallCollisions, triggerGlitch, restart])

  // Reset state when level changes
  const prevLevelRef = useRef(level.name)
  useEffect(() => {
    if (prevLevelRef.current !== level.name) {
      prevLevelRef.current = level.name
      const gs = gameStateRef.current
      gs.playerPos = { ...level.playerStart }
      gs.playerVel = { x: 0, y: 0 }
      gs.isGrounded = false
      gs.isTeleporting = false
      gs.teleportCooldown = 0
      gs.teleportWindup = 0
      gs.teleportDir = 0
      gs.teleportOriginX = 0
      gs.movementHistory = []
      gs.shadowHistory = null
      gs.shadowFrame = 0
      gs.shadowPos = null
      gs.isGlitching = false
      gs.runNumber = 0
      gs.frameCount = 0
      gs.teleportTrails = []
      gs.reachedFlag = false
      gs.showFlagMessage = false
      gs.flagMessageTimer = 0
      gs.hasLost = false
      gs.showLoseMessage = false
      gs.loseMessageTimer = 0
      gs.tutorialStep = level.hasTutorial ? 'move' : 'done'
      gs.tutorialMoved = false
      gs.tutorialJumped = false
      gs.tutorialTeleported = false
    }
  }, [level])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }
      if (e.key === 'r' || e.key === 'R') {
        const gs = gameStateRef.current
        // Tutorial: restart done
        if (gs.tutorialStep === 'restart') {
          gs.tutorialStep = 'done'
        }
        restart()
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    rafRef.current = requestAnimationFrame(gameLoop)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      cancelAnimationFrame(rafRef.current)
    }
  }, [gameLoop, restart])

  return { ...renderState, restart, hasLost: renderState.hasLost, showLoseMessage: renderState.showLoseMessage }
}
