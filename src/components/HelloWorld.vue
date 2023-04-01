<script setup>
import { watch, ref } from 'vue'
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router'
const router = useRouter()
const route = useRoute()

const shareButtonsVisible = ref(false);

function toggleShareButtons() {
  shareButtonsVisible.value = !shareButtonsVisible.value;
  console.log(shareButtonsVisible)
  console.log(shareButtonsVisible.value)
}

const imageArray = ref([])

const url = ref( null )

url.value = route.query.randomUrl
console.log(route.fullPath)
console.log(route.query.randomUrl)
if ( !route.query.randomUrl ) {
  toRedirect()
} else {
  showGame()
}

watch( route, ( newValue, oldValue ) => {
  console.log( 'watch 已触发', newValue, oldValue )
  // 执行onMounted代码
  url.value = newValue.query.randomUrl
  showGame()
} )

function toRedirect (){
  axios.get('https://api.punengshuo.com/api/game/queryPuzzle')
  .then(response => {
    console.log( 'redirect' )
    router.push( '/home?randomUrl='+ response.data.data.url)
  })
  .catch(error => {
    console.log(error)
  })
}

function showGame(){
  axios.get('https://api.punengshuo.com/api/game/queryPuzzleByUrl?order_type=normal&url='+ url.value)
  .then(response => {
    console.log('showGame')
    imageArray.value = response.data.data.piecces
  })
  .catch(error => {
    console.log(error)
  })
}

function startGame(){
  axios.get('https://api.punengshuo.com/api/game/queryPuzzleByUrl?order_type=random&url='+ url.value)
  .then(response => {
    console.log(response.data.data.piecces)
    imageArray.value = response.data.data.piecces
  })
  .catch(error => {
    console.log(error)
  })
}



</script>

<template>
  <div>
    <div style="width: 300px; ${centerDivStyle}" id="container">
      <div style="display: flex; justify-content: space-between;">
        <div id="time" class="time-style">00:00</div>
        <div id="step" class="step-style">步数：12</div>
      </div>
      <div style="margin-top: 10px;">
        <div class="puzzle">
          <div v-for="(image, index) in imageArray.slice(0, 3)" :key="index" class="child" :id="'puzzle-' + (index + 1)">
            <img :src="image" class="puzzle-image">
          </div>


        </div>

        <div class="puzzle">
          <div v-for="(image, index) in imageArray.slice(3, 6)" :key="index" class="child" :id="'puzzle-' + (index + 1)">
            <img :src="image" class="puzzle-image">
          </div>
        </div>

        <div class="puzzle">
          <div v-for="(image, index) in imageArray.slice(6, 9)" :key="index" class="child" :id="'puzzle-' + (index + 1)">
            <img :src="image" class="puzzle-image">
          </div>
        </div>
      </div>


      <div style="display: flex; justify-content: center; margin-top: 10px;">
        <div class="start-button" @click="startGame">
          <i class="fas fa-play"></i>
        </div>

      </div>

    </div>

    <!-- Add a floating button at the bottom right corner with a light blue background color and a share icon -->

    <div class="float-ellipsis-button" @click="toggleShareButtons">

      <i class="fas fa-ellipsis-h"></i>
    </div>

    <div class="share-buttons" :style="{ display: shareButtonsVisible ? 'flex' : 'none' }">
      <div class="float-share-button">
        <i class="fas fa-share-alt"></i>
      </div>
      <div class="float-exchange-button">
        <i class="fas fa-exchange-alt"></i>
      </div>

    </div>

  </div>
</template>

<style scoped>
.time-style {
  border-radius: 5px;
  background-color: lightblue;
  padding: 5px 10px;
}

.step-style {
  border-radius: 5px;
  background-color: lightblue;
  padding: 5px 10px;
}

.puzzle {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  background-color: #f5f5f5;
}

.child {
  width: calc(100% / 3);
  height: 100px;
  background-color: #fff;
  box-sizing: border-box;
}

div .child + .child {
  margin-left: -1px;
  /* 使用margin-left为-1px覆盖默认的margin（0） */
}

.start-button {
  background-color: lightblue;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  /* added to remove the highlight on mobile devices */
}

.float-ellipsis-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: lightblue;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  /* added to remove the highlight on mobile devices */
}


.float-share-button {
  position: fixed;
  bottom: 20px;
  right: 80px;
  background-color: lightblue;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  /* added to remove the highlight on mobile devices */
}

.float-exchange-button {
  position: fixed;
  bottom: 20px;
  right: 140px;
  background-color: lightblue;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  /* added to remove the highlight on mobile devices */
}

.puzzle-image {
  max-width: 100%;
  max-height: 100%;
}
</style>

