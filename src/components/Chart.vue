<template>
  <div class="chart clearfix">
    <div class="left-box">
      <ul v-if="userList.length>0" v-cloak>
        <li v-for="(item,index) in userList" :class="index==selectUserIndex?'current':''" :key="'user'+index">
          <div class="user_photo">
            <img v-if="item.photo" :src="item.photo"/>
            <span v-else>N</span>
          </div>
          <div class="user_info">
            <p>{{item.name}}<span class="msg_time"></span></p>
            <div class="last_msg"></div>
          </div>
        </li>
      </ul>
    </div>
    <div class="right-box">
      <h3>
        <span>{{selectUser.name}}</span>
        <i class="logout" @click="logout">X</i>
      </h3>
      <div class="msg-box">
        <ul v-if="msgList.length > 0" class="clearfix">
          <li v-for="(msg,index) in msgList" :class="msg.user.id == myUser.id?'my-msg':''" :key="'msg'+index">
            <div class="user_photo">
              <img v-if="msg.user.photo" :src="msg.user.photo"/>
              <span v-else>N</span>
            </div>
            <div class="msg_content">
              <div class="msg-top" v-if="msg.user"><span>{{msg.user.name}}</span><span>{{msg.time}}</span></div>
              <div class="msg-text">{{msg.context}}</div>
            </div>
          </li>
        </ul>
      </div>
      <div class="input-box">
        <div class="input-top-box"></div>
        <textarea v-model.trim="msg" @keyup.enter="sendMsg"></textarea>
        <button id="send-btn" @click="sendMsg">发送</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'chart',
  data () {
    return {
      selectUserIndex: 0,
      userList: [{
        name: '聊天室',
        id: 'chartroom'
      }],
      msg: '',
      msgList: [],
      notice: ''
    }
  },
  computed: {
    selectUser () {
      let user = {}
      if (this.userList.length > 0 && this.userList[this.selectUserIndex]) {
        user = this.userList[this.selectUserIndex]
      }
      return user
    },
    myUser () {
      // console.log(this.$route.query)
      return Object.assign({}, this.$route.query)
    }
  },
  mounted () {
    this.$nextTick(t => {
      this.userList.push(this.myUser)
    })

    socket.on('notice2', info => {
      console.log('notice2')
      this.userList = info
    })
    // 当接收到有人连接进来
    socket.on('connected', info => {
      console.log(info)
      this.userList = info
    })
    // 当接收到有人断开后
    socket.on('disconnected', info => {
      // if(info == this.chat_title){
      // this.currentChat = 0;}
      console.log(info)
      this.userList = info.list
      this.notice = info.user + '离开了'
    })
    // 接收消息
    socket.on('message', msglist => {
      console.log(msglist)
      this.msgList = msglist;
    })
  },
  methods: {
    // 发送消息
    sendMsg () {
      if (this.msg === '') return
      // this.msgList.push({
        // user: this.myUser,
        // time: this.getNowTime(),
        // context: this.msg
      // })
      socket.emit('message', {
        user: this.myUser,
        time: this.getNowTime(),
        context: this.msg,
        type: 'chartroom'
      })
      this.msg = ''
    },
    // 退出
    logout () {
      this.$router.push({name: 'login'})
    },
    // 获取当前时间
    getNowTime () {
      let t = new Date()
      let time = t.getHours() + ':' + t.getMinutes()
      return time
    }
  }
}
</script>

<style scoped>
.chart{
  width: 900px;
  height: 640px;
  overflow: hidden;
  border-radius: 4px;
  background: #f5f5f5;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  -webkit-transform: translate(-50%,-50%);
  box-shadow: 0 0 10px 0 #999;
}
.left-box{
  width: 310px;
  height: 100%;
  float: left;
  background: #ebe9e8;
}
.left-box ul{
  padding:30px 10px;
}
.left-box li{
  width: 100%;
    height: 64px;
    padding: 12px;
    box-sizing: border-box;
    position: relative;
}
.left-box li.current{
  background: #c9c9c9;
}
.left-box li .user_photo{
  width: 40px;
    height: 40px;
}
.left-box li .user_info{
    height: 40px;
    font-size: 14px;
    float: left;
    color: #111;
    padding-left: 10px;
    box-sizing: border-box;
}
.last_msg{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  margin-top: 4px;
  color: #999;
}
.right-box{
  width: 590px;
  height: 100%;
  float: right;
}
.right-box>h3{
  width: 100%;
    height: 42px;
    border-bottom: 1px solid #e1e1e1;
    position: relative;
    margin: 0;
    padding-top: 20px;
}
.right-box>h3>span{
  float: left;
    margin-left: 20px;
}
.msg-box{
  padding: 0 30px;
  box-sizing: border-box;
  overflow: auto;
  width: 100%;
  height: 432px;
}
.msg-box li{
  float: left;
  width: 350px;
  margin-top: 12px;
}
li .user_photo{
  width: 36px;
    height: 36px;
    margin-top: 4px;
    float: left;
    background: #FFD09C;
  text-align:center;
  color:#fff;
}
li .user_photo>img{
  height:100%;
  width:100%；
}
li .user_photo>span{
  line-height:36px;
  font-weight:bold;
  font-size:20px;
}
.msg-box .msg_content{
  float: left;
    max-width: 304px;
    margin-left: 10px;
    word-break:break-all;
}
.msg-box .msg-top{
  font-size: 12px;
  color: #999;
  text-align: left;
  white-space: nowrap;
}
.msg-top>span:first-child{margin-right:10px;}
.msg-box .msg-text{
  margin-top: 4px;
  font-size: 14px;
  color: #111;
  background: #fff;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #e6e6e6;
  border-radius: 2px;
}
.msg-box li.my-msg,.msg-box .my-msg .user_photo,.msg-box .my-msg .msg_content{float:right;}
.msg-box .my-msg .msg_content{margin-left:0;margin-right:10px;}
.msg-box .my-msg .msg-top{text-align:right;}
.msg-box .my-msg .msg-text{background: #9eea6a;}
.input-box{
  width: 100%;
  height: 145px;
  border-top: 1px solid #e1e1e1;
  background: #f5f5f5;
  position: relative;
}
.input-top-box{
  width: 100%;
    height: 40px;
    padding: 14px 0 0 30px;
    box-sizing: border-box;
    position: relative;
}
.input-box textarea{
  width: 554px;
  height: 68px;
  margin-left: 30px;
  outline: none;
  resize: none;
  font-size: 14px;
  border: none;
  background: none;
  font-family: auto;
}
#send-btn{
  width: 68px;
  height: 25px;
  background: #f5f5f5;
  border: 1px solid #e1e1e1;
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 25px;
  position: absolute;
  right: 30px;
  bottom: 10px;
  border-radius: 2px;
  cursor: pointer;
  outline:0;
}
#send-btn:hover {
    background: #129611;
    color: #fff;
    border: 1px solid #129611;
}
.logout{
  float:right;
  font-size:13px;
  color:#999;
  margin-right:20px;
  cursor:pointer;
  font-weight:normal;
  font-style: inherit;
}

.logout:hover{
  color:#129611;
}
</style>
