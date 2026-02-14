'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SIZE, NEON_GREEN, NEON_BLUE, NEON_PURPLE, type LevelData, type Platform, type Wall, type FlagPos } from './constants'

const GRID_SIZE = 20
const TOOL_SIZE = 80
const WALL_HEIGHT = 100

interface LevelEditorProps {
  onSave: (level: LevelData) => void
  onBack: () => void
}

type EditorTool = 'platform' | 'wall' | 'spawn1' | 'spawn2' | 'flag' | null

interface EditorState {
  platforms: Platform[]
  walls: Wall[]
  playerStart: { x: number; y: number }
  playerStart2: { x: number; y: number }
  flag: FlagPos
}

export function LevelEditor({ onSave, onBack }: LevelEditorProps) {
  const [levelName, setLevelName] = useState('CUSTOM LEVEL')
  const [levelSubtitle, setLevelSubtitle] = useState('Made by player')
  const [selectedTool, setSelectedTool] = useState<EditorTool>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const [editorState, setEditorState] = useState<EditorState>({
    platforms: [],
    walls: [],
    playerStart: { x: 100, y: GAME_HEIGHT - 60 },
    playerStart2: { x: 800, y: 100 },
    flag: { x: 450, y: 100 },
  })

  const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!selectedTool || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(GAME_WIDTH, snapToGrid(e.clientX - rect.left)))
    const y = Math.max(0, Math.min(GAME_HEIGHT, snapToGrid(e.clientY - rect.top)))

    if (selectedTool === 'platform' || selectedTool === 'wall') {
      setIsDragging(true)
      setDragStart({ x, y })
    } else if (selectedTool === 'spawn1') {
      setEditorState((prev) => ({ ...prev, playerStart: { x, y } }))
    } else if (selectedTool === 'spawn2') {
      setEditorState((prev) => ({ ...prev, playerStart2: { x, y } }))
    } else if (selectedTool === 'flag') {
      setEditorState((prev) => ({ ...prev, flag: { x, y } }))
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedTool || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(GAME_WIDTH, snapToGrid(e.clientX - rect.left)))
    const y = Math.max(0, Math.min(GAME_HEIGHT, snapToGrid(e.clientY - rect.top)))

    // Show preview while dragging (visual feedback)
  }

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !selectedTool || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(GAME_WIDTH, snapToGrid(e.clientX - rect.left)))
    const y = Math.max(0, Math.min(GAME_HEIGHT, snapToGrid(e.clientY - rect.top)))

    const width = Math.max(GRID_SIZE, Math.abs(x - dragStart.x))
    const height = Math.max(GRID_SIZE, Math.abs(y - dragStart.y))
    const startX = Math.min(dragStart.x, x)
    const startY = Math.min(dragStart.y, y)

    if (selectedTool === 'platform') {
      setEditorState((prev) => ({
        ...prev,
        platforms: [...prev.platforms, { x: startX, y: startY, w: width, h: height }],
      }))
    } else if (selectedTool === 'wall') {
      setEditorState((prev) => ({
        ...prev,
        walls: [...prev.walls, { x: startX, y: startY, w: width, h: height, isThin: height < WALL_HEIGHT }],
      }))
    }

    setIsDragging(false)
  }

  const handleSave = () => {
    const level: LevelData = {
      name: levelName,
      subtitle: levelSubtitle,
      platforms: editorState.platforms,
      walls: editorState.walls,
      playerStart: editorState.playerStart,
      playerStart2: editorState.playerStart2,
      flag: editorState.flag,
    }
    onSave(level)
  }

  const handleClear = () => {
    setEditorState({
      platforms: [],
      walls: [],
      playerStart: { x: 100, y: GAME_HEIGHT - 60 },
      playerStart2: { x: 800, y: 100 },
      flag: { x: 450, y: 100 },
    })
  }

  const deletePlatform = (idx: number) => {
    setEditorState((prev) => ({
      ...prev,
      platforms: prev.platforms.filter((_, i) => i !== idx),
    }))
  }

  const deleteWall = (idx: number) => {
    setEditorState((prev) => ({
      ...prev,
      walls: prev.walls.filter((_, i) => i !== idx),
    }))
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={levelName}
            onChange={(e) => setLevelName(e.target.value)}
            className="border px-3 py-2 font-mono text-sm bg-card"
            placeholder="Level Name"
            maxLength={30}
          />
          <input
            type="text"
            value={levelSubtitle}
            onChange={(e) => setLevelSubtitle(e.target.value)}
            className="border px-3 py-2 font-mono text-sm bg-card"
            placeholder="Subtitle"
            maxLength={30}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="border border-border bg-secondary px-4 py-2 font-mono text-sm transition-all hover:border-foreground/30"
          >
            BACK
          </button>
          <button
            onClick={handleSave}
            className="border px-4 py-2 font-mono text-sm transition-all"
            style={{ borderColor: NEON_GREEN + '33', background: NEON_GREEN + '11', color: NEON_GREEN }}
          >
            SAVE LEVEL
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Canvas */}
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={() => setIsDragging(false)}
          className="relative border border-border bg-black cursor-crosshair select-none"
          style={{
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            backgroundImage: `linear-gradient(${NEON_PURPLE}11 1px, transparent 1px), linear-gradient(90deg, ${NEON_PURPLE}11 1px, transparent 1px)`,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          }}
        >
          {/* Platforms */}
          {editorState.platforms.map((plat, idx) => (
            <div
              key={`plat-${idx}`}
              onClick={(e) => {
                e.stopPropagation()
                deletePlatform(idx)
              }}
              className="absolute border border-neon-green bg-neon-green/10 cursor-pointer hover:opacity-70 transition-opacity"
              style={{
                left: plat.x,
                top: plat.y,
                width: plat.w,
                height: plat.h,
                boxShadow: `inset 0 0 8px ${NEON_GREEN}44`,
              }}
              title="Click to delete"
            />
          ))}

          {/* Walls */}
          {editorState.walls.map((wall, idx) => (
            <div
              key={`wall-${idx}`}
              onClick={(e) => {
                e.stopPropagation()
                deleteWall(idx)
              }}
              className="absolute border border-neon-blue bg-neon-blue/20 cursor-pointer hover:opacity-70 transition-opacity"
              style={{
                left: wall.x,
                top: wall.y,
                width: wall.w,
                height: wall.h,
                boxShadow: `inset 0 0 8px ${NEON_BLUE}44`,
              }}
              title="Click to delete"
            />
          ))}

          {/* Spawn Point 1 */}
          <div
            onClick={() => setSelectedTool('spawn1')}
            className="absolute w-6 h-6 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform"
            style={{
              left: editorState.playerStart.x,
              top: editorState.playerStart.y,
              borderColor: NEON_GREEN,
              background: NEON_GREEN + '22',
            }}
            title="Spawn 1 (Run 1)"
          />

          {/* Spawn Point 2 */}
          <div
            onClick={() => setSelectedTool('spawn2')}
            className="absolute w-6 h-6 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform"
            style={{
              left: editorState.playerStart2.x,
              top: editorState.playerStart2.y,
              borderColor: NEON_PURPLE,
              background: NEON_PURPLE + '22',
            }}
            title="Spawn 2 (Run 2)"
          />

          {/* Flag */}
          <div
            onClick={() => setSelectedTool('flag')}
            className="absolute cursor-pointer hover:scale-110 transition-transform"
            style={{
              left: editorState.flag.x,
              top: editorState.flag.y,
            }}
            title="Goal Flag"
          >
            <div
              style={{
                width: 2,
                height: 28,
                background: NEON_GREEN,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 4,
                top: 1,
                width: 12,
                height: 10,
                background: NEON_GREEN,
                clipPath: 'polygon(0 0, 100% 20%, 100% 80%, 0 100%)',
              }}
            />
          </div>

          {/* Dragging preview */}
          {isDragging && selectedTool && (
            <div
              className="absolute border-2 border-dashed"
              style={{
                left: Math.min(dragStart.x, dragStart.x),
                top: Math.min(dragStart.y, dragStart.y),
                width: Math.abs(dragStart.x - dragStart.x) || 0,
                height: Math.abs(dragStart.y - dragStart.y) || 0,
                borderColor: selectedTool === 'platform' ? NEON_GREEN : NEON_BLUE,
                opacity: 0.5,
              }}
            />
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-2">
          <div className="text-sm font-mono text-muted-foreground mb-2">TOOLS</div>

          <button
            onClick={() => setSelectedTool(selectedTool === 'platform' ? null : 'platform')}
            className={`px-4 py-2 font-mono text-xs border transition-all ${
              selectedTool === 'platform' ? 'opacity-100' : 'opacity-60'
            }`}
            style={{
              borderColor: NEON_GREEN + '44',
              background: selectedTool === 'platform' ? NEON_GREEN + '22' : 'transparent',
              color: NEON_GREEN,
            }}
          >
            PLATFORM
          </button>

          <button
            onClick={() => setSelectedTool(selectedTool === 'wall' ? null : 'wall')}
            className={`px-4 py-2 font-mono text-xs border transition-all ${
              selectedTool === 'wall' ? 'opacity-100' : 'opacity-60'
            }`}
            style={{
              borderColor: NEON_BLUE + '44',
              background: selectedTool === 'wall' ? NEON_BLUE + '22' : 'transparent',
              color: NEON_BLUE,
            }}
          >
            WALL
          </button>

          <button
            onClick={() => setSelectedTool(selectedTool === 'spawn1' ? null : 'spawn1')}
            className={`px-4 py-2 font-mono text-xs border transition-all ${
              selectedTool === 'spawn1' ? 'opacity-100' : 'opacity-60'
            }`}
            style={{
              borderColor: NEON_GREEN + '44',
              background: selectedTool === 'spawn1' ? NEON_GREEN + '22' : 'transparent',
              color: NEON_GREEN,
            }}
          >
            SPAWN 1
          </button>

          <button
            onClick={() => setSelectedTool(selectedTool === 'spawn2' ? null : 'spawn2')}
            className={`px-4 py-2 font-mono text-xs border transition-all ${
              selectedTool === 'spawn2' ? 'opacity-100' : 'opacity-60'
            }`}
            style={{
              borderColor: NEON_PURPLE + '44',
              background: selectedTool === 'spawn2' ? NEON_PURPLE + '22' : 'transparent',
              color: NEON_PURPLE,
            }}
          >
            SPAWN 2
          </button>

          <button
            onClick={() => setSelectedTool(selectedTool === 'flag' ? null : 'flag')}
            className={`px-4 py-2 font-mono text-xs border transition-all ${
              selectedTool === 'flag' ? 'opacity-100' : 'opacity-60'
            }`}
            style={{
              borderColor: NEON_GREEN + '44',
              background: selectedTool === 'flag' ? NEON_GREEN + '22' : 'transparent',
              color: NEON_GREEN,
            }}
          >
            FLAG
          </button>

          <hr className="my-2 border-border" />

          <button
            onClick={handleClear}
            className="px-4 py-2 font-mono text-xs border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
          >
            CLEAR ALL
          </button>

          <div className="text-[10px] text-muted-foreground mt-4">
            <p>Platform: drag to create</p>
            <p>Wall: drag to create</p>
            <p>Spawn/Flag: click to place</p>
            <p>Click element to delete</p>
          </div>
        </div>
      </div>
    </div>
  )
}
