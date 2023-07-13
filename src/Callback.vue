<template>
    <div></div>
    <loading :visible="loadingVisible"/>
</template>
<script>
import axios from 'axios';
import Loading from '@/components/Loading.vue'
export default {
    components: {
        Loading
    },
    data() {
        return {
            loadingVisible: true,
            part: '',
        }
    },
    mounted() {
        this.part = this.$route.query.part;
        const code = this.$route.query.code; // 获取浏览器传递的 code 参数
        this.toRedirect(code)
    },
    methods: {
        toRedirect(code) {
            this.loadingVisible = true
            axios.get('https://api.punengshuo.com/api/auth/getByCodeForPuzzle?code=' + code)
                .then(response => {
                    // 将token保存到localStorage中
                    console.log(response.data)
                    localStorage.setItem('puzzle-token', response.data.data)
                    this.$router.push('/'+this.part)
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }
};
</script>
  