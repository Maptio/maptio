var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var request = require('request')

require('dotenv').config()

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
const REDIRECT_URL = process.env.NODE_ENV === "production" ? "http://app.maptio.com/api/v1/oauth/slack" : "http://localhost:3000/api/v1/oauth/slack"

router.post('/slack', function (req, res, next) {
    console.log(req.body)
    let code = req.body.code;
    let redirect_uri = req.body.redirect_uri

    var options = {
        method: 'POST',
        url: 'https://slack.com/api/oauth.access',
        headers:
        {
            'content-type': 'application/x-www-form-urlencoded'
        },
        form:
        {
            client_id: SLACK_CLIENT_ID,
            client_secret: SLACK_CLIENT_SECRET,
            code: code,
            redirect_uri: redirect_uri
        },
        json: true
    };

    request(options, function (error, response, body) {
        if(error){
            res.error(err)
        }
        else{
            res.json(body)
        }
    })

    // return request(options).then(slack => {
    //     return slack;
    // console.log(slack)
    // let options = {
    //     method: 'POST',
    //     url: `http://localhost:3000/api/v1/jwt/encode`,
    //     headers:
    //     {
    //         'content-type': 'application/json'
    //     },
    //     body: slack,
    //     json: true
    // }
    // return request(options)
// })
    // .then(encoded => {
    //     let token = encoded.token;

    //     return request({
    //         method: "GET",
    //         url: `http://localhost:3000/teams/59bed8e434a28352f6b9a0a8/eworks-words-better-than-i/integrations?token=${token}`
    //     })

    // });

});


module.exports = router;