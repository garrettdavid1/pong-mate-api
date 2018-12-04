var nodemailer = require('nodemailer');
var emailConfig = require('../config/emailConfig.js');
var fetch = require('isomorphic-fetch');
var fs = require('fs');

emailHandler = (function(){
    var EmailController = function(){
        var self = this;

        self.init = function(){
            self.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: emailConfig.address,
                  pass: emailConfig.password
                }
              });
        };

        self.send = function(recipientEmail, templateName, callback){
            var templateConfig = emailConfig.templates[templateName];
            getHtml(templateConfig.htmlFileName, function(html){
                var mailOptions = {
					from: emailConfig.address,
					to: recipientEmail,
					subject: templateConfig.subject,
					html: html
				};
				
                self.transporter.sendMail(mailOptions, function(error, info){
					if(error){
						console.log(error);
					} else{
						// console.log(`Email sent: ${info.response}`);
						// Maybe add some logging here. New collection - PasswordRecoveryRequest?
						lib.handleResult({'statusCode': 200, 'message': 'Email sent.'}, callback);
					}
				})
            })
        };

        function getHtml(templateName, callback){
			console.log(`${__dirname.substring(0, __dirname.length - 5)}\\views\\emailTemplates\\${templateName}.html`)
			fs.readFile(`${__dirname.substring(0, __dirname.length - 5)}\\views\\emailTemplates\\${templateName}.html`, 'utf8', function (err, data) {
				if (err) throw err;
				else(callback(data));
			  });
        };
    }
    
    var emailController;
    return {
        init: function(){
            emailController = new EmailController();
            emailController.init();
        },
        send: function(email, templateName, callback){
            emailController.send(email, templateName, callback);
        }
    }
})(); 

module.exports = emailHandler;