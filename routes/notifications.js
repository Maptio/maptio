var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var request = require('request')
// const { IncomingWebhook } = require('@slack/client');
// const url = 'https://hooks.slack.com/services/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';
// const webhook = new IncomingWebhook(url);

require('dotenv').config()

router.post('/send', function (req, res, next) {
    // let text = req.body.text;
    // let title = req.body.title;
    // let imageUrl = req.body.imageUrl;
    // let time = req.body.time;
    let url = req.body.url;
    let attachments = req.body.attachments;

    let payload = {
        "attachments": attachments
        // "text": text,

        // "attachments": [
        //     {
        //         "fallback": "Zappi initiatives",
        //         "color": "#2f81b7",
        //         "pretext": "Optional text that appears above the attachment block",
        //         "title": title,
        //         "title_link": "https://app.maptio.com/map/5ad722f8d988106275174da1/zappi-debug/circles",
        //         "text": "Optional text that appears within the attachment",
        //         "image_url": imageUrl,
        //         "thumb_url": imageUrl,
        //         "footer": "Maptio",
        //         "footer_icon": "https://app.maptio.com/assets/images/logo-full.png",
        //         "ts": time
        //     }
        // ]
    }
    request.post({
        headers: { 'content-type': 'application/json' },
        url: url,
        body: payload,
        json: true
    }, function (error, response, body) {
        console.log(error, response.statusCode)
        if (error) {
            res.send(error);
        }
        else if (response.statusCode === 404) {
            res.status(404).send(body);
        }
        else if (response.statusCode === 200) {
            res.status(200).json(response)
        }
        else {
            res.status(500);
        }
    });
    // webhook.send(payload, function (err, res) {
    //     if (err) {
    //         res.send(err);
    //     } else {
    //         res.json(res)
    //     }
    // });
});


module.exports = router;