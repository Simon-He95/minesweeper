import type { BlockState, GameState, GameStatus } from './types'

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
  constructor(
    public width: number,
    public height: number,
    public mines: number,
  ) {
    this.reset()
  }

  get board() {
    return this.state.value?.board
  }

  get blocks() {
    return this.state.value?.board?.flat()
  }

  reset(
    width = this.width,
    height = this.height,
    mines = this.mines,
  ) {
    this.width = width
    this.height = height
    this.mines = mines

    this.state.value = {
      startMS: +Date.now(),
      mineGenerated: false,
      gameState: 'play',
      board: Array.from({ length: this.height },
        (_, y) => Array.from({ length: this.width },
          (_, x): BlockState => ({
            x, y, adjacentMines: 0, revealed: false,
          }))),
    }
  }

  random(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  randomInt(min: number, max: number) {
    return Math.round(this.random(min, max))
  }

  generateMines(state: BlockState[][], initial: BlockState) {
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      const block = state[y][x]
      if ((Math.abs(initial.x - x) <= 1 && Math.abs(initial.y - y) <= 1) || block.mine) return false
      block.mine = true
      return true
    }
    Array.from({ length: this.mines }, () => null).forEach(() => {
      // eslint-disable-next-line no-empty
      while (!placeRandom()) { }
    })
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
    debugger
    if (this.state.value?.gameState !== 'play') return
    if (block.revealed) return
    block.flagged = !block.flagged
    this.checkGameState()
  }

  onClick(block: BlockState) {
    if (this.state.value?.gameState !== 'play') return
    if (!this.state.value.mineGenerated) {
      this.generateMines(this.board!, block)
      this.state.value.mineGenerated = true
    }
    block.revealed = true

    if (block.mine)
      this.onGameOver('lost')

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
    if (blocks?.every(b => b.flagged || b.revealed || b.mine)) {
      if (blocks.some(b => b.flagged && !b.mine))
        this.onGameOver('lost')
      else
        this.onGameOver('won')
    }
  }

  autoExpand(block: BlockState) {
    const siblings = this.getSiblings(block)
    const flags = siblings.reduce((a, b) => a + (b.flagged ? 1 : 0), 0)
    const notRevealed = siblings.reduce((a, b) => a + (!b.revealed && !b.flagged ? 1 : 0), 0)
    if (flags === block.adjacentMines) {
      siblings.forEach((i) => {
        i.revealed = true
        if (i.mine)
          this.onGameOver('lost')
      })
    }
    const missingFlags = block.adjacentMines - flags
    if (notRevealed === missingFlags) {
      siblings.forEach((i) => {
        if (!i.revealed && !i.flagged)
          i.flagged = true
      })
    }
  }

  onGameOver(status: GameStatus) {
    this.state.value!.gameState = status
    this.state.value!.endMS = +Date.now()
    if (status === 'lost') {
      this.showAllMines()
      setTimeout(() => alert('lost'))
    }
  }

  get gameState() {
    return this.state.value?.gameState
  }

  get stateMS() {
    return this.state.value?.startMS || +Date.now()
  }
}
