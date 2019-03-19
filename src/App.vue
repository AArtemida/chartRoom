<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
[v-cloak]{
  display: none;
}
.clearfix:after{
  content:".";
  display:block;
  height:0;
  clear:both;
  visibility:hidden;
}
.clearfix{zoom:1}
.float_l{
  float: left;
}
.float_r{
  float: right;
}
li {
  list-style: none;
}
img{
  max-width: 100%;
  max-height: 100%;
}
input::-webkit-input-placeholder{
  color:#ccc;
}
ul{padding:0;margin:0;}
</style>
