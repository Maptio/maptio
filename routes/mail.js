var express = require('express');
var router = express.Router();
var aws = require("aws-sdk");

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


router.post('/send', function (req, res, next) {

    console.log("send email");

    let from = req.body.from;
    let to = req.body.to;
    let subject = req.body.subject;
    let htmlBody = req.body.body


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