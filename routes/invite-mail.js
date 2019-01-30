var express = require('express');
var router = express.Router();
var aws = require("aws-sdk");
var fs = require("fs");
var path = require('path');
var template = require("lodash/template");
require('dotenv').config()
const isDevelopment = process.env.ENV !== "production"

let ses = new aws.SES({
    apiVersion: "2010-12-01",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION,
    endpoint: process.env.AWS_DEFAULT_ENDPOINT
});


router.post('/', function (req, res, next) {

    let from = req.body.from;
    let to = isDevelopment ? ["safiyya.babio@gmail.com"] : req.body.to;
    let subject = req.body.subject;
    let url = req.body.url;
    let team = req.body.team;

    let template = template(fs.readFileSync(path.join(__dirname, "..", "public/templates/email-invitation.html")))
    let htmlBody = template({ url: url, team: team });

    ses.sendEmail({
        Source: from,
        Destination: { ToAddresses: to },
        Message: {
            Body: {
                Html: {
                    Data: htmlBody
                }
            },
            Subject: {
                Data: subject
            }
        }
    }
        , function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.json(data);
            }
        });

});

// router.post('/confirm', function (req, res, next) {
    
//         let from = req.body.from;
//         let to = isDevelopment ? ["safiyya.babio@gmail.com"] : req.body.to;
//         let subject = req.body.subject;
//         let url = req.body.url;
    
//         let template = _.template(fs.readFileSync(path.join(__dirname, "..", "public/templates/email-confirmation.html")))
//         let htmlBody = template({ url: url });
    
//         ses.sendEmail({
//             Source: from,
//             Destination: { ToAddresses: to },
//             Message: {
//                 Body: {
//                     Html: {
//                         Data: htmlBody
//                     }
//                 },
//                 Subject: {
//                     Data: subject
//                 }
//             }
//         }
//             , function (err, data) {
//                 if (err) {
//                     res.send(err);
//                 } else {
//                     res.json(data);
//                 }
//             });
    
//     });

module.exports = router;