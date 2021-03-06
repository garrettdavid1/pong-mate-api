libHandler = (function () {
    var Library = function () {
        var self = this;

        self.exists  = function(variable){
            return (variable !== null && variable !== undefined);
        };

        self.handleResult = function(obj, callback){
            if(callback){
                callback(obj);
            } else{
                return obj;
            }
        }

        self.handleResponse = function(obj, res){
            if(obj.statusCode){
                res.status(obj.statusCode);
                delete obj.statusCode;
                res.send(JSON.stringify({'data': obj}));
            } else{
                res.send(JSON.stringify({'data': obj}));
            }
        }

        self.toUtc = function(dateTime){
            return new Date(Date.UTC(dateTime.getUTCFullYear(), dateTime.getUTCMonth(), dateTime.getUTCDate(), dateTime.getUTCHours(), dateTime.getMinutes(), dateTime.getSeconds(), dateTime.getMilliseconds()))
        }

        self.newGuid = function(){
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        self.getRandomLetters = function(length) {
          var text = '';
          var letterBank = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

          for (var i = 0; i < length; i++) {
            text += letterBank.charAt(Math.floor(Math.random() * letterBank.length));
          }

          return text;
        };
    }

    var library;

    return {
        init: function(){
            library = new Library();
        },
        exists: function(variable){
            return library.exists(variable);
        },
        handleResult: function(obj, callback){
            return library.handleResult(obj, callback);
        },
        handleResponse: function(obj, res){
            library.handleResponse(obj, res);
        },
        sessionSecret: function(config){
            return library.exists(config) ? config.sessionSecret : process.env['SESSION_SECRET'];
        },
        mongoConnectionString: function(config){
            return library.exists(config) ? config.mongoConnectionString : process.env['MONGO_CONNECTION_STRING'];
        },
        port: function(){
            return process.env.PORT || 1338;
        },
        allowedOrigins: function(){
            return process.env['ALLOWED_ORIGINS'] || '*'
        },
        toUtc: function(dateTime){
            return library.toUtc(dateTime);
        },
        newGuid: function(){
            return library.newGuid();
        },
        getRandomLetters: function(length){
            return library.getRandomLetters(length);
        }
    }
})();

module.exports = libHandler;