sessionHandler = (function () {
    var SessionController = function (config) {
        var self = this;
        self.config = config;
        self.numOfHoursValid = 24

        newSession = function(userName, userId, token, dateTime){
            const createDateTimeUtc = lib.toUtc(dateTime);
            dateTime.setHours(dateTime.getHours() + self.numOfHoursValid)
            const expireDateTimeUtc = lib.toUtc(dateTime);
            return {
                'createDateTimeUtc': createDateTimeUtc,
                'expireDateTimeUtc': expireDateTimeUtc,
                'userName': userName,
                'userId': userId,
                'token': token
            };
        }

        self.createSession = function(user, callback){
            if(user){
                const now = new Date();
                const token = tokenHandler.generateToken(user, now.toUTCString(), self.config.sessionSecret);
                const session = newSession(user.userName, user._id.toString(), token, now)

                db.add('ApiSession', session, function(result){
                    var sessionResult = result.ops[0];
                    if(lib.exists(sessionResult)){
                        lib.handleResult({'statusCode': 200, 'token': sessionResult.token}, callback);
                    }else{
                        lib.handleResult({'statusCode': 400, 'error': 'Session could not be created.' }, callback);
                    }
                });
            } else{
                lib.handleResult({'statusCode': 400, 'error': 'Session could not be created.' }, callback);
            }
        }

        self.getSession = function(token, callback){
            db.get('ApiSession', {'token': token}, null, function(result){ 
                var session = result[0];
                if(lib.exists(session)){
                    lib.handleResult(result[0], callback);
                } else{
                    lib.handleResult(null, callback);
                }
            });
        };
    }

    var sessionController;

    return {
        init: function(config){
            sessionController = new SessionController(config);
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