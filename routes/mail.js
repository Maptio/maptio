var express = require('express');
var router = express.Router();
var aws = require("aws-sdk");
var fs = require("fs");
var path = require('path');
var _ = require("lodash");


let SECRET = "***REMOVED***";
let KEY = "AKIAI233ZOM542XDBUMQ";
let AMAZON = "https://email.eu-west-1.amazonaws.com"
let REGION = "eu-west-1";

let ses = new aws.SES({
    apiVersion: "2010-12-01",
    accessKeyId: KEY,
    secretAccessKey: SECRET,
    region: REGION,
    endpoint: AMAZON
});


// router.post('/send', function (req, res, next) {

//     let from = req.body.from;
//     let to = req.body.to;
//     let subject = req.body.subject;
//     let htmlBody = req.body.body


//     ses.sendEmail({
//         Source: from,
//         Destination: { ToAddresses: to },
//         Message: {
//             Body: {
//                 Html: {
//                     Data: htmlBody
//                 }
//             },
//             Subject: {
//                 Data: subject
//             }
//         }
//     }
//         , function (err, data) {
//             if (err) {
//                 res.send(err);
//             } else {
//                 res.json(data);
//             }
//         });

// });

router.post('/invite', function (req, res, next) {

    let from = req.body.from;
    let to = req.body.to;
    let subject = req.body.subject;
    let url = req.body.url;
    let team = req.body.team;

    let template = _.template(fs.readFileSync(path.join(__dirname, "..", "public/templates/email-invitation.html")))
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

module.exports = router;