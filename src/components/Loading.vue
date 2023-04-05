<template>
    <div class="loading" v-show="visible">
      <div class="spinner">
        <div class="dot1"></div>
        <div class="dot2"></div>
      </div>
      <div class="text">{{text}}</div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Loading',
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      text: {
        type: String,
        default: ''
      }
    }
  }
  </script>
  
  <style>
  .loading {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .spinner {
    margin-right: 10px;
    width: 50px;
    height: 25px;
    text-align: center;
    font-size: 10px;
  }
  
  .spinner > div {
    background-color: #fff;
    height: 100%;
    width: 6px;
    display: inline-block;
    animation: stretchdelay 1.2s infinite;
  }
  
  .spinner .dot1 {
    animation-delay: -1.1s;
  }
  
  .spinner .dot2 {
    animation-delay: -1.0s;
  }
  
  .spinner .dot3 {
    animation-delay: -0.9s;
  }
  
  @keyframes stretchdelay {
    0%, 40%, 100% {
      transform: scaleY(0.4);
    }
    20% {
      transform: scaleY(1.0);
    }
  }
  </style>
  