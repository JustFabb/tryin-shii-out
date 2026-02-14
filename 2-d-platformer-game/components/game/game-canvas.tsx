'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SIZE,
  NEON_PURPLE,
  NEON_GREEN,
  NEON_BLUE,
  type LevelData,
} from './constants'
import type { Position, TeleportTrail, TutorialStep } from './use-game-loop'
import { ScanlineOverlay } from './scanline-overlay'

interface GameCanvasProps {
  level: LevelData
  playerPos: Position
  shadowPos: Position | null
  isGlitching: boolean
  isTeleporting: boolean
  isWindingUp: boolean
  teleportTrails: TeleportTrail[]
  reachedFlag: boolean
  showFlagMessage: boolean
  tutorialStep: TutorialStep
  hasLost?: boolean
  showLoseMessage?: boolean
}

// Platform blocks - bright cyan/green outline to contrast purple bg
function PlatformBlock({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        background: 'rgba(0, 20, 30, 0.85)',
        borderTop: `2px solid ${NEON_GREEN}88`,
        borderLeft: `1px solid ${NEON_GREEN}33`,
        borderRight: `1px solid ${NEON_GREEN}33`,
        boxShadow: `0 -2px 10px ${NEON_GREEN}20, inset 0 2px 6px ${NEON_GREEN}10`,
      }}
    />
  )
}

// Wall blocks - cyan for solid, purple stripes for thin
function WallBlock({
  x, y, w, h, isThin,
}: {
  x: number; y: number; w: number; h: number; isThin: boolean
}) {
  if (!isThin) {
    return (
      <div
        className="absolute"
        style={{
          left: x,
          top: y,
          width: w,
          height: h,
          background: 'rgba(0, 10, 20, 0.9)',
          borderRight: x === 0 ? `1px solid ${NEON_BLUE}33` : 'none',
          borderLeft: x !== 0 ? `1px solid ${NEON_BLUE}33` : 'none',
        }}
      />
    )
  }

  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        background: `repeating-linear-gradient(
          0deg,
          ${NEON_BLUE}44 0px,
          ${NEON_BLUE}44 3px,
          transparent 3px,
          transparent 6px
        )`,
        border: `1px solid ${NEON_BLUE}55`,
        boxShadow: `0 0 10px ${NEON_BLUE}20, inset 0 0 6px ${NEON_BLUE}10`,
      }}
    />
  )
}

// Flag at the level endpoint
function Flag({ x, y, pulse }: { x: number; y: number; pulse: boolean }) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {/* Pole */}
      <div
        className="absolute"
        style={{
          left: 2,
          top: 0,
          width: 2,
          height: 28,
          background: `${NEON_GREEN}cc`,
          boxShadow: `0 0 6px ${NEON_GREEN}44`,
        }}
      />
      {/* Flag cloth */}
      <motion.div
        animate={pulse ? {
          boxShadow: [
            `0 0 8px ${NEON_GREEN}44`,
            `0 0 20px ${NEON_GREEN}88`,
            `0 0 8px ${NEON_GREEN}44`,
          ],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          position: 'absolute',
          left: 4,
          top: 1,
          width: 12,
          height: 10,
          background: NEON_GREEN,
          boxShadow: `0 0 12px ${NEON_GREEN}66`,
          clipPath: 'polygon(0 0, 100% 20%, 100% 80%, 0 100%)',
        }}
      />
      {/* Base glow */}
      <div
        className="absolute"
        style={{
          left: -4,
          top: 24,
          width: 14,
          height: 4,
          background: `radial-gradient(ellipse, ${NEON_GREEN}33 0%, transparent 70%)`,
        }}
      />
    </div>
  )
}

function TeleportTrailParticle({ trail }: { trail: TeleportTrail }) {
  const progress = trail.frame / 20
  const opacity = 1 - progress
  const size = 8 * (1 - progress * 0.5)
  const blur = 3 + progress * 6

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: trail.x - size / 2 + PLAYER_SIZE / 2,
        top: trail.y - size / 2 + PLAYER_SIZE / 2,
        width: size,
        height: size,
        opacity,
        background: NEON_BLUE,
        borderRadius: '50%',
        boxShadow: `0 0 ${blur}px ${NEON_BLUE}cc, 0 0 ${blur * 2}px ${NEON_BLUE}66`,
        filter: `blur(${progress * 2}px)`,
      }}
    />
  )
}

function Player({ pos, isTeleporting, isWindingUp }: { pos: Position; isTeleporting: boolean; isWindingUp: boolean }) {
  return (
    <>
      <AnimatePresence>
        {isWindingUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.4, 1] }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.15, repeat: Infinity }}
            className="pointer-events-none absolute"
            style={{
              left: pos.x - 5,
              top: pos.y - 5,
              width: PLAYER_SIZE + 10,
              height: PLAYER_SIZE + 10,
              background: `radial-gradient(circle, ${NEON_BLUE}44 0%, transparent 70%)`,
              borderRadius: '50%',
              boxShadow: `0 0 20px ${NEON_BLUE}66`,
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isTeleporting && (
          <motion.div
            initial={{ opacity: 0.9, scaleX: 4, scaleY: 0.6 }}
            animate={{ opacity: 0, scaleX: 0.2, scaleY: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="pointer-events-none absolute"
            style={{
              left: pos.x,
              top: pos.y + PLAYER_SIZE * 0.2,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE * 0.6,
              background: `linear-gradient(90deg, ${NEON_BLUE}00, ${NEON_BLUE}88, ${NEON_BLUE}00)`,
              filter: 'blur(4px)',
              boxShadow: `0 0 16px ${NEON_BLUE}66`,
            }}
          />
        )}
      </AnimatePresence>
      <motion.div
        className="absolute"
        animate={{
          scale: isWindingUp ? [1, 0.85, 1, 0.85] : isTeleporting ? [0.5, 1.15, 1] : 1,
          opacity: isWindingUp ? [1, 0.7, 1, 0.7] : 1,
        }}
        transition={{
          duration: isWindingUp ? 0.15 : 0.2,
          repeat: isWindingUp ? Infinity : 0,
        }}
        style={{
          left: pos.x,
          top: pos.y,
          width: PLAYER_SIZE,
          height: PLAYER_SIZE,
          background: isWindingUp ? NEON_BLUE : NEON_GREEN,
          boxShadow: isWindingUp
            ? `0 0 16px ${NEON_BLUE}aa, 0 0 32px ${NEON_BLUE}44`
            : `0 0 12px ${NEON_GREEN}88, 0 0 24px ${NEON_GREEN}44, inset 0 0 6px rgba(255,255,255,0.2)`,
          border: `1px solid ${isWindingUp ? NEON_BLUE : NEON_GREEN}cc`,
          transition: 'background 0.1s, box-shadow 0.1s',
        }}
      >
        <div
          className="absolute inset-[3px]"
          style={{
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
          }}
        />
      </motion.div>
    </>
  )
}

function Shadow({ pos }: { pos: Position }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.5, scale: 1 }}
      className="absolute"
      style={{
        left: pos.x,
        top: pos.y,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        background: NEON_PURPLE,
        boxShadow: `0 0 16px ${NEON_PURPLE}66, 0 0 32px ${NEON_PURPLE}33`,
        border: `1px solid ${NEON_PURPLE}88`,
      }}
    >
      <div
        className="absolute inset-[3px]"
        style={{
          border: `1px dashed ${NEON_PURPLE}aa`,
          background: `linear-gradient(135deg, rgba(168,85,247,0.2) 0%, transparent 50%)`,
        }}
      />
    </motion.div>
  )
}

// Tutorial step-by-step overlay
const TUTORIAL_MESSAGES: Record<TutorialStep, { title: string; keys: string; sub: string } | null> = {
  move: { title: 'MOVE', keys: 'A / D  or  LEFT / RIGHT', sub: 'Press a movement key to continue' },
  jump: { title: 'JUMP', keys: 'W  or  SPACE', sub: 'Jump to reach higher platforms' },
  teleport: { title: 'TELEPORT', keys: 'SHIFT + DIRECTION', sub: 'Phase through thin walls' },
  restart: { title: 'RESTART', keys: 'R', sub: 'Spawns your shadow to retrace your path' },
  done: null,
}

function TutorialOverlay({ step }: { step: TutorialStep }) {
  const msg = TUTORIAL_MESSAGES[step]
  if (!msg) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pointer-events-none absolute left-0 right-0 top-6 z-30 flex flex-col items-center"
    >
      <div
        className="flex flex-col items-center border px-6 py-3"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          borderColor: `${NEON_GREEN}44`,
          boxShadow: `0 0 20px ${NEON_GREEN}15`,
        }}
      >
        <span
          className="font-mono text-[10px] tracking-[0.3em]"
          style={{ color: `${NEON_GREEN}88` }}
        >
          {'TUTORIAL'}
        </span>
        <span
          className="mt-1 font-mono text-lg font-bold tracking-wider"
          style={{ color: NEON_GREEN, textShadow: `0 0 12px ${NEON_GREEN}66` }}
        >
          {msg.title}
        </span>
        <div className="mt-2 flex gap-2">
          {msg.keys.split('  ').map((k, i) => (
            <kbd
              key={i}
              className="border px-2 py-1 font-mono text-xs text-foreground"
              style={{
                borderColor: `${NEON_GREEN}44`,
                background: 'rgba(0, 255, 136, 0.08)',
              }}
            >
              {k.trim()}
            </kbd>
          ))}
        </div>
        <span className="mt-2 font-mono text-[10px] text-muted-foreground">
          {msg.sub}
        </span>
      </div>
    </motion.div>
  )
}

// "You already know this" popup
function FlagMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
    >
      <div
        className="flex flex-col items-center border px-10 py-6"
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          borderColor: `${NEON_PURPLE}66`,
          boxShadow: `0 0 40px ${NEON_PURPLE}22`,
        }}
      >
        <motion.span
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="font-mono text-xl font-bold tracking-wider"
          style={{ color: NEON_PURPLE, textShadow: `0 0 16px ${NEON_PURPLE}88` }}
        >
          YOU ALREADY KNOW THIS
        </motion.span>
        <span className="mt-2 font-mono text-xs text-muted-foreground">
          {'Your shadow will retrace your steps...'}
        </span>
      </div>
    </motion.div>
  )
}

// "You're too slow" message
function LoseMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
    >
      <div
        className="flex flex-col items-center border px-12 py-8"
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
          borderColor: `#ff4444aa`,
          boxShadow: `0 0 40px #ff444444`,
        }}
      >
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="font-mono text-2xl font-bold tracking-wider"
          style={{ color: '#ff5555', textShadow: `0 0 16px #ff555599` }}
        >
          YOU'RE TOO SLOW
        </motion.span>
        <span className="mt-3 font-mono text-xs text-muted-foreground">
          {'Your shadow reached the flag first...'}
        </span>
        <span className="mt-3 font-mono text-xs" style={{ color: NEON_GREEN }}>
          {'Click RETRY or press R to try again'}
        </span>
      </div>
    </motion.div>
  )
}

export function GameCanvas({
  level,
  playerPos,
  shadowPos,
  isGlitching,
  isTeleporting,
  isWindingUp,
  teleportTrails,
  reachedFlag,
  showFlagMessage,
  tutorialStep,
  hasLost,
  showLoseMessage,
}: GameCanvasProps) {
  return (
    <div
      className={`relative overflow-hidden border border-border ${isGlitching ? 'animate-glitch' : ''}`}
      style={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        background: '#08060e',
      }}
    >
      {/* Ruins background image */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'url(/images/ruins-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          opacity: 0.35,
          filter: 'brightness(0.7) contrast(1.1)',
        }}
      />

      {/* Subtle grid overlay on top of bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(${NEON_PURPLE}44 1px, transparent 1px),
            linear-gradient(90deg, ${NEON_PURPLE}44 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Platforms */}
      {level.platforms.map((p, i) => (
        <PlatformBlock key={`plat-${i}`} x={p.x} y={p.y} w={p.w} h={p.h} />
      ))}

      {/* Walls */}
      {level.walls.map((w, i) => (
        <WallBlock key={`wall-${i}`} x={w.x} y={w.y} w={w.w} h={w.h} isThin={w.isThin} />
      ))}

      {/* Flag */}
      {level.flag && (
        <Flag x={level.flag.x} y={level.flag.y} pulse={!reachedFlag} />
      )}

      {/* Teleport trails */}
      {teleportTrails.map((trail) => (
        <TeleportTrailParticle key={trail.id} trail={trail} />
      ))}

      {/* Shadow */}
      {shadowPos && <Shadow pos={shadowPos} />}

      {/* Player */}
      <Player pos={playerPos} isTeleporting={isTeleporting} isWindingUp={isWindingUp} />

      {/* Tutorial overlay */}
      <AnimatePresence mode="wait">
        {tutorialStep !== 'done' && (
          <TutorialOverlay key={tutorialStep} step={tutorialStep} />
        )}
      </AnimatePresence>

      {/* Flag reached message */}
      <AnimatePresence>
        {showFlagMessage && <FlagMessage />}
      </AnimatePresence>

      {/* Too slow message */}
      <AnimatePresence>
        {showLoseMessage && <LoseMessage />}
      </AnimatePresence>

      {/* Glitch overlay */}
      <AnimatePresence>
        {isGlitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                ${NEON_PURPLE}22 0px,
                transparent 2px,
                transparent 4px
              )`,
              mixBlendMode: 'screen',
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x: [0, Math.random() * 40 - 20, Math.random() * -30, 0],
                  opacity: [0.8, 1, 0.6, 0.9],
                }}
                transition={{
                  duration: 0.15,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  delay: i * 0.02,
                }}
                className="absolute w-full"
                style={{
                  top: `${(i / 8) * 100}%`,
                  height: `${100 / 8}%`,
                  background: i % 2 === 0 ? `${NEON_PURPLE}15` : `${NEON_GREEN}10`,
                }}
              />
            ))}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ textShadow: `0 0 20px ${NEON_PURPLE}` }}
            >
              <motion.span
                animate={{ opacity: [1, 0, 1, 0.5, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
                className="font-mono text-xl font-bold text-neon-purple"
              >
                TEMPORAL COLLISION
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScanlineOverlay />
    </div>
  )
}
