<template>
    <div>
        <div class="header" :class="{ 'sticky': isSticky }">
            <div class="logo"><img src="../assets/logo.png" class="logo-img"/></div>
            <div class="user-info">
                <div class="username">{{ username }}</div>
                <div class="dropdown" v-show="showDropdown">
                    <ul>
                        <li v-if="isLoggedIn"><a href="#">注销</a></li>
                        <li v-else><a href="#">登录</a></li>
                    </ul>
                </div>
                <div class="arrow" @click="showDropdown = !showDropdown"></div>
            </div>
        </div>
    </div>
</template>
  
<script>
export default {
    name: 'MyComponent',
    data() {
        return {
            isSticky: false,
            showDropdown: false,
            username: '',
            isLoggedIn: false // 根据实际情况设置该值
        }
    },
    mounted() {
        // 获取 localStorage 中 myData 的值
        this.username = localStorage.getItem('username');
        // 如果 myData 的值不存在，则将默认值 'hello world' 存入 localStorage 中
        if (!this.username) {
            this.username = '游客' + this.getCurrentDate() + this.generateRandomCode();
            localStorage.setItem('username', this.username);
        }
       
        window.addEventListener('scroll', this.handleScroll)
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll)
    },
    methods: {
        handleScroll() {
            this.isSticky = window.pageYOffset >= 100 // 根据实际情况设置该值
        },
        show() {
            console.log('show');
        },
        generateRandomCode() {
            let code = '';
            for (let i = 0; i < 4; i++) {
                const randomCharAscii = Math.floor(Math.random() * 26) + 65; // 生成 A - Z 之间的随机数
                const randomChar = String.fromCharCode(randomCharAscii); // 将随机数转换为对应的 ASCII 字符
                code += randomChar; // 拼接随机字符到 code 中
            }
            return code;
        },

        getCurrentDate() {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const date = now.getDate();
            return `${year}${month}${date}`;
        }

    }
}
</script>
  
<style>
.header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease-out;
}

.sticky {
    position: fixed;
    z-index: 1;
}

.logo {
    font-size: 24px;
    font-weight: bold;
}

.logo-img{
   width: 60px;
   height: 60px;
   margin-top: 10px;
}

.user-info {
    display: flex;
    align-items: center;
}

.username {
    margin-right: 10px;
}

.dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: #fff;
    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    z-index: 2;
    min-width: 120px;
    text-align: left;
}

.dropdown ul {
    margin: 0;
    padding: 0;
    list-style: none;
}

.dropdown li {
    padding: 8px 16px;
    cursor: pointer;
}

.arrow {
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #555;
    margin-left: 10px;
    cursor: pointer;
}

.arrow.open {
    border-top: 0;
    border-bottom: 10px solid #555;
}
</style>
  