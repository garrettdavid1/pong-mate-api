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
        }
    }
})();

module.exports = libHandler;