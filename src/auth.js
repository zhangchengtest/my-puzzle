// auth.js
import axios from 'axios';

// 通过检查用户是否登录来判断是否可以访问路由
export function isAuthenticated() {
  const token = localStorage.getItem('puzzle-token');
  // 如果 myData 的值不存在，则将默认值 'hello world' 存入 localStorage 中
  if (token) {
     return true;
  }
  return false;
}

// 定义路由守卫中间件函数
export function requireAuth(to, from, next) {
  if (isAuthenticated()) {
    // 用户已登录，允许访问路由
    console.log('logined')
    next();
  } else {
    // 用户未登录，重定向到登录页面或其他处理
    // next('/login');
  
    if(to.query.code){
      const code = to.query.code;
      axios.get('https://clock.cuiyi.club/api/auth/getByCodeForPuzzle?code=' + code)
                .then(response => {
                    // 将token保存到localStorage中
                    console.log('to login')
                    console.log(code)
                    console.log(response.data)
                    localStorage.setItem('puzzle-token', response.data.data)
                    next();
                })
                .catch(error => {
                    console.log(error)
                    next('/');
                })
    }else{
      next() 
    }
  }
}
