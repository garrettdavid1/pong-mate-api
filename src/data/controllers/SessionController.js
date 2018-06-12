var bcrypt = require('bcrypt');
const saltRounds = 10;

sessionHandler = (function () {
    var SessionController = function () {
        var self = this;
        self.numOfHoursValid = 24

        newSession = function(username, token){
            var now = new Date();
            return {
                'createDateTimeUTC': new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())),
                'expireDateTimeUTC': new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + self.numOfHoursValid, now.getMinutes(), now.getSeconds(), now.getMilliseconds())),
                username: username,
                token: token
            };
        }

        self.createSession = function(session, callback){
            db.add('Session', session, function(result){
                var session = result.ops[0];
                if(lib.exists(session)){
                    lib.handleResult({'result': 'success', 'session': session}, callback);
                }else{
                    lib.handleResult({ 'result': 'failure', 'message': 'Failed to create session.' }, callback);
                }
            });
        }

        self.getSession = function(token, callback){
            db.get('Session', {'token': token}, null, function(result){
                var session = result[0];
                if(lib.exists(session)){
                    lib.handleResult(result[0], callback);
                } else{
                    lib.handleResult({ 'result': 'failure', 'message': 'Invalid session.' }, callback);
                }
            });
        };
    }

    var sessionController;

    return {
        init: function(){
            sessionController = new SessionController();
        },
        createSession: function(session, callback){
            return sessionController.createSession(session, callback);
        },
        getSession: function(token, callback){
            return sessionController.getSession(token, callback);
        },
    }
})();

module.exports = sessionHandler;