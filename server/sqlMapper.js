//增删改查sql语句
var sqlMap  = {
	insert:'INSERT INTO test(userName,password,age) VALUES(?,?,?)',
	queryAll:'SELECT * FROM test',
	getUserByName:'SELECT * FROM test WHERE userName = ? ',
	getUserById:'SELECT * FROM test WHERE id = ? ',
	deleteUser:'DELETE FROM test WHERE id = ? ',
	updateUser:'UPDATE test SET userName = ?,password = ?,age = ? WHERE id = ? ',
	deleteMore:'DELETE FROM test WHERE id IN (?)',
	selectUser:'SELECT * FROM test WHERE userName = ? and password = ?',
	selectAdmin:'SELECT * FROM test WHERE userName = ? and password = ? and identity = "admin"',
};
module.exports = sqlMap;