<template>
  <div class="login">
    <h3>Welcome to Chart</h3>
    <div class="photo">
      <img v-if="photo" :src="photo"/>
      <span v-else>N</span>
    </div>
    <div class="form">
      <input class="btn" type="text" name="username" v-model.trim="username" placeholder="用户名" />
      <button class="btn" @click="enterChart">登录</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      photo: null,
      username: ''
    }
  },
  methods: {
    enterChart () {
      if (this.username === '') return
      // this.$router.push({ name: 'chart', params: { user: this.username }})
      let id = this.createRandomId()
      socket.emit('login', {name: this.username, id: id})
      setTimeout(() => {
        this.$router.push({path: '/chart', query: {name: this.username, id: id}})
      })
    },
    // 生成id
    createRandomId () {
      return (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5)
    }
  }
}
</script>

<style scoped>
.login{
  width: 350px;
  height: 500px;
  background: #f5f5f5;
  border-radius: 4px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  -webkit-transform: translate(-50%,-50%);
  overflow: hidden;
  box-shadow: 0 0 10px 0 #999;
  padding:10px 20px;
}
.photo{
  width: 114px;
  height: 114px;
  margin: 30px auto;
  background: #FFD09C;
  text-align:center;
  color:#fff;
  border-radius:3px;
}
.photo>img{
  height:100%;
  width:100%；
}
.photo>span{
  line-height:110px;
  font-weight:bold;
  font-size:30px;
}
.form{
  width: 262px;
  height: 124px;
  margin: 0 auto;
  margin-top: 50px;
}
.form .btn{
  width: 100%;
  height: 50px;
  text-align: center;
  border-radius: 3px;
  font-size: 16px;
}
.form>input{
  outline: none;
  border: 1px solid #e1e1e1;
  color: #878787;
  box-sizing: border-box;
}
.form>button{
  margin-top: 24px;
  background: #1aad19;
  line-height: 50px;
  color: #fff;
  cursor: pointer;
  border:0;
}
</style>
