
<script setup lang="ts">
import MineBlock from './components/MineBlock.vue'
import { GamePlay } from './logic'
import { isDev, toggleDev } from '~/storage'
const play = new GamePlay(5, 5, 1)

useStorage('vueswepper-state', play.state)
const state = computed(() => play.board)
watchEffect(() => {
  play.checkGameState()
})
</script>
<template>
  <main font-sans p="y-10" text="center gray-700 dark:gray-200">
    <div>
      Minesw
      <div>
        Minesweeper
        <div p5 w-full overflow-auto>
          <div v-for="row, y in state" :key="y" flex="~" items-center justify-center w-max ma>
            <MineBlock
              v-for="block, x in row"
              :key="x"
              :block="block"
              @click="play.onClick(block)"
              @contextmenu.prevent="play.onRightClick(block)"
            />
          </div>
        </div>
        <div flex="~ gap-1" justify-center>
          <button btn @click="toggleDev()">{{ isDev ? 'DEV' : 'NORMAL' }}</button>
          <button btn @click="play.reset()">REST</button>
        </div>
      </div>
    </div>
    <div>Counts: {{ play.blocks?.reduce((a, b) => a + (b.mine ? 1 : 0), 0) }}</div>
    <Confetti :passed="play.gameState === 'won'" />
    <Footer />
  </main>
</template>
