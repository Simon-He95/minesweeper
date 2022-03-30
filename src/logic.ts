import type { BlockState, GameState } from './types'
import { isDev } from './storage'

const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]

export class GamePlay {
  WIDTH = 10
  HEIGHT = 10
  state = ref<GameState>()
  constructor(public width: number, public height: number) {
    this.reset()
  }

  get board() {
    return this.state.value?.board
  }

  reset() {
    this.state.value = {
      mineGenerated: false,
      gameState: 'play',
      board: Array.from({ length: this.height },
        (_, y) => Array.from({ length: this.width },
          (_, x): BlockState => ({
            x, y, adjacentMines: 0, revealed: false,
          }))),
    }
  }

  generateMines(state: BlockState[][], initial: BlockState) {
    for (const row of state) {
      for (const block of row) {
        if (Math.abs(initial.x - block.x) <= 1 || Math.abs(initial.y - block.y) <= 1)
          continue
        block.mine = Math.random() < 0.3
      }
    }
    this.updateNumber()
  }

  updateNumber() {
    this.board?.forEach((row) => {
      row.forEach((block) => {
        if (block.mine) return
        this.getSiblings(block).forEach((b) => {
          if (b.mine)
            block.adjacentMines += 1
        })
      })
    })
  }

  getSiblings(block: BlockState) {
    return directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
        return undefined
      return this.board![y2][x2]
    })
      .filter(Boolean) as BlockState[]
  }

  onRightClick(block: BlockState) {
    if (this.state.value?.gameState !== 'play') return
    if (block.revealed) return
    block.flagged = !block.flagged
    this.checkGameState()
  }

  onClick(block: BlockState) {
    if (this.state.value?.gameState !== 'play') return
    if (!this.state.value.mineGenerated) {
      this.generateMines(this.board, block)
      this.state.value.mineGenerated = true
    }
    block.revealed = true

    if (block.mine) {
      this.state.value.gameState = 'lost'
      this.showAllMines()
      // isDev.value = true
    }
    this.expandZero(block)
    this.checkGameState()
  }

  showAllMines() {
    this.board?.flat().forEach((i) => {
      if (i.mine)
        i.revealed = true
    })
  }

  expandZero(block: BlockState) {
    if (block.adjacentMines !== 0) return
    this.getSiblings(block).forEach((s) => {
      if (!s.revealed) {
        s.revealed = true
        this.expandZero(s)
      }
    })
  }

  checkGameState() {
    if (!this.state.value?.mineGenerated)
      return
    const blocks = this.board?.flat()
    if (blocks?.every(b => b.flagged || b.revealed)) {
      if (blocks.some(b => b.flagged && !b.mine)) {
        this.state.value.gameState = 'lost'
        this.showAllMines()
      }
      else { this.state.value.gameState = 'won' }
    }
  }
}
