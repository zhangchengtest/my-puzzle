<template>
    <div>
        <div class="player-info">
            <div v-if="!gameStarted">等待其他玩家加入...</div>
            <div v-else>
                <div @click="togglePlayerSide">你是<span :class="playerColor"> {{ playerColorText }}</span>方</div>
                <div v-if="gameOver">{{ winner }}胜利！</div>
                <div v-else>下了{{ lastRow }}: {{ lastCol }}&nbsp<span :class="currentSide">{{ currentSideText }}</span>方下棋
                </div>
            </div>
        </div>
        <div class="chessboard">

            <div class="chess-row" v-for="(row, rowIndex) in chessboard" :key="rowIndex">
                <div class="chess-square" v-for="(square, squareIndex) in row" :key="squareIndex"
                    :class="{ selected: isSelected(rowIndex, squareIndex) }" @click="selectPiece(rowIndex, squareIndex)">
                    <div v-if="square !== null" :class="['chess-piece', square.color]">{{ square.name }}</div>
                </div>
            </div>
        </div>


        <div class="float-ellipsis-button" @click="toggleShareButtons">

            <i class="fas fa-ellipsis-h"></i>
        </div>

        <div class="share-buttons" :style="{ display: shareButtonsVisible ? 'flex' : 'none' }">
            <div class="float-share-button" @click="weixin">
                <i class="fas fa-share-alt"></i>
            </div>
            <div class="float-exchange-button" @click="restart">
                <i class="fas fa-exchange-alt"></i>
            </div>

        </div>
    </div>
</template>
  
<script>

const parseNestedArrays = (key, value) => {
    if (typeof value === "string") {
        try {
            value = JSON.parse(value, parseNestedArrays);
        } catch (e) { }
    }
    if (Array.isArray(value)) {
        value = value.map(v => {
            try {
                return JSON.parse(v, parseNestedArrays);
            } catch (e) {
                return v;
            }
        });
    }
    return value;
};

export default {
    data() {
        return {
            chessboard: [
                [{ name: "車", color: "red", type: "rook" }, { name: "馬", color: "red", type: "knight" }, { name: "象", color: "red", type: "bishop" }, { name: "士", color: "red", type: "advisor" }, { name: "帥", color: "red", type: "king" }, { name: "士", color: "red", type: "advisor" }, { name: "象", color: "red", type: "bishop" }, { name: "馬", color: "red", type: "knight" }, { name: "車", color: "red", type: "rook" }],
                [null, null, null, null, null, null, null, null, null],
                [null, { name: "炮", color: "red", type: "cannon" }, null, null, null, null, null, { name: "炮", color: "red", type: "cannon" }, null],
                [{ name: "兵", color: "red", type: "pawn" }, null, { name: "兵", color: "red", type: "pawn" }, null, { name: "兵", color: "red", type: "pawn" }, null, { name: "兵", color: "red", type: "pawn" }, null, { name: "兵", color: "red", type: "pawn" }],
                [null, null, null, null, null, null, null, null, null],
                [null, null, null, null, null, null, null, null, null],
                [{ name: "卒", color: "black", type: "pawn" }, null, { name: "卒", color: "black", type: "pawn" }, null, { name: "卒", color: "black", type: "pawn" }, null, { name: "卒", color: "black", type: "pawn" }, null, { name: "卒", color: "black", type: "pawn" }],
                [null, { name: "炮", color: "black", type: "cannon" }, null, null, null, null, null, { name: "炮", color: "black", type: "cannon" }, null],
                [null, null, null, null, null, null, null, null, null],
                [{ name: "車", color: "black", type: "rook" }, { name: "馬", color: "black", type: "knight" }, { name: "象", color: "black", type: "bishop" }, { name: "士", color: "black", type: "advisor" }, { name: "將", color: "black", type: "king" }, { name: "士", color: "black", type: "advisor" }, { name: "象", color: "black", type: "bishop" }, { name: "馬", color: "black", type: "knight" }, { name: "車", color: "black", type: "rook" }]
            ],
            chessboardPreview: null,
            pieces: [],
            selectedPiece: null,
            selectedSquare: null,
            socket: null,
            gameStarted: true,
            playerColor: 'red', //playerColor代表你在棋盘下边 你的king是【9，4】
            gameOver: false,
            currentSide: 'red',
            shareButtonsVisible: false,
            roomId: '1001',
            lastRow: null,
            lastCol: null,
        }
    },
    computed: {
        playerColorText() {
            return this.playerColor === 'red' ? '红' : '黑';
        },
        currentSideText() {
            return this.currentSide === 'red' ? '红' : '黑';
        }
    },
    mounted() {
        this.roomId = this.$route.query.roomId;
        this.playerColor = this.$route.query.side;
        if (!this.playerColor) {
            this.playerColor = 'black'
        }
        const socket = new WebSocket('wss://chengapi.yufu.pub/chess');

        socket.onopen = () => {

            // 发送加入房间请求
            socket.send(JSON.stringify({
                type: 'joinRoom',
                roomId: this.roomId
            }));
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data, parseNestedArrays);

            switch (message.type) {
                case 'chessboardState':
                    // 更新棋盘
                    if (this.playerColor == 'red') {
                        this.chessboard = message.chessboard.slice().reverse();
                        if (message.lastRow || message.lastRow == 0) {
                            var final_end_row = 9 - message.lastRow
                            this.selectedPiece = { "row": final_end_row, "col": message.lastCol }
                        }

                    } else {
                        this.chessboard = message.chessboard;
                        if (message.lastRow || message.lastRow == 0) {
                            var final_end_row = message.lastRow
                            this.selectedPiece = { "row": final_end_row, "col": message.lastCol }
                        }

                    }
                    if (message.lastRow || message.lastRow == 0) {
                        this.lastCol = message.lastCol
                        this.lastRow = message.lastRow
                    }



                    this.currentSide = message.side
                    break;
                // 其他类型的消息处理
                // ...
            }
        };

        this.socket = socket;
    },
    methods: {
        togglePlayerSide() {
            this.playerColor = this.playerColor === 'red' ? 'black' : 'red';
            // 发送加入房间请求
            this.socket.send(JSON.stringify({
                type: 'joinRoom',
                roomId: this.roomId
            }));
        },
        selectPiece(row, col) {
            if (this.selectedPiece == null && this.chessboard[row][col] !== null) {

                if (!this.chessboard[row][col]) {
                    return;
                }

                if (!this.chessboard[row][col].color) {
                    return;
                }

                if (this.playerColor != this.currentSide) {
                    return;
                }

                this.selectedPiece = { row, col }
            } else if (this.selectedPiece !== null && this.chessboard[this.selectedPiece.row][this.selectedPiece.col].color != this.currentSide) {
                this.selectedPiece = { row, col }
            } else if (this.selectedPiece !== null && this.canMovePiece(this.selectedPiece, row, col)) {
                console.log('d')
                this.movePiece(this.selectedPiece, row, col)
                this.selectedPiece = null
            } else {
                this.selectedPiece = null
            }
        },
        canMovePiece(start, row, col) {
            const piece = this.chessboard[start.row][start.col]
            if (piece) {
                const canMove = this[`canMove${piece.type}`](start, row, col)
                //TODO 在这里加上下完之后是否处于被将军的状态 如果是的话 canMove 就为false 
                if (canMove) {

                    this.preMovePiece(start, row, col)
                   
                    const faceFlag = this.isFaceToFace()
                    console.log('a')
                    if (faceFlag) {
                        console.log('b')
                        return false;
                    }
                    console.log('c')
                    // const isCheck = this.isCheck()
                    // if (isCheck) {
                    //     return false;
                    // } 
                    return true;
                } else {
                    return false;
                }
            }

            return false
        },
        addRowColInfo(arr) {
            return arr.map((row, rowIndex) => {
                return row.map((piece, colIndex) => {
                    if (piece !== null) {
                        piece.row = rowIndex;
                        piece.col = colIndex;
                    }
                    return piece;
                });
            });
        }
        ,
        isFaceToFace() {
            this.chessboardPreview = this.addRowColInfo( this.chessboardPreview)
            this.pieces = this.chessboardPreview.flat().filter(piece => piece !== null);
            // 定义变量存储将和帅的位置坐标
            let jiangPos = null;
            let shuaiPos = null;
            console.log("this.pieces ", this.pieces)
            for (let i = 0; i < this.pieces.length; i++) {
                console.log("this.pieces[i] ", this.pieces[i])
                if (this.pieces[i].type === 'king' && this.pieces[i].color === 'red') {
                    jiangPos = this.pieces[i];
                } else if (this.pieces[i].type === 'king' && this.pieces[i].color === 'black') {
                    shuaiPos = this.pieces[i];
                }
            }
            console.log('将的位置：', jiangPos);
            console.log('帅的位置：', shuaiPos);
            // 判断将帅之间是否存在棋子
            let minRow = Math.min(jiangPos.row, shuaiPos.row) + 1;
            let maxRow = Math.max(jiangPos.row, shuaiPos.row) - 1;
            if(jiangPos.col != shuaiPos.col){
                console.log('不在一列上不考虑面对面 ');
                return false;
            }
            let col = jiangPos.col;
            console.log('minRow ', minRow);
            console.log('maxRow ', maxRow);
       
            for (let row = minRow; row <= maxRow; row++) {
                if (this.chessboardPreview[row][col] !== null) {
                    console.log('有障碍 ', this.chessboardPreview[row][col]);
                    return false;
                }
            }
            alert('将帅不能面对');
            return true;
        },
        isCheck() {
            // 遍历当前玩家的所有棋子

            for (let i = 0; i < this.pieces.length; i++) {
                const piece = this.pieces[i]
                console.log('enter b')
                if (piece.side === this.currentSide) {
                    // 找到每个棋子可以攻击的位置
                    const moves = this[`get${piece.type}Moves`](piece.row, piece.col)
                    console.log('moves ', moves)
                    for (let j = 0; j < moves.length; j++) {
                        const move = moves[j]
                        // 遍历对方玩家的所有棋子
                        for (let k = 0; k < this.pieces.length; k++) {
                            const enemyPiece = this.pieces[k]
                            if (enemyPiece.side !== this.currentSide) {
                                // 找到每个对方棋子可以到达的位置
                                const enemyMoves = this[`get${enemyPiece.type}Moves`](enemyPiece.row, enemyPiece.col)
                                if (enemyMoves.some(enemyMove => enemyMove.row === move.row && enemyMove.col === move.col && enemyPiece.type === 'King')) {
                                    // 如果对方玩家的将军在当前玩家可以攻击的位置中，则当前玩家处于将军状态
                                    return true
                                }
                            }
                        }
                    }
                }
            }
            return false
        },
        getKingMoves(row, col) {
            // TODO 实现根据将的移动规则 获取可移动的位置piece
        },
        canMovepawn(start, row, col) {
            const piece = this.chessboard[start.row][start.col]
            const deltaRow = row - start.row
            const deltaCol = col - start.col
            if (this.playerColor == 'red') {
                if (piece.color === 'red') { // 黑方卒（兵）
                    console.log('a')
                    if (deltaRow > 0) { // 只能向前走
                        console.log('b')
                        return false
                    } else if (start.row <= 4 && deltaCol !== 0) { // 已经过河，可以横着走
                        console.log('c')
                        return true
                    } else if (deltaRow === -1 && deltaCol === 0) { // 向前走一步
                        if (row < 0 || row > 9 || col < 0 || col > 8) { // 目标位置越界
                            return false
                        } else if (!this.chessboard[row][col] || this.chessboard[row][col].color !== piece.color) { // 目标位置为空或有对方棋子
                            return true
                        }
                    }
                } else { // 红方兵
                    if (deltaRow < 0) { // 只能向前走
                        return false
                    } else if (start.row >= 5 && deltaCol !== 0) { // 已经过河，可以横着走
                        return true
                    } else if (deltaRow === 1 && deltaCol === 0) { // 向前走一步
                        if (row < 0 || row > 9 || col < 0 || col > 8) { // 目标位置越界
                            return false
                        } else if (!this.chessboard[row][col] || this.chessboard[row][col].color !== piece.color) { // 目标位置为空或有对方棋子
                            return true
                        }
                    }
                }
            } else {
                if (piece.color === 'black') { // 黑方卒（兵）
                    console.log('a')
                    if (deltaRow > 0) { // 只能向前走
                        console.log('b')
                        return false
                    } else if (start.row <= 4 && deltaCol !== 0) { // 已经过河，可以横着走
                        console.log('c')
                        return true
                    } else if (deltaRow === -1 && deltaCol === 0) { // 向前走一步
                        if (row < 0 || row > 9 || col < 0 || col > 8) { // 目标位置越界
                            return false
                        } else if (!this.chessboard[row][col] || this.chessboard[row][col].color !== piece.color) { // 目标位置为空或有对方棋子
                            return true
                        }
                    }
                } else { // 红方兵
                    if (deltaRow < 0) { // 只能向前走
                        return false
                    } else if (start.row >= 5 && deltaCol !== 0) { // 已经过河，可以横着走
                        return true
                    } else if (deltaRow === 1 && deltaCol === 0) { // 向前走一步
                        if (row < 0 || row > 9 || col < 0 || col > 8) { // 目标位置越界
                            return false
                        } else if (!this.chessboard[row][col] || this.chessboard[row][col].color !== piece.color) { // 目标位置为空或有对方棋子
                            return true
                        }
                    }
                }
            }

            return false
        }

        ,
        // 判断车的移动规则
        canMoverook(start, row, col) {
            const piece = this.chessboard[start.row][start.col]
            // 检查目标位置是否在同一行或同一列
            if (start.row === row || start.col === col) {
                // 检查起始位置和目标位置之间是否有其他棋子阻挡
                const delta = Math.abs(row - start.row) + Math.abs(col - start.col)
                const stepRow = (row - start.row) / delta
                const stepCol = (col - start.col) / delta
                for (let i = 1; i < delta; i++) {
                    const checkRow = start.row + i * stepRow
                    const checkCol = start.col + i * stepCol
                    if (this.chessboard[checkRow][checkCol]) {
                        return false
                    }
                }
                // 检查目标位置是否有己方棋子，或者是否为空位
                return !this.chessboard[row][col] || this.chessboard[row][col].color !== piece.color
            }
            return false
        },

        // 判断马的移动规则
        canMoveknight(start, row, col) {
            const piece = this.chessboard[start.row][start.col]
            // 检查目标位置是否为“日”字形
            const deltaRow = Math.abs(row - start.row)
            const deltaCol = Math.abs(col - start.col)
            if ((deltaRow === 2 && deltaCol === 1) || (deltaRow === 1 && deltaCol === 2)) {
                // 检查目标位置是否有己方棋子，或者是否为空位
                if (!this.chessboard[row][col] || this.chessboard[row][col].color !== piece.color) {

                    // 检查是否被卡脚
                    if (deltaRow === 2 && Number.isInteger((start.row + row) / 2) && this.chessboard[(start.row + row) / 2][start.col]) {
                        return false // 竖着走时，检查左右是否有棋子挡路
                    } else if (deltaCol === 2 && Number.isInteger((start.col + col) / 2) && this.chessboard[start.row][(start.col + col) / 2]) {
                        return false // 横着走时，检查上下是否有棋子挡路
                    }
                    return true
                }
            }
            return false
        }
        ,

        // 判断象/相的移动规则
        canMovebishop(start, row, col) {
            const piece = this.chessboard[start.row][start.col]
            // 检查象（相）是否斜着走两步
            const deltaRow = Math.abs(row - start.row)
            const deltaCol = Math.abs(col - start.col)
            if (deltaRow === 2 && deltaCol === 2) {
                // 检查象（相）行走的路线中是否有棋子挡路
                const centerRow = (start.row + row) / 2
                const centerCol = (start.col + col) / 2
                if (!this.chessboard[centerRow][centerCol]) { // 中心位置为空
                    if (!this.isCrossRiver(start.row, start.col) || this.isSameColor(centerRow, centerCol, piece.color)) { // 起点在河的同侧或中心位置有己方棋子
                        if (!this.chessboard[row][col] || this.chessboard[row][col].color !== piece.color) { // 目标位置为空或有对方棋子
                            return true
                        }
                    }
                }
            }
            return false
        },
        isCrossRiver(row, col) {
            if (this.playerColor == 'red') {
                if (this.chessboard[row][col].color === 'black') { // 红方
                    return row >= 5
                } else { // 黑方
                    return row <= 4
                }
            } else {
                if (this.chessboard[row][col].color === 'red') { // 红方
                    return row >= 5
                } else { // 黑方
                    return row <= 4
                }
            }

        }
        ,
        isSameColor(row, col, color) {
            if (!this.chessboard[row][col]) { // 如果该位置为空，则认为不是同一颜色的棋子
                return false
            } else {
                return this.chessboard[row][col].color === color
            }
        }
        ,

        // 判断士/仕的移动规则
        canMoveadvisor(start, row, col) {
            const piece = this.chessboard[start.row][start.col]
            // 检查目标位置是否在九宫格内，并且是否符合规定的步长
            const deltaRow = Math.abs(row - start.row)
            const deltaCol = Math.abs(col - start.col)
            if (deltaRow === 1 && deltaCol === 1 && row >= 7 && row <= 9 && col >= 3 && col <= 5) {
                // 检查目标位置是否有己方棋子，或者是否为空位
                return !this.chessboard[row][col] || this.chessboard[row][col].color !== piece.color
            }
            return false
        },

        // 判断将/帅的移动规则
        canMoveking(start, row, col) {
            const piece = this.chessboard[start.row][start.col]
            // 检查目标位置是否在九宫格内，并且是否符合规定的步长
            const deltaRow = Math.abs(row - start.row)
            const deltaCol = Math.abs(col - start.col)
            if ((deltaRow === 1 && deltaCol === 0) || (deltaRow === 0 && deltaCol === 1)) {
                // 检查目标位置是否在己方的九宫格内
                if (row >= 7 && row <= 9 && col >= 3 && col <= 5) {
                    // 检查目标位置是否有己方棋子，或者是否为空位
                    return !this.chessboard[row][col] || this.chessboard[row][col].color !== piece.color
                }

                if (row >= 0 && row <= 2 && col >= 3 && col <= 5) {
                    // 检查目标位置是否有己方棋子，或者是否为空位
                    return !this.chessboard[row][col] || this.chessboard[row][col].color !== piece.color
                }
            }
            return false
        },

        // 判断炮的移动规则
        canMovecannon(start, row, col) {
            const piece = this.chessboard[start.row][start.col]
            const target = this.chessboard[row][col]

            if (target && target.color === piece.color) {
                return false // 目标位置已有己方棋子，不能移动
            }
            // 判断炮是否在同一行或同一列
            if (start.row !== row && start.col !== col) {
                return false // 炮只能在同一行或同一列移动
            }
            // 计算炮架数量
            let barrierCount = 0
            if (start.row === row) {
                // 同一行
                const startIndex = Math.min(start.col, col) + 1
                const endIndex = Math.max(start.col, col)
                for (let i = startIndex; i < endIndex; i++) {
                    if (this.chessboard[row][i]) {
                        barrierCount++
                    }
                }
            } else {
                // 同一列
                const startIndex = Math.min(start.row, row) + 1
                const endIndex = Math.max(start.row, row)
                for (let i = startIndex; i < endIndex; i++) {
                    if (this.chessboard[i][col]) {
                        barrierCount++
                    }
                }
            }
            // 判断炮的移动方式
            if (target) {
                // 吃子
                if (barrierCount === 1) {
                    return true
                }
            } else {
                // 不吃子
                if (barrierCount === 0) {
                    return true
                }
            }
            return false // 移动不合法
        },
        preMovePiece(start, row, col) {
            console.log('start ', start)
            console.log('row ', row)
            console.log('col ', col)
            this.chessboardPreview = this.chessboard.map(row => [...row]);

            const piece = this.chessboardPreview[start.row][start.col]
            this.chessboardPreview[start.row][start.col] = null
            this.chessboardPreview[row][col] = piece
        },
        movePiece(start, row, col) {
            console.log('start ', start)
            console.log('row ', row)
            console.log('col ', col)
            const piece = this.chessboard[start.row][start.col]
            this.chessboard[start.row][start.col] = null
            this.chessboard[row][col] = piece
            var end = { row, col }
            var final_start = start
            if (this.playerColor == 'red') {
                var final_start_row = 9 - start.row
                var final_end_row = 9 - row
                var final_sart_col = start.col
                final_start = { "row": final_start_row, "col": final_sart_col }
                end = { "row": final_end_row, col }

            }
            const message = {
                type: 'movePiece',
                start: final_start,
                end: end
            };
            this.socket.send(JSON.stringify(message));
        },
        toggleShareButtons() {
            this.shareButtonsVisible = !this.shareButtonsVisible;
        },
        isSelected(row, col) {
            return this.selectedPiece !== null && this.selectedPiece.row === row && this.selectedPiece.col === col
        },
        weixin() {

        },
        restart() {
            const message = {
                type: 'restart'
            };
            this.socket.send(JSON.stringify(message));
        }

    }
}
</script>
  
<style>
.chessboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-image: url("../assets/chess.jpg");
    background-size: 330px 390px;
    background-repeat: no-repeat;
    background-position: center center;
}

.player-info {
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    width: 100%;
}

.player-info>div {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
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
    display: flex;
    justify-content: center;
    align-items: center;
    /* font-size: 40px; */
    color: #fff;
    width: 40px;
    height: 40px;
    border: 0px solid #333;
    border-radius: 50%;
    background-color: antiquewhite;
}

.red {
    color: #F00;
}

.black {
    color: #000;
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
</style>
  