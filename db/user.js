/**
 * Created by cristianorosario on 14/01/15.
 */
var db = require('./db');

function User(sUsername, sPassword, sEmail, iId, sRole) {
    this.username = sUsername;
    this.password = sPassword;
    this.email = sEmail;
    this.role = sRole;
    this.isAuthenticated = false;
    this.id = iId
}

function mapUser(row) {
    return new User(row.username, row.password, row.email, row.id, row.role);
}

User.getUsername = function (sUsername, fnCallback) {
    db.selectOne("SELECT id, username, password, email, role from queixinhas.users where username=$1",
        [sUsername],
        mapUser,
        fnCallback);
};

User.createNew = function (oUser, fnCallback) {
    var params = [oUser.username, oUser.password, oUser.email];
    db.executeQuery("INSERT into queixinhas.users(username, password, email, role) values($1, md5($2), $3,'user')",
        params,
        function (err) {
            fnCallback(err, oUser.id)
        }
    );
};

User.verifyEmail = function (sEmail, fnCallback) {
    db.selectOne("Select * from queixinhas.users where email = $1", [sEmail], mapUser, fnCallback);
};

User.changePassword = function (sPassword, iUserId, fnCallback) {
    db.executeQuery("Update queixinhas.users set password = md5($1) where id = $2 returning *", [sPassword, iUserId],fnCallback);
};

module.exports.User = User;