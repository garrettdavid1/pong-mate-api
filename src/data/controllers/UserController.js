userHandler = (function () {
    var UserController = function (config) {
        var self = this;
        self.config = config

        self.newUser = function(userName, password, email){
            var now = new Date();
            return {
                'userName': userName,
                'password': password,
                'email': email,
                'createDateTimeUTC': lib.toUtc(now)
            };
        }

        self.newFbUser = function(fbData, password){
            const randEightDigits = Math.floor(Math.random() * (99999999 - 10000000)) + 10000000;
            const username = `${fbData.name.replace(/\s/g, '')}_${randEightDigits}`;
            const email = fbData.email || null;
            let user = self.newUser(username, password, email);
            user.fbUserId = fbData.id;
            return user;
        }

        self.getUser = function(userId, callback){
            db.get('User', {'_id': safeObjectId(userId)}, null, function(result){
                lib.handleResult(result[0], callback);
            });
        };

        self.getUserByEmail = function(email, callback){
            db.get('User', {'email': email}, null, function(result){
                lib.handleResult(result[0], callback);
            });
        };

        self.getUserByUserName = function(userName, callback){
            db.get('User', {'userName': userName}, null, function(result){
                lib.handleResult(result[0], callback);
            })
        }

        self.getUserByToken = function(token, callback){
            tokenHandler.isValidToken(token, self.config.sessionSecret, function(isValidToken){
                if(isValidToken){
                    sessionCtrl.getSession(token.substring(7), function(sessionResult){
                        if(sessionResult){
                            userCtrl.getUser(sessionResult.userId, function(user){
                                if(user){
                                    lib.handleResult(user, callback);
                                } else{
                                    lib.handleResult({'statusCode': 400, 'error': 'User not found.'}, callback);
                                }
                            })
                        } else{
                            lib.handleResult({'statusCode': 403, 'error': 'Invalid Session'}, callback);
                        }
                    })
                } else{
                    lib.handleResult(false, callback);
                }
            })
        }

        self.getUserByFbId = function(fbUserId, callback){
            db.get('User', {'fbUserId': fbUserId}, null, function(result){
                lib.handleResult(result[0], callback);
            })
        }

        self.createUser = function(user, callback){
            db.add('User', user, function(result){
                var user = result.ops[0];
                if(user){
                    lib.handleResult({'statusCode': 200, 'user': {'userName': user.userName, 'userId': user._id.toString()}}, callback);
                }else{
                    lib.handleResult({'statusCode': 403, 'error': 'Incorrect email or password.' }, callback);
                }
            });
        };

        self.updateUser = function(userId, updateObj, callback){
             db.update('User', {'_id': safeObjectId(userId)}, updateObj, function(result){
                 lib.handleResult(result, callback);
             })
        };

        self.deleteUser = function(userId, callback){
            db.delete('User', {'_id': safeObjectId(userId)}, function(result){
                lib.handleResult(result, callback);
            })
        };

        self.unsetFields = function(userId, fields, callback){
            let unsetObj = {};
            if(Array.isArray(fields)){
                fields.forEach(field => {
                    unsetObj[field] = '';
                })
            } else{
                unsetObj[fields] = ''
            }
            db.unsetFields('User', {'_id': safeObjectId(userId)}, unsetObj, function(result){
                lib.handleResult(result, callback);
            })
        }
    }

    var userController;

    return {
        init: function(config){
            userController = new UserController(config);
        },
        getUserByEmail: function(email, callback){
            return userController.getUserByEmail(email, callback);
        },
        getUserByUserName: function(userName, callback){
            return userController.getUserByUserName(userName, callback);
        },
        getUserByToken: function(token, callback){
            return userController.getUserByToken(token, callback);
        },
        getUserByFbId: function(fbUserId, callback){
            return userController.getUserByFbId(fbUserId, callback);
        },
        getUser: function(userId, callback){
            return userController.getUser(userId, callback);
        },
        createUser: function(user, callback){
            return userController.createUser(user, callback);
        },
        updateUser: function(userId, updateObj, callback){
            return userController.updateUser(userId, updateObj, callback);
        },
        deleteUser: function(userId, callback){
            return userController.deleteUser(userId, callback);
        },
        newUser: function(userName, password, email){
            return userController.newUser(userName, password, email);
        },
        newFbUser: function(fbData, password){
            return userController.newFbUser(fbData, password);
        },
        unsetFields: function(userId, fields, callback){
            return userController.unsetFields(userId, fields, callback);
        }
    }
})();

module.exports = userHandler;