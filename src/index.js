var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const {ObjectId} = require('mongodb');
var config;
try{
    config = require('./appconfig.js');
}catch(err){
    config = null;
}

(function(monthController, transController){
    var self = this;
    self.userCtrl = require('./data/controllers/UserController.js');
    self.accountCtrl = require('./data/controllers/AccountController.js');
    self.sessionCtrl = require('./data/controllers/SessionController.js');
    self.tokenHandler = require('./util/Token.js');
    self.lib = require('./lib/lib.js');
    self.db = require('./data/database.js');
    self.db.connect((config !== undefined && config !== null) ? config.devDbName : 'PongMate', initControllers());
    self.safeObjectId = s => ObjectId.isValid(s) ? new ObjectId(s) : null;


    function initControllers(){
        self.lib.init();
        self.sessionCtrl.init(config);
        self.userCtrl.init();
        self.accountCtrl.init();
        self.tokenHandler.init();
    }

    return {
        lib: function(){
            return self.lib;
        },
        userCtrl: function(){
            return self.userCtrl;
        },
        accountCtrl: function(){
            return self.accountCtrl;
        },
        sessionCtrl: function(){
            return self.sessionCtrl;
        },
        tokenHandler: function(){
            return self.tokenHandler;
        },
        db: function(){
            return self.db;
        },
        safeObjectId: function(id){
            return self.safeObjectId(id);
        }
    }
})();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", lib.allowedOrigins());
    res.header('Access-Control-Allow-Credentials', 'true');
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function(req, res, next){
    res.sendFile(__dirname + '/index.html');
});

/*::::::::::::::::::::: Routes ::::::::::::::::::::*/
app.post('/register', function(req, res, next){
    accountCtrl.registerUser(req.body.userName, req.body.password, req.body.email, function(result){
        lib.handleResponse(result, res);
    });
});

app.post('/login', function(req, res, next){
    accountCtrl.login(req.body.email, req.body.password, function(result){
        lib.handleResponse(result, res);
    });
});

app.get('/logout', function(req, res, next){
    accountCtrl.logout(req.headers.authorization, function(result){
        lib.handleResponse(result, res);
    });
});

/*::::::::::::::::::: End Routes ::::::::::::::::::*/

var server = app.listen(lib.port(), function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log('PongMate API running at http://%s:%s', host, port);
});