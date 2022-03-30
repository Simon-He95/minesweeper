<script setup lang="ts">
interface BlockState {
  x: number
  y: number
  revealed?: boolean
  mine?: boolean
  flagged?: boolean
  adjacentMines: number
}
const HEIGHT = 10
const WIDTH = 10
const state = reactive(Array.from({ length: HEIGHT },
  (_, y) => Array.from({ length: WIDTH },
    (_, x): BlockState => ({
      x, y, adjacentMines: 0, revealed: false,
    }))))

function generateMines(initial: BlockState) {
  for (const row of state) {
    for (const block of row) {
      if (Math.abs(initial.x - block.x) <= 1 || Math.abs(initial.y - block.y) <= 1)
        continue
      block.mine = Math.random() < 0.2
    }
  }
  updateNumber()
}

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

const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-orange-500',
  'text-red-500',
  'text-purple-500',
  'text-pink-500',
  'text-teal-500',
]

function updateNumber() {
  state.forEach((row, y) => {
    row.forEach((block, x) => {
      if (block.mine) return
      getSiblings(block).forEach((b) => {
        if (b.mine)
          block.adjacentMines += 1
      })
    })
  })
}

function getSiblings(block: BlockState) {
  return directions.map(([dx, dy]) => {
    const x2 = block.x + dx
    const y2 = block.y + dy
    if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT)
      return undefined
    return state[y2][x2]
  })
    .filter(Boolean) as BlockState[]
}

let mineGenerated = false
const dev = ref(false)
function onClick(block: BlockState) {
  if (!mineGenerated) {
    generateMines(block)
    mineGenerated = true
  }
  block.revealed = true

  if (block.mine) {
    alert('boom')
    dev.value = true
  }
  expandZero(block)
}

function expandZero(block: BlockState) {
  if (block.adjacentMines !== 0) return
  getSiblings(block).forEach((s) => {
    if (!s.revealed) {
      s.revealed = true
      expandZero(s)
    }
  })
}

function getBlockClass(block: BlockState) {
  if (!block.revealed)
    return 'bg-gray-500/10'

  return block.mine ? 'bg-red-500/50' : numberColors[block.adjacentMines]
}

</script>
<template>
  <div>
    Minesweeper
    <div p5>
      <div v-for="row, y in state" :key="y" flex="~" items-center justify-center>
        <button
          v-for="block, x in row"
          :key="x"
          flex="~"
          items-center
          justify-center
          w-10
          h-10
          m="0.5"
          border="1 gray-400/10"
          hover="bg-gray/10"
          :class="getBlockClass(block)"
          @click="onClick(block)"
        >
          <template v-if="block.revealed || dev">
            <div v-if="block.mine" i-mdi-mine />
            <div v-else>{{ block.adjacentMines }}</div>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
