<template>
    <div id="myButton" class="floating-icon" :style="{ top: position.y + 'px', left: position.x + 'px' }" ref="box">
        <!-- <div class="icon"></div> -->


<i class="fas fa-ellipsis-h"></i>
    </div>
</template>
  
<script>
import {
  getModels,
} from '../common/helper'

let isMobile = getModels()

export default {
    data() {
        return {
            position: { x: 20, y: 20 },
            dragging: false,
            isMoving: false,
            dropTimer: null,
        };
    },
    mounted() {

        
        if(isMobile){
            this.$refs.box.addEventListener('click', this.showButtons);
             this.$refs.box.addEventListener('touchstart', this.startDrag);
             this.$refs.box.addEventListener('touchmove', this.drag);
             this.$refs.box.addEventListener('touchend', this.stopDrag);
        }else{
             this.$refs.box.addEventListener('click', this.showButtons);
             this.$refs.box.addEventListener('mousedown', this.startDrag);
             this.$refs.box.addEventListener('mousemove', this.drag);
             this.$refs.box.addEventListener('mouseup', this.stopDrag);
        }
     
      

        let w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
        let clientW = isMobile ? w : document.body.clientWidth
        let clientH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
        console.log(clientW)
        console.log(clientH)
        this.position.x = clientW-50-20;
        this.position.y = clientH-50-20;
    },

    methods: {
        startDrag(event) {
             // 阻止事件冒泡，避免干扰click事件
            console.log('startDrag')
            this.dragging = true;
            this.showButtons = true;
            let data = this.getOffset(event);
            this.dragStartPosition = {
                x: data.x,
                y: data.y
            };
        },
        showButtons(event) {
            if(this.isMoving){
                console.log('hhhh dragging ')
                return;
            }
            console.log('hhhh')
            this.$emit('my-event');
            
        },
        stopDrag() {
            console.log('stopDrag')
            this.dragging = false;
            this.showButtons = false;
          
        },
       getOffset(e) {
            return isMobile ? {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY,
            } : {
            x: e.clientX,
            y: e.clientY,
            }
        },
        drag(event) {
            event.preventDefault();
            if (this.dragging) {
     
                let data = this.getOffset(event);

                const offsetX = data.x - this.dragStartPosition.x;
                const offsetY = data.y - this.dragStartPosition.y;
                this.position.x += offsetX;
                this.position.y += offsetY;
                  // 判断是否移动了
                this.isMoving = !(offsetX ===0 && offsetY === 0)

                clearTimeout(this.dropTimer);
                this.dropTimer = setTimeout(()=>{
                    let w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
                    let clientW = isMobile ? w : document.body.clientWidth
                    this.position.x = clientW-50-20;
                    this.isMoving = false;
                    clearTimeout(this.dropTimer);
                    this.dropTimer = null;
                }, 300);

                this.dragStartPosition = {
                    x: data.x,
                    y: data.y
                };
            }
        },
    },
};
</script>
  
<style scoped>

.floating-icon {
    cursor: move;
    position: fixed;
    background-color: lightblue;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    -webkit-tap-highlight-color: transparent;
    /* added to remove the highlight on mobile devices */
   
  }
</style>
  