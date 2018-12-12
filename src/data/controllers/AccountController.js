var bcrypt = require('bcrypt');
const saltRounds = 10;

accountHandler = (function () {
    var AccountController = function (config) {
        var self = this;
        self.config = config;

        self.registerUser = function(userName, password, email, callback){
            if(isValidPassword(password)){
                userCtrl.getUserByEmail(email, function (result) {
                    if(result){
                        lib.handleResult({'statusCode': 400, 'error': 'User already exists for this email address.'}, callback);
                    } else{
                        userCtrl.getUserByUserName(userName, function(result){
                            if(result){
                                lib.handleResult({'statusCode': 400, 'error': 'Username already exists. Please choose another.'}, callback);
                            } else{
                                bcrypt.hash(password, saltRounds, function(err, hash) {
                                    var user = userCtrl.newUser(userName, hash, email);
                                    userCtrl.createUser(user, callback);
                                });
                            }
                        });
                    }
                });
            } else{
                lib.handleResult({'statusCode':400, 'error': 'Password does not meet requirements.'}, callback);
            }
        };

        self.login = function(email, password, callback){
            userCtrl.getUserByEmail(email, function (result) {
                if(result){
                    var user = result;
                    bcrypt.compare(password, user.password, function (err, res) {
                        if (res === true) {
							sessionCtrl.createSession(user, callback);
                        } else {
                            lib.handleResult({'statusCode': 403, 'error': 'Incorrect email or password.' }, callback);
                        }
                    });
                }else{
                    lib.handleResult({'statusCode': 403, 'error': 'Incorrect email or password.' }, callback);
                }
                
            });
        }

        self.logout = function(token, callback){
            if(token.indexOf('bearer ') === 0){
                token = token.substring(7)
                sessionCtrl.getSession(token, function(session){
                    sessionCtrl.deleteSession(session._id, function(result){
                        lib.handleResult({'statusCode': 200, 'message': 'Successfully logged out.'}, callback);
                    });
                })
            } else{
                lib.handleResult({'statusCode': 400, 'error': 'Malformed authorization token.'}, callback);
            }
        }

        self.requestRecoveryCode = function(email, callback){
            userCtrl.getUserByEmail(email, function(user){
                if(user){
                    user.recoveryCode = lib.getRandomLetters(10);
                    var now = new Date();
                    var recoveryCodeExpiration = new Date(now.setMinutes(now.getMinutes() + 10));
                    user.recoveryCodeExpirationUtc = lib.toUtc(recoveryCodeExpiration);
                    userCtrl.updateUser(user._id, user, function(result){
                        emailHandler.send(email, 'requestRecoveryCode', user.recoveryCode, callback);
                    })
                } else{
                    lib.handleResult({'statusCode': 200, 'message': 'Email sent.'}, callback);
                }
            })
        }

        self.recoverAccount = function(email, recoveryCode, newPassword, callback){
            userCtrl.getUserByEmail(email, function(user){
                if(user){
                    if(recoveryCode === user.recoveryCode){
                        if(new Date(user.recoveryCodeExpirationUtc) > new Date()){
                            bcrypt.hash(newPassword, saltRounds, function(err, hash) {
                                user.password = hash;

                                var newUser = Object.assign({}, user);
								userCtrl.updateUser(user._id, newUser, function(result){
                                    userCtrl.unsetFields(user._id, ['recoveryCode', 'recoveryCodeExpirationUtc'], function(unsetResult){
                                        lib.handleResult({'statusCode': 200, 'user': {'userName': newUser.userName, 'userId': newUser._id.toString()}}, callback);
                                    })
                                });
							});
                        } else{
                            lib.handleResult({'statusCode': 403, 'error': 'Expired recovery code.'}, callback);
                        }
                    } else{
                        lib.handleResult({'statusCode': 403, 'error': 'Invalid recovery code.'}, callback);
                    }
                } else{
                    lib.handleResult({'statusCode': 403, 'error': 'Not authorized.'}, callback);
                }
            })
        }

        self.changePassword = (token, oldPassword, newPassword, callback) => {
            if(isValidPassword(newPassword)){
                tokenHandler.isValidToken(token, self.config.sessionSecret, function(result){
                    if(result){
                        sessionCtrl.getSession(token.substring(7), function(sessionResult){
                            if(sessionResult){
                                userCtrl.getUser(sessionResult.userId, function(user){
                                    if(user){
                                        bcrypt.compare(oldPassword, user.password, function (err, res) {
                                            if (res === true) {
                                                bcrypt.hash(newPassword, saltRounds, function(err, hash) {
                                                    user.password = hash;
                                                    userCtrl.updateUser(user._id, user, function(updateResult){
                                                        sessionCtrl.createSession(user, callback);
                                                    });
                                                });
                                            } else {
                                                lib.handleResult({'statusCode': 403, 'error': 'Incorrect email or password.' }, callback);
                                            }
                                        });
                                    } else{
                                        lib.handleResult({'statusCode': 400, 'error': 'User not found.'}, callback);
                                    }
                                })
                            } else{
                                lib.handleResult({'statusCode': 403, 'error': 'Invalid Session'}, callback);
                            }
                        })
                    } else{
                        lib.handleResult({'statusCode': 403, 'error': 'Invalid Session'}, callback);
                    }
                })
            } else{
                lib.handleResult({'statusCode':400, 'error': 'Password does not meet requirements.'}, callback);
            }
        }

        isValidPassword = (password) => {
            const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
            const uppercaseChars = lowercaseChars.toUpperCase();
            const numbers = '1234567890'
            const specialChars = '!@#$%^&*()_-=+/?.>,<\'"]}[{`~|';

            let lowercaseCharsReqMet = false;
            let uppercaseCharsReqMet = false;
            let numberReqMet = false;
            let specialCharsReqMet = false;
            let lengthReqMet = password.length >= 8;

            if(lengthReqMet){
                password.split('').forEach(character => {
                    if(lowercaseChars.indexOf(character) !== -1){
                        lowercaseCharsReqMet = true;
                    }
                    if(uppercaseChars.indexOf(character) !== -1){
                        uppercaseCharsReqMet = true;
                    }
                    if(numbers.indexOf(character) !== -1){
                        numberReqMet = true;
                    }
                    if(specialChars.indexOf(character) !== -1){
                        specialCharsReqMet = true;
                    }
                });

                return lowercaseCharsReqMet && uppercaseCharsReqMet && specialCharsReqMet;
            } else{
                return false;
            }
        }
    }

    var accountController;

    return {
        init: function(config){
            accountController = new AccountController(config);
        },
        registerUser: function(userName, password, email, callback){
            return accountController.registerUser(userName, password, email, callback);
        },
        login: function(email, password, callback){
            return accountController.login(email, password, callback);
        },
        logout: function(token, callback){
            return accountController.logout(token, callback);
        },
        requestRecoveryCode: function(email, callback){
            return accountController.requestRecoveryCode(email, callback);
        },
        recoverAccount: function(email, recoveryCode, password, callback){
            return accountController.recoverAccount(email, recoveryCode, password, callback);
        },
        changePassword: function(token, oldPassword, newPassword, callback){
            return accountController.changePassword(token, oldPassword, newPassword, callback);
        }
    }
})();

module.exports = accountHandler;