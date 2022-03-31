
<script setup lang="ts">
import MineBlock from './components/MineBlock.vue'
import { GamePlay } from './logic'
import { isDev, toggleDev } from '~/storage'
const play = new GamePlay(10, 10)
useStorage('vueswepper-state', play.state)
const state = computed(() => play.board)
</script>
<template>
  <main font-sans p="x-4 y-10" text="center gray-700 dark:gray-200">
    <div>
      Minesw
      <div>
        Minesweeper
        <div p5>
          <div v-for="row, y in state" :key="y" flex="~" items-center justify-center>
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
    <Footer />
  </main>
</template>
