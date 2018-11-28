libHandler = (function () {
    var Library = function () {
        var self = this;

        self.exists  = function(variable){
            return (variable !== null && variable !== undefined);
        };

        self.handleResult = function(obj, callback){
            if(self.exists(callback)){
                callback(obj);
            } else{
                return obj;
            }
        }

        self.handleResponse = function(obj, callback){
            if(obj.statusCode){
                
            }
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
        }
    }
})();

module.exports = libHandler;