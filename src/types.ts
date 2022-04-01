export interface BlockState {
  x: number
  y: number
  revealed?: boolean
  mine?: boolean
  flagged?: boolean
  adjacentMines: number
}

export type GameStatus = 'play' | 'won' | 'lost'

export interface GameState {
  board: BlockState[][]
  mineGenerated: boolean
  gameState: GameStatus
  startMS: number
  endMS: number
}
