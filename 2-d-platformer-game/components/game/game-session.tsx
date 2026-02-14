'use client'

import { useGameLoop } from './use-game-loop'
import { GameCanvas } from './game-canvas'
import { GameHUD } from './game-hud'
import { ControlsHelp } from './controls-help'
import { GAME_WIDTH } from './constants'
import type { LevelData } from './constants'

interface GameSessionProps {
  level: LevelData
  levelIndex: number
  onBack: () => void
}

export function GameSession({ level, levelIndex, onBack }: GameSessionProps) {
  const {
    playerPos,
    shadowPos,
    isGlitching,
    isTeleporting,
    isWindingUp,
    runNumber,
    frameCount,
    teleportTrails,
    reachedFlag,
    showFlagMessage,
    tutorialStep,
    restart,
    hasLost,
    showLoseMessage,
  } = useGameLoop(level)

  return (
    <div className="flex flex-col items-center gap-0">
      {/* Header */}
      <div style={{ width: GAME_WIDTH }}>
        <div className="flex items-center justify-between border-x border-t border-border bg-card px-4 py-2">
          <h1
            className="font-mono text-sm font-bold tracking-widest text-neon-purple"
            style={{ textShadow: '0 0 12px rgba(168, 85, 247, 0.4)' }}
          >
            CHRONOSHIFT
          </h1>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-muted-foreground">
              {'LVL '}
              {String(levelIndex + 1).padStart(2, '0')}
              {' // '}
              {level.name}
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-neon-green animate-neon-pulse" />
          </div>
        </div>
        <GameHUD
          runNumber={runNumber}
          frameCount={frameCount}
          hasShadow={shadowPos !== null}
          reachedFlag={reachedFlag}
          onRestart={restart}
          onBack={onBack}
          hasLost={hasLost}
        />
      </div>

      {/* Game Area */}
      <GameCanvas
        level={level}
        playerPos={playerPos}
        shadowPos={shadowPos}
        isGlitching={isGlitching}
        isTeleporting={isTeleporting}
        isWindingUp={isWindingUp}
        teleportTrails={teleportTrails}
        reachedFlag={reachedFlag}
        showFlagMessage={showFlagMessage}
        tutorialStep={tutorialStep}
        hasLost={hasLost}
        showLoseMessage={showLoseMessage}
      />

      {/* Controls */}
      <div style={{ width: GAME_WIDTH }} className="border-x border-b border-border bg-card">
        <ControlsHelp />
      </div>
    </div>
  )
}
