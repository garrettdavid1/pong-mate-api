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

        self.send = function(recipientEmail, templateName, data, callback){
            var templateConfig = emailConfig.templates[templateName];
            getHtml(templateConfig.htmlFileName, data, function(html){
                var mailOptions = {
					from: `VersaDev <${emailConfig.address}>`,
					to: recipientEmail,
					subject: templateConfig.subject,
					html: html
				};
				
                self.transporter.sendMail(mailOptions, function(error, info){
					if(error){
						console.log(`Error sending email: ${error}`);
					} else{
						// Maybe add some logging here. New collection - PasswordRecoveryRequest?
						lib.handleResult({'statusCode': 200, 'message': 'Email sent.'}, callback);
					}
				})
            })
        };

        function getHtml(templateName, data, callback){
			fs.readFile(`${__dirname.substring(0, __dirname.length - 5)}\\views\\emailTemplates\\${templateName}.html`, 'utf8', function (err, html) {
                if (err) throw err;
				else insertData(templateName, html, data, callback);
			  });
		};
		
		function insertData(templateName, html, data, callback){
			switch(templateName){
                case 'requestRecoveryCode':
                    //Once the front-end routing is done, add logic to construct correct url for authorized password reset.
                    html = html.replace(/{requestRecoveryCode}/g, data);
                    break;
                default:
                    break;
            }
            if(callback){
                callback(html);
            } else{
                lib.handleResult({'statusCode': 500, 'error': 'Error sending email.'}, callback);
            }
		}
    }
    
    var emailController;
    return {
        init: function(){
            emailController = new EmailController();
            emailController.init();
        },
        send: function(email, templateName, data, callback){
            emailController.send(email, templateName, data, callback);
        }
    }
})(); 

module.exports = emailHandler;