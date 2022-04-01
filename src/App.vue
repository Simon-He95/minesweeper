
<script setup lang="ts">
import MineBlock from './components/MineBlock.vue'
import { GamePlay } from './logic'
import { isDev, toggleDev } from '~/storage'
const play = new GamePlay(9, 9, 10)

const now = $(useNow())
const countDown = $computed(() => Math.round(((play.state.value?.endMS || +now) - play.stateMS) / 1000))
useStorage('vueswepper-state', play.state)
const state = computed(() => play.board)

const minesCount = $computed(() => play.blocks?.reduce((a, b) => {
  if (!play.state.value?.mineGenerated)
    return play.mines
  return a + (b.mine ? 1 : 0) - (b.flagged ? 1 : 0)
}, 0),
)
function newGame(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      play.reset(9, 9, 1)
      break
    case 'medium':
      play.reset(16, 16, 40)
      break
    case 'hard':
      play.reset(30, 16, 99)
      break
  }
}

watchEffect(() => {
  play.checkGameState()
})
</script>
<template>
  <main font-sans p="y-10" text="center gray-700 dark:gray-200">
    <div>
      Minesweeper
      <div flex="~ gap-1" justify-center p4>
        <button btn @click="play.reset()">New Game</button>
        <button btn @click="newGame('easy')">Easy</button>
        <button btn @click="newGame('medium')">Medium</button>
        <button btn @click="newGame('hard')">Hard</button>
      </div>
      <div flex="~ gap-10" justify-center>
        <div font-mono text-2xl flex="~ gap-1" items-center>
          <div i-carbon-timer />
          {{ countDown }}
        </div>
        <div font-mono text-2xl flex="~ gap-1" items-center>
          <div i-mdi-mine />
          {{ minesCount }}
        </div>
      </div>
      <div p5 w-full overflow-auto>
        <div v-for="row, y in state" :key="y" flex="~" items-center justify-center w-max ma>
          <MineBlock
            v-for="block, x in row"
            :key="x"
            :block="block"
            @click.prevent="play.onClick(block)"
            @dblclick.prevent="play.autoExpand(block)"
            @contextmenu.prevent="play.onRightClick(block)"
          />
        </div>
      </div>
      <div flex="~ gap-1" justify-center>
        <button btn @click="toggleDev()">{{ isDev ? 'DEV' : 'NORMAL' }}</button>
      </div>
    </div>
    <Confetti :passed="play.gameState === 'won'" />
    <Footer />
  </main>
</template>
