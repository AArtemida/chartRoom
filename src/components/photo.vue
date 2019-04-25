<template>
  <div class="user_photo" :style="{background:user.color?user.color:'#FFD09C'}">
    <img v-if="user.photo" :src="user.photo"/>
    <span v-else>{{getUserNameOne(user)}}</span>
  </div>
</template>
	
<script>
export default {
  props:['user'],
  data(){
    return {}
  },
  methods:{
    getUserNameOne (user) {
      return user.name ? user.name.substr(0, 1) : 'N'
    },
  }
}
</script>

<style scoped>
.user_photo{
  width: 36px;
  height: 36px;
  margin-top: 4px;
  float: left;
  background: #FFD09C;
  text-align:center;
  color:#fff;
}
.user_photo>img{
  height:100%;
  width:100%；
}
.user_photo>span{
  line-height:36px;
  font-weight:bold;
  font-size:20px;
}
</style>