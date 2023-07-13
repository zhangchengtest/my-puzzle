<template>
    <div>
        <div class="header" :class="{ 'sticky': isSticky }">
            <div >积分：<span class="score">{{score}}</span></div>
            <div class="user-info">
                <div class="username">{{ username }}</div>
                <div class="dropdown" v-show="showDropdown">
                    <ul>
                        <li v-if="isLoggedIn"><a href="javascript:void(0)" @click="logout">注销</a></li>
                        <li v-else><a href="javascript:void(0)" @click="jump">登录</a></li>
                    </ul>
                </div>
                <div class="arrow" @click="showDropdown = !showDropdown"></div>
            </div>
        </div>
    </div>
</template>
  
<script>
import axios from 'axios';
const baseUrl = import.meta.env.VITE_APP_API_URL
export default {
    name: 'Header',
    data() {
        return {
            isSticky: false,
            showDropdown: false,
            username: '',
            userId: '',
            score:'0',
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

        const token = localStorage.getItem('puzzle-token');
        // 如果 myData 的值不存在，则将默认值 'hello world' 存入 localStorage 中
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            axios.get('https://api.punengshuo.com/api/auth/info')
                .then(response => {
                    this.isLoggedIn = true
                    this.username = response.data.data.userName
                    this.userId = response.data.data.userId
                    localStorage.setItem('username', response.data.data.userName);
                    localStorage.setItem('userId', response.data.data.userId);
                })
                .catch(error => {
                    console.log(error)
                })
          
        }

        axios.get('https://clock.cuiyi.club/openapi/scores/getByUserId')
            .then(response => {
                this.score = response.data.data.score
            })
            .catch(error => {
                console.log(error)
            })

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
        jump() {
            console.log('ssss')
            window.location = 'https://sso.punengshuo.com?redirectUrl=' + baseUrl +'/callback'
        },
        logout() {
            localStorage.clear();
            location.reload();
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

.logo-img {
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
.score {
    color: lightblue;
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
  