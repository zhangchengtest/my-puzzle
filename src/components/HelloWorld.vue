<script setup>
import { watch, ref } from 'vue'
import axios from 'axios';
import { Swappable } from '@shopify/draggable'
import { useRoute, useRouter } from 'vue-router'
import Timer from './Timer.vue'
import Rank from './Rank.vue'
import { wexinShare } from '@/assets/common/weixin.js';
const router = useRouter()
const route = useRoute()

const shareButtonsVisible = ref(false);

function toggleShareButtons() {
  shareButtonsVisible.value = !shareButtonsVisible.value;
}

const imageArray = ref([])

const url = ref(null)

const timer = ref()
const rank = ref()
const isStart = ref(false)
const step = ref(0)

url.value = route.query.randomUrl
if (!route.query.randomUrl) {
  toRedirect()
} else {
  showGame()
}

watch(route, (newValue, oldValue) => {
  // 执行onMounted代码
  url.value = newValue.query.randomUrl
  showGame()
})

function toRedirect() {
  axios.get('https://api.punengshuo.com/api/game/queryPuzzle')
    .then(response => {
      router.push('/home?randomUrl=' + response.data.data.url)
    })
    .catch(error => {
      console.log(error)
    })
}

function showGame() {
  axios.get('https://api.punengshuo.com/api/game/queryPuzzleByUrl?order_type=normal&url=' + url.value)
    .then(response => {
      imageArray.value = response.data.data.piecces
    })
    .catch(error => {
      console.log(error)
    })
}

function startGame() {
  axios.get('https://api.punengshuo.com/api/game/queryPuzzleByUrl?order_type=random&url=' + url.value)
    .then(response => {
      imageArray.value = response.data.data.piecces
      timer.value.start()
      isStart.value = true
      swap()

    })
    .catch(error => {
      console.log(error)
    })
}

const ranks = ref([]);
//http://st.punengshuo.com/images/20230402000000/full.jpg
function getRank() {
  axios.get('https://api.punengshuo.com/api/game/queryPuzzleRank?&url=' + url.value)
    .then(response => {
      ranks.value = response.data.data
      rank.value.openModal()
    })
    .catch(error => {
      console.log(error)
    })
}
//https://api.punengshuo.com/api/game/savePuzzleRank
function savePuzzleRank(rankData) {
  axios.post('https://api.punengshuo.com/api/game/savePuzzleRank', rankData)
    .then(response => {
      getRank()
    })
    .catch(error => {
      console.log(error)
    })
}

function swap() {
  const swappable = new Swappable(document.querySelectorAll('.puzzle-all'), {
    draggable: 'img',
    delay: 0,
    mirror: {
      constrainDimensions: true
    }
  })
  swappable.on('drag:start', () => { })
  swappable.on('swappable:swapped', event => {
    // console.log( event.data.dragEvent.source.currentSrc )
    // // console.log( event.swappedElement.currentSrc )
    // var x2 = event.swappedElement.getAttribute( 'showx' )
    // var y2 = event.swappedElement.getAttribute( 'showy' )
    // a.value = x2
    // b.value = y2
  })
  swappable.on('drag:stop', event => {
    move()
    // console.log( event )
    // console.log( event.data.source.currentSrc )
    // shouldMove()
  })
  swappable.on('drag:move', () => { })
}

function move() {
  if (!isStart.value) return
  step.value = step.value + 1
  var arr = document.querySelectorAll('img')
  var result = ''
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].getAttribute('class') && arr[i].getAttribute('class').includes('draggable-mirror')) {
    } else if (arr[i].getAttribute('class') && arr[i].getAttribute('class').includes('draggable--original')) {
    } else {
      var s = arr[i]
        .getAttribute('src')
        .substring(len(arr[i].getAttribute('src')) - 5, len(arr[i].getAttribute('src')) - 4)

      result = result + ',' + s
    }
  }
  console.log(result.substring(1, len(result)))
  gameEnd(result.substring(1, len(result)))
}

function len(str) {
  return str.length
}

function gameEnd(result) {
  const target = creatArr(3).toString()
  if (result === target) {
    savePuzzleRank({ spendTime: timer.value.getTime(), step: step.value, username: '成', url: url.value })
  }
}

// 创建数组
function creatArr(level) {
  const arr = []
  let lin = []
  const levels = level * level + 1

  for (let i = 1; i < levels; i++) {
    lin.push(i)
    if (lin.length === level) {
      arr.push(lin)
      lin = []
    }
  }
  // arr[level - 1][level - 1] = 0
  return arr
}

const refresh = () => {
  step.value = 0
  isStart.value = false
  timer.value.reset()
  toRedirect()
}


function weixin() {
  var urls = window.location.href
  axios.get('https://api.punengshuo.com/api/wx/share?url=' + urls)
    .then(res => {
      //微信加签
      var obj = {
        appId: res.data.data.appId,
        nonceStr: res.data.data.nonceStr,
        signature: res.data.data.signature,
        timestamp: res.data.data.timestamp,
        jsApiList: ['onMenuShareAppMessage']
      };
      console.log('come weixin')
      console.log(url.value)
      let shareData = {
        title: 'title', // 分享标题
        desc: '测试2',
        link: urls,
        // link: window.location.href,
        imgUrl: '' // 分享图标
      };
      //引用
      wexinShare(obj, shareData);
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
        <div id="time" class="time-style">
          <Timer ref="timer"></Timer>
        </div>
        <div id="step" class="step-style">步数：{{ step }}</div>
      </div>
      <div style="margin-top: 10px;" class="puzzle-all">
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
        <div class="start-button" @click="startGame" :style="{ display: !isStart ? 'flex' : 'none' }">
          <i class="fas fa-play"></i>
        </div>

      </div>

    </div>

    <!-- Add a floating button at the bottom right corner with a light blue background color and a share icon -->

    <div class="float-ellipsis-button" @click="toggleShareButtons">

      <i class="fas fa-ellipsis-h"></i>
    </div>

    <div class="share-buttons" :style="{ display: shareButtonsVisible ? 'flex' : 'none' }">
      <div class="float-share-button" @click="weixin">
        <i class="fas fa-share-alt"></i>
      </div>
      <div class="float-exchange-button" @click="refresh">
        <i class="fas fa-exchange-alt"></i>
      </div>

    </div>

    <Rank ref="rank" :listData="ranks"></Rank>

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

div .child+.child {
  margin-left: -1px;
  /* 使用margin-left为-1px覆盖默认的margin（0） */
}

div .puzzle+.puzzle {
  margin-top: -1px;
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

