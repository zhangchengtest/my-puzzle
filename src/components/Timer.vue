<template>
    <div>
      <div>{{ time }}</div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        time: '00:00',
        timer: null,
        seconds: 0,
        minutes: 0,
      };
    },
    methods: {
      start() {
        this.timer = setInterval(() => {
          this.seconds++;
          if (this.seconds === 60) {
            this.seconds = 0;
            this.minutes++;
          }
          this.time = `${this.minutes < 10 ? '0' + this.minutes : this.minutes}:${
            this.seconds < 10 ? '0' + this.seconds : this.seconds
          }`;
        }, 1000);
      },
      stop() {
        clearInterval(this.timer);
      },
      reset() {
        clearInterval(this.timer);
        this.seconds = 0;
        this.minutes = 0;
        this.time = '00:00';
      },
      getTime() {
        return this.seconds + this.minutes * 60;
      },
    },
  };
  </script>
  