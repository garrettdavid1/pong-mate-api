var CryptoJS = require('crypto-js');

tokenHandler = (function(){
    var TokenController = function(){
        var self = this;

        self.generateToken = function(user, dateTimeUtc, sessionSecret){
            const hashLeft = CryptoJS.HmacSHA256(user.userName, user.password).toString();
                const hashRight = `${user.userName}:${dateTimeUtc}`;
                const token = CryptoJS.HmacSHA256(`${hashLeft}:${hashRight}`, sessionSecret).toString();
                return token;
        }

        self.isValidToken = function(token, sessionSecret, callback){
            if(token.toLowerCase().indexOf('bearer ') === 0){
                token = token.substring(7)
                sessionCtrl.getSession(token, function(session){
                    if(session){
                        userCtrl.getUser(session.userId, function(user){
                            let isValidToken = false;
                            if(user){
                                const newToken = self.generateToken(user, new Date(session.createDateTimeUtc).toUTCString(), sessionSecret);
                                // console.log(`token: ${token}`)
                                // console.log(`newToken: ${newToken}`)
                                if(newToken === token && new Date(session.expireDateTimeUtc > new Date())){
                                    isValidToken = true;
                                }
                                if(isValidToken){
                                    lib.handleResult(true, callback)
                                } else{
                                    lib.handleResult(false, callback)
                                }
                            } else{
                                lib.handleResult(false, callback)
                            }
                        });
                    } else{
                        lib.handleResult(false, callback);
                    }
                });
            } else{
                lib.handleResult(false, callback)
            }
        }
    }
    
    var tokenController;
    return {
        init: function(){
            tokenController = new TokenController();
        },
        generateToken: function(user, dateTimeUtc, sessionSecret){
            return tokenController.generateToken(user, dateTimeUtc, sessionSecret);
        },
        isValidToken: function(token, sessionSecret, callback){
            return tokenController.isValidToken(token, sessionSecret, callback);
        }
    }
})(); 

module.exports = tokenHandler;