'use client'

import { motion } from 'framer-motion'
import { NEON_GREEN, NEON_PURPLE } from './constants'

interface GameHUDProps {
  runNumber: number
  frameCount: number
  hasShadow: boolean
  reachedFlag: boolean
  onRestart: () => void
  onBack: () => void
  hasLost?: boolean
}

export function GameHUD({ runNumber, frameCount, hasShadow, reachedFlag, onRestart, onBack, hasLost }: GameHUDProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: NEON_GREEN, boxShadow: `0 0 8px ${NEON_GREEN}66` }}
          />
          <span className="font-mono text-xs" style={{ color: NEON_GREEN }}>
            {'RUN #'}{String(runNumber).padStart(3, '0')}
          </span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {'FRM:'}{String(frameCount).padStart(5, '0')}
        </span>
        {hasShadow && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-mono text-xs"
            style={{ color: NEON_PURPLE, textShadow: `0 0 8px ${NEON_PURPLE}66` }}
          >
            SHADOW ACTIVE
          </motion.span>
        )}
        {reachedFlag && (
          <span className="font-mono text-[10px] text-muted-foreground">
            FLAG REACHED
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="border border-border bg-secondary px-3 py-1 font-mono text-xs text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground"
        >
          LEVELS
        </button>
        <button
          onClick={onRestart}
          className="border px-3 py-1 font-mono text-xs transition-all"
          style={{
            borderColor: `${NEON_PURPLE}33`,
            background: `${NEON_PURPLE}11`,
            color: NEON_PURPLE,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${NEON_PURPLE}66`
            e.currentTarget.style.background = `${NEON_PURPLE}22`
            e.currentTarget.style.boxShadow = `0 0 12px ${NEON_PURPLE}33`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${NEON_PURPLE}33`
            e.currentTarget.style.background = `${NEON_PURPLE}11`
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {hasLost ? 'RETRY [R]' : 'RESTART [R]'}
        </button>
      </div>
    </div>
  )
}
