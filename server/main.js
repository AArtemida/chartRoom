//const userApi = require('./api');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// 服务开启后访问指定编译好的dist文件下的数据
app.use(express.static(path.resolve(__dirname, '../dist')))
app.get('*', function(req, res) {
	const html = fs.readFileSync(path.resolve(__dirname, '../dist/index.html'), 'utf-8')
	res.send(html);
})

// 后端api路由
//app.use('/api', userApi);

// 引入http模块
var http = require('http');
// 用http模块创建一个服务并把express的实例挂载上去
var server = http.Server(app);
// 引入socket.io并立即实例化，把server挂载上去
var io = require('socket.io')(server);

// 监听端口
var server = server.listen(4001, function () {
    console.log('服务端启动成功！端口4001');
});

let onlieCount = 0;
let userList = [{
    name: '聊天室',
    id: 'chartroom',
    photo:null,
    msg:{
        text:'',
        time:'',
    }
}];
let msgList = [];
let msgObj = {};
var allsocket = {};
// 新用户连接进来时
io.on('connection', function (socket) {
    var theId = socket.id;
    onlieCount ++;
    // 给所有客户端发送消息
    socket.emit('notice','hello world');
    // 登录
    socket.on('login', function (user) {
        var obj = Object.assign({},user,{
            photo:null,
            msg:{
                text:'',
                time:'',
            },
            socketId:theId,
        });
        userList.push(obj);

        console.log(user.name+'进来了,'+'现在有'+onlieCount+'人在线！');
        io.emit('connected',userList);
    });
    allsocket[theId] = socket;

    io.emit('connected',userList);

    // 当有用户断开时
    socket.on('disconnect', function () {
        if(onlieCount > 0){
            onlieCount --;
        }
        var theIndex = userList.findIndex(val => {
            return socket.id == val.socketId;
        })
        console.log('index:',theIndex)
        if(userList[theIndex]){
            var theUserName = userList[theIndex].name;
            console.log(theUserName+'离开了,'+'现在有'+onlieCount+'人在线！');
            socket.emit('disconnected',{list:userList,user:theUserName,index:theIndex});
            userList.splice(theIndex,1);//删除该用户
        }else{
            console.log('有一个人离开了,'+'现在有'+onlieCount+'人在线！');
        }
    });

    //退出登录
    socket.on('logout', function (user) {
        if(onlieCount > 0){
            onlieCount --;
        }
        var theIndex = userList.findIndex(val => {
            return socket.id == val.socketId;
        })
        if(userList[theIndex]){
            var theUserName = user.name;
            console.log(theUserName+'退出登录,'+'现在有'+onlieCount+'人在线！');
            userList.splice(theIndex,1);//删除该用户
            io.emit('logouted',{list:userList,user:theUserName});
        }else{
            console.log('有一个人退出登录,'+'现在有'+onlieCount+'人在线！');
        }
    })
    // 收到了客户端发来的消息
    socket.on('message', function(message) {
        // message.usermsg.time = new Date().getTime();
        message.socketid = socket.id;
        if(message.type == 'chartroom') {
            msgList.push(message);
            io.emit('message', message);
        }else{
            let selectId = message.to.socketId;
            if(selectId) {
                if(allsocket[selectId]){
                    allsocket[selectId].emit('message', message);
                }
                if(selectId != socket.id && allsocket[socket.id]){
                    allsocket[socket.id].emit('message', message);
                }
            } else {
                io.emit('message', message);
            }
        }
    })
});

// app.listen(3000);
// console.log('success listen at port:3000......');