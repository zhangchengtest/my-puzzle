<template>
    <div class="chessboard">
      <div class="chess-row" v-for="(row, rowIndex) in chessboard" :key="rowIndex">
        <div class="chess-square" v-for="(square, squareIndex) in row" :key="squareIndex" :class="{ selected: isSelected(rowIndex, squareIndex) }" @click="selectPiece(rowIndex, squareIndex)">
          <div v-if="square !== null" :class="['chess-piece', square.color]">{{ square.name }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        chessboard: [
          [{ name: "車", color: "red" }, { name: "馬", color: "red" }, { name: "象", color: "red" }, { name: "士", color: "red" }, { name: "帥", color: "red" }, { name: "士", color: "red" }, { name: "象", color: "red" }, { name: "馬", color: "red" }, { name: "車", color: "red" }],
          [null, null, null, null, null, null, null, null, null],
          [null, { name: "炮", color: "red" }, null, null, null, null, null, { name: "炮", color: "red" }, null],
          [{ name: "兵", color: "red" }, null, { name: "兵", color: "red" }, null, { name: "兵", color: "red" }, null, { name: "兵", color: "red" }, null, { name: "兵", color: "red" }],
          [null, null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null, null],
          [{ name: "卒", color: "black" }, null, { name: "卒", color: "black" }, null, { name: "卒", color: "black" }, null, { name: "卒", color: "black" }, null, { name: "卒", color: "black" }],
          [null, { name: "炮", color: "black" }, null, null, null, null, null, { name: "炮", color: "black" }, null],
          [null, null, null, null, null, null, null, null, null],
          [{ name: "車", color: "black" }, { name: "馬", color: "black" }, { name: "象", color: "black" }, { name: "士", color: "black" }, { name: "將", color: "black" }, { name: "士", color: "black" }, { name: "象", color: "black" }, { name: "馬", color: "black" }, { name: "車", color: "black" }]
        ],
        selectedPiece: null,
        selectedSquare: null
      }
    },
    methods: {
      selectPiece(row, col) {
        if (this.chessboard[row][col] !== null) {
          this.selectedPiece = { row, col }
        } else if (this.selectedPiece !== null && this.canMovePiece(this.selectedPiece, row, col)) {
          this.movePiece(this.selectedPiece, row, col)
          this.selectedPiece = null
        } else {
          this.selectedPiece = null
        }
      },
      canMovePiece(start, end) {
        // Add logic to check if move is valid
        return true
      },
      movePiece(start, row, col) {
        const piece = this.chessboard[start.row][start.col]
        this.chessboard[start.row][start.col] = null
        this.chessboard[row][col] = piece
      },
      isSelected(row, col) {
        return this.selectedPiece !== null && this.selectedPiece.row === row && this.selectedPiece.col === col
      }
    }
  }
  </script>
  
  <style>
  .chessboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-image:url("../assets/chess.jpg");
    background-size: 360px 390px;
    background-repeat: no-repeat;
  }
  
  .chess-row {
    display: flex;
    flex-direction: row;
  }
  
  .chess-square {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* background-color: #F0D9B5; */
     /* border: 1px solid #333; */
  }
  
  .chess-square:hover {
    cursor: pointer;
    background-color: #E8C095;
  }
  
  .selected {
    background-color: #F08080;
  }
  
  .chess-piece {
    font-size: 30px;
  }
  
  .red {
    color: #F00;
  }
  
  .black {
    color: #000;
  }
  </style>
  