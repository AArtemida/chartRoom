<template>
  <div class="chart clearfix">
    <div class="left-box clearfix">
      <div class="userinfo">
        <user-photo :user="myUser"></user-photo>
        <p class="username">{{myUser.name}}</p>
      </div>
      <div class="float_l" style="width: calc(100% - 60px);">
        <div class="search-box">
          <input type="text" name="" v-model="searchWord"/>
          <i class="iconfont icon-sousuo"></i>
        </div>
        <!--用户列表-->
        <div class="user-list">
          <ul v-if="userList.length>0" v-cloak>
            <li v-for="(item,index) in userList" :class="index==selectUserIndex?'current':''"
              v-show="item.name.indexOf(searchWord)>-1"
              :key="'user'+index" @click="changeChart(index,item)">
              <user-photo :user="item"></user-photo>
              <div class="red_dot" v-show="currentMsg.indexOf(item.id) > -1"></div>
              <div class="user_info">
                <p>{{item.name}}<span class="msg_time" v-if="lastMsgList[item.id]">{{lastMsgList[item.id].time}}</span></p>
                <div class="last_msg" v-if="lastMsgList[item.id]">{{lastMsgList[item.id].text}}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="right-box">
      <h3>
        <span>{{selectUser.name}}<i class="chartNum" v-if="selectUser.id=='chartroom'">({{userList.length - 1}}人)</i></span>
        <i class="logout iconfont icon-chahao" @click="logout"></i>
        <p class="notices" v-show="notice">{{notice}}</p>
      </h3>
      <!--消息-->
      <div class="msg-box">
        <ul v-if="msgList.length > 0" class="clearfix">
          <li v-for="(msg,index) in msgList" :class="msg.user.id == myUser.id?'my-msg':''" :key="'msg'+index">
            <user-photo :user="msg.user"></user-photo>
            <div class="msg_content">
              <div class="msg-top" v-if="msg.user"><span>{{msg.user.name}}</span><span>{{msg.time}}</span></div>
              <div class="msg-text">{{msg.context}}</div>
            </div>
          </li>
        </ul>
      </div>
      <!--输入框-->
      <div class="input-box">
        <div class="input-top-box"><i class="iconfont icon-biaoqing"></i></div>
        <textarea v-model.trim="msg" @keyup.enter="sendMsg"></textarea>
        <button id="send-btn" @click="sendMsg">发送</button>
      </div>
    </div>
  </div>
</template>

<script>
import userPhoto from './photo'
export default {
  name: 'chart',
  components: {
    'user-photo': userPhoto
  },
  data () {
    return {
      selectUserIndex: 0,
      userList: [{
        name: '聊天室',
        id: 'chartroom'
      }],
      msg: '',
      notice: null,
      searchWord: '',
      msgObj: {},
      currentMsg: [],
      lastMsgList: {}
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
    },
    msgList () {
      return this.selectUser.id && this.msgObj[this.selectUser.id] ? this.msgObj[this.selectUser.id] : []
    },
    allUserIdList () {
      let arr = this.userList.map(val => val.id)
      return arr
    }
  },
  mounted () {
    let _this = this
    this.$nextTick(t => {
      let userlist = localStorage.getItem('userList')
      if (userlist !== null) {
        userlist = JSON.parse(userlist)
        this.userList = userlist
      }
      this.userList.push(this.myUser)
    })

    socket.on('notice2', info => {
      // localStorage.setItem("userList",JSON.stringify(info));
      this.userList = info
    })
    // 当接收到有人连接进来
    socket.on('connected', info => {
      console.log(info)
      // localStorage.setItem("userList",JSON.stringify(info));
      this.userList = info
    })
    // 当接收到有人断开后
    socket.on('disconnected', info => {
      console.log(info)
      // localStorage.setItem("userList",JSON.stringify(info.list));
      _this.userList = info.list.splice(info.index, 1)
      _this.notice = info.user + '离开了~'
      setTimeout(() => {
        _this.notice = null
      }, 6000)
    })
    // 当有人退出登录
    socket.on('logouted', info => {
      // localStorage.setItem("userList",JSON.stringify(info.list));
      _this.userList = info.list
      _this.notice = info.user + '离开了~'
      setTimeout(() => {
        _this.notice = null
      }, 6000)
    })
    // 接收消息
    socket.on('message', msg => {
      // console.log(msg)
      if (msg.type === 'chartroom') {
        if (!_this.msgObj['chartroom']) {
          _this.$set(_this.msgObj, 'chartroom', [])
        }
        _this.msgObj['chartroom'].push(msg)

        // 加入新消息提醒
        if (_this.currentMsg.indexOf('chartroom') === -1 && _this.selectUser.id !== 'chartroom') {
          _this.currentMsg.push('chartroom')
        }
        _this.$set(_this.lastMsgList, 'chartroom', {text: msg.context, time: msg.time})
      } else if (msg.type === 'single') {
        let toId = msg.to.id
        let userId = msg.user.id
        let theId = null
        // 被接收
        if (toId == _this.myUser.id) {
          // 用户列表不全
          if (_this.allUserIdList.indexOf(userId) == -1) {
            _this.userList.push(msg.user)
          }
          theId = userId
        // 发送方
        } else if (userId == _this.myUser.id) {
          theId = toId
        }
        if (!_this.msgObj[theId]) {
          _this.$set(_this.msgObj, theId, [])
        }
        _this.msgObj[theId].push(msg)

        // 加入新消息提醒
        if (_this.currentMsg.indexOf(theId) === -1 && _this.selectUser.id != theId) {
          _this.currentMsg.push(theId)
        }
        _this.$set(_this.lastMsgList, theId, {text: msg.context, time: msg.time});
      }
    })

    // 后退
    window.onpopstate = function (event) {
      window.location.href = window.location.href.split('#')[0]
    }
  },
  methods: {
    // 发送消息
    sendMsg () {
      if (this.msg === '') return
      if (this.selectUser.id === 'chartroom') {
        socket.emit('message', {
          user: this.myUser,
          time: this.getNowTime(),
          context: this.msg,
          type: 'chartroom'
        })
      } else {
        socket.emit('message', {
          user: this.myUser,
          time: this.getNowTime(),
          context: this.msg,
          type: 'single',
          to: this.selectUser
        })
      }

      this.msg = ''
    },
    // 退出
    logout () {
      socket.emit('logout', this.myUser)
      setTimeout(() => {
        this.$router.push({name: 'login'})
      }, 100)
    },
    // 获取当前时间
    getNowTime () {
      let t = new Date()
      let time = t.getHours() + ':' + t.getMinutes()
      return time
    },
    // 选择聊天对象
    changeChart (index, user) {
      this.selectUserIndex = index
      // 去掉新消息
      if (this.currentMsg.indexOf(user.id) > -1) {
        let i = this.currentMsg.indexOf(user.id)
        this.currentMsg.splice(i, 1)
      }
    },
    getUserNameOne (user) {
      return user.name ? user.name.substr(0, 1) : 'N'
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
.chartNum{
  font-style:normal;
  font-weight:normal;
  font-size:16px;
  margin-left:10px;
}
.left-box{
  width: 310px;
  height: 100%;
  float: left;
  background: #ebe9e8;
}
.userinfo{
  width: 60px;
  height: 100%;
  background: #2c2726;
  float: left;
  position: relative;
}
.username{
  color: #fff;
  font-size: 12px;
  max-width: 48px;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 auto;
}
.userinfo>.user_photo{
  margin: 18px auto;
  float: none;
  margin-bottom: 10px;
}
.search-box{
  width: 226px;
  height: 25px;
  margin: 25px auto 0;
  position: relative;
}
.search-box .iconfont{
  position: absolute;
  top: 5px;
  right: 6px;
  cursor:pointer;
  color:#999;
}
.search-box input{
  background: #e5e2e2;
  box-sizing: border-box;
  border: 1px solid #c7c7c7;
  height: 100%;
  width: 98%;
  outline: none;
  font-size: 12px;
  padding-left: 4px;
  padding-right:24px;
}
.search-box input:hover{border-color:#1aad19;}
.search-box input:focus{background:#eee;color:#333;}
.user-list{
  height: 580px;
  overflow-y: auto;
}
.left-box ul{
  padding:15px 10px;
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
  width: calc(100% - 40px);
}
.left-box li .user_info>p{
  margin: 7px 0 4px 0;
  text-align: left;
}
.msg_time{
  color: #999;
  font-size: 12px;
  float: right;
}
.red_dot{
  background: #ef3636;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  left: 47px;
  top: 14px;
}
.last_msg{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  margin-top: 4px;
  color: #999;
  max-width: 155px;
  text-align: left;
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
.notices{
  max-width: 300px;
  height: 20px;
  background: #d4d4d4;
  position: absolute;
  left: 50%;
  margin-left: -132px;
  top: 20px;
  font-size: 12px;
  border-radius: 15px;
  color: #fff;
  text-align: center;
  line-height: 20px;
  padding: 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all .3s linear;
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
  transition: all .3s ease;
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
  height: 36px;
  padding: 8px 0 0 20px;
  box-sizing: border-box;
  position: relative;
}
.input-top-box .iconfont{
  float: left;
  font-size: 20px;
  cursor:pointer;
  color:#666;
}
.input-box textarea{
  width: 554px;
  height: 68px;
  margin-left: 20px;
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
  font-size:18px;
  color:#bbb;
  margin-right:10px;
  cursor:pointer;
  font-weight:normal;
  font-style: inherit;
}

.logout:hover{
  color:#888;
}
</style>
