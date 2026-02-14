'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LEVELS,
  NEON_PURPLE,
  NEON_GREEN,
  NEON_BLUE,
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_SIZE,
  type LevelData,
} from './constants'
import { ScanlineOverlay } from './scanline-overlay'
import { loadCustomLevels, type CustomLevel } from '@/lib/supabase'

interface LevelSelectProps {
  onSelect: (levelIndex: number) => void
  onBack: () => void
  onEditLevel: () => void
  onSelectCustomLevel?: (level: LevelData) => void
}

const levelColors = [NEON_GREEN, NEON_BLUE, NEON_PURPLE]
const levelDifficulty = ['EASY', 'MEDIUM', 'HARD']

function MiniMap({ levelIndex }: { levelIndex: number }) {
  const level = LEVELS[levelIndex]
  const scale = 0.16
  const color = levelColors[levelIndex]

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: GAME_WIDTH * scale,
        height: GAME_HEIGHT * scale,
        background: '#08060e',
        border: `1px solid ${color}33`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'url(/images/ruins-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          opacity: 0.15,
        }}
      />
      {level.platforms.map((p, i) => (
        <div
          key={`p-${i}`}
          className="absolute"
          style={{
            left: p.x * scale,
            top: p.y * scale,
            width: p.w * scale,
            height: Math.max(p.h * scale, 1),
            background: `${color}55`,
          }}
        />
      ))}
      {level.walls.map((w, i) => (
        <div
          key={`w-${i}`}
          className="absolute"
          style={{
            left: w.x * scale,
            top: w.y * scale,
            width: Math.max(w.w * scale, 1),
            height: w.h * scale,
            background: w.isThin ? `${NEON_BLUE}44` : `${color}22`,
          }}
        />
      ))}
      <div
        className="absolute"
        style={{
          left: level.playerStart.x * scale,
          top: level.playerStart.y * scale,
          width: Math.max(PLAYER_SIZE * scale, 2),
          height: Math.max(PLAYER_SIZE * scale, 2),
          background: NEON_GREEN,
          boxShadow: `0 0 3px ${NEON_GREEN}88`,
        }}
      />
      {level.flag && (
        <div
          className="absolute"
          style={{
            left: level.flag.x * scale,
            top: level.flag.y * scale,
            width: 3,
            height: 5,
            background: NEON_GREEN,
            boxShadow: `0 0 4px ${NEON_GREEN}66`,
          }}
        />
      )}
    </div>
  )
}

export function LevelSelect({ onSelect, onBack, onEditLevel, onSelectCustomLevel }: LevelSelectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [customLevels, setCustomLevels] = useState<CustomLevel[]>([])
  const [showCustom, setShowCustom] = useState(false)

  useEffect(() => {
    loadCustomLevels().then(setCustomLevels)
  }, [])

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden border border-border"
      style={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        background: '#08060e',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'url(/images/ruins-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          opacity: 0.15,
          filter: 'brightness(0.6)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(${NEON_PURPLE}44 1px, transparent 1px), linear-gradient(90deg, ${NEON_PURPLE}44 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-2 flex items-center gap-3"
      >
        <div className="h-px w-12" style={{ background: `linear-gradient(90deg, transparent, ${NEON_PURPLE}66)` }} />
        <h2 className="font-mono text-sm font-bold tracking-[0.3em] text-muted-foreground">
          {showCustom ? 'CUSTOM LEVELS' : 'SELECT LEVEL'}
        </h2>
        <div className="h-px w-12" style={{ background: `linear-gradient(90deg, ${NEON_PURPLE}66, transparent)` }} />
      </motion.div>

      {!showCustom && customLevels.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.7 }}
          onClick={() => setShowCustom(true)}
          className="z-10 mb-2 cursor-pointer font-mono text-xs tracking-wider text-neon-blue transition-all hover:text-neon-blue hover:opacity-100 border border-neon-blue/30 px-3 py-1"
          style={{ color: NEON_BLUE }}
        >
          {'CUSTOM LEVELS (' + customLevels.length + ')'}
        </motion.button>
      )}

      {showCustom && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.7 }}
          onClick={() => setShowCustom(false)}
          className="z-10 mb-2 cursor-pointer font-mono text-xs tracking-wider text-neon-green transition-all hover:text-neon-green hover:opacity-100 border border-neon-green/30 px-3 py-1"
          style={{ color: NEON_GREEN }}
        >
          {'BUILT-IN LEVELS'}
        </motion.button>
      )}

      <div className="z-10 flex items-stretch gap-5 px-8 py-6 flex-wrap justify-center">
        {!showCustom ? (
          LEVELS.map((level, index) => {
            const color = levelColors[index]
            const isHovered = hoveredIndex === index

            return (
              <motion.button
                key={level.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.15, duration: 0.5 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelect(index)}
                className="group relative flex cursor-pointer flex-col items-center border bg-transparent px-5 pb-4 pt-3 transition-all duration-300"
                style={{
                  width: 200,
                  borderColor: isHovered ? `${color}88` : `${color}33`,
                  boxShadow: isHovered ? `0 0 24px ${color}33, inset 0 0 16px ${color}11` : `0 0 8px ${color}11`,
                  background: isHovered ? `linear-gradient(180deg, ${color}08 0%, transparent 100%)` : 'transparent',
                }}
              >
                <span className="mb-1 font-mono text-[10px] tracking-widest" style={{ color: `${color}88` }}>
                  {'LEVEL '}{String(index + 1).padStart(2, '0')}
                </span>
                <div className="mb-3"><MiniMap levelIndex={index} /></div>
                <span
                  className="mb-1 font-mono text-xs font-bold tracking-wider"
                  style={{ color, textShadow: isHovered ? `0 0 12px ${color}66` : 'none' }}
                >
                  {level.name}
                </span>
                <span className="mb-2 font-mono text-[10px] text-muted-foreground">{level.subtitle}</span>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((dot) => (
                    <div
                      key={dot}
                      className="h-1.5 w-1.5"
                      style={{
                        background: dot <= index ? color : `${color}22`,
                        boxShadow: dot <= index ? `0 0 4px ${color}66` : 'none',
                      }}
                    />
                  ))}
                  <span className="ml-1 font-mono text-[9px] tracking-wider" style={{ color: `${color}88` }}>
                    {levelDifficulty[index]}
                  </span>
                </div>
                <motion.div
                  className="absolute bottom-0 left-0 h-[2px]"
                  initial={{ width: '0%' }}
                  animate={{ width: isHovered ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                  style={{ background: color, boxShadow: `0 0 8px ${color}88` }}
                />
              </motion.button>
            )
          })
        ) : (
          customLevels.length > 0 ? (
            customLevels.map((level, index) => {
              const isHovered = hoveredIndex === 100 + index
              return (
                <motion.button
                  key={level.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.15, duration: 0.5 }}
                  onMouseEnter={() => setHoveredIndex(100 + index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    if (onSelectCustomLevel) {
                      onSelectCustomLevel(level as any)
                    }
                  }}
                  className="group relative flex cursor-pointer flex-col items-center border bg-transparent px-5 pb-4 pt-3 transition-all duration-300"
                  style={{
                    width: 200,
                    borderColor: isHovered ? `${NEON_BLUE}88` : `${NEON_BLUE}33`,
                    boxShadow: isHovered ? `0 0 24px ${NEON_BLUE}33, inset 0 0 16px ${NEON_BLUE}11` : `0 0 8px ${NEON_BLUE}11`,
                    background: isHovered ? `linear-gradient(180deg, ${NEON_BLUE}08 0%, transparent 100%)` : 'transparent',
                  }}
                >
                  <span className="mb-1 font-mono text-[10px] tracking-widest" style={{ color: `${NEON_BLUE}88` }}>
                    {'CUSTOM'}
                  </span>
                  <div className="mb-3 w-full h-16 bg-black/50 rounded border border-neon-blue/20" />
                  <span
                    className="mb-1 font-mono text-xs font-bold tracking-wider text-center"
                    style={{ color: NEON_BLUE, textShadow: isHovered ? `0 0 12px ${NEON_BLUE}66` : 'none' }}
                  >
                    {level.name}
                  </span>
                  <span className="mb-2 font-mono text-[10px] text-muted-foreground text-center">{level.subtitle}</span>
                  <motion.div
                    className="absolute bottom-0 left-0 h-[2px]"
                    initial={{ width: '0%' }}
                    animate={{ width: isHovered ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                    style={{ background: NEON_BLUE, boxShadow: `0 0 8px ${NEON_BLUE}88` }}
                  />
                </motion.button>
              )
            })
          ) : (
            <div className="text-center text-muted-foreground font-mono text-sm">
              <p>No custom levels yet</p>
              <p className="text-xs mt-2">Create one with the Level Editor!</p>
            </div>
          )
        )}
      </div>

      <div className="z-10 mt-4 flex gap-4">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8 }}
          onClick={onEditLevel}
          className="cursor-pointer font-mono text-xs tracking-wider text-neon-blue transition-all hover:text-neon-blue hover:opacity-100 border border-neon-blue/30 px-3 py-1"
          style={{ color: NEON_BLUE }}
        >
          {'LEVEL EDITOR'}
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8 }}
          onClick={onBack}
          className="cursor-pointer font-mono text-xs tracking-wider text-muted-foreground transition-all hover:text-foreground hover:opacity-100"
        >
          {'< BACK'}
        </motion.button>
      </div>

      <ScanlineOverlay />
    </div>
  )
}
