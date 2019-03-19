var models = require('./db');
var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var $sql = require('./sqlMapper');//sql语句

var conn = mysql.createConnection(models.mysql);
conn.connect();


module.exports = router;