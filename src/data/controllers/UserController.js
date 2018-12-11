userHandler = (function () {
    var UserController = function () {
        var self = this;

        self.newUser = function(userName, password, email){
            var now = new Date();
            return {
                'userName': userName,
                'password': password,
                'email': email,
                'createDateTimeUTC': lib.toUtc(now)
            };
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
        init: function(){
            userController = new UserController();
        },
        getUserByEmail: function(email, callback){
            return userController.getUserByEmail(email, callback);
        },
        getUserByUserName: function(userName, callback){
            return userController.getUserByUserName(userName, callback);
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
        unsetFields: function(userId, fields, callback){
            return userController.unsetFields(userId, fields, callback);
        }
    }
})();

module.exports = userHandler;