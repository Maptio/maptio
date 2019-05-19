var express = require('express');
var router = express.Router();
var request = require('request')

require('dotenv').config()

const ACCESS_TOKEN_URL = process.env.ACCESS_TOKEN_URL; //"https://circlemapping.auth0.com/oauth/token";
const AUTH0_MANAGEMENTAPI_KEY= process.env.AUTH0_MANAGEMENTAPI_KEY; //"mjQumlN564UkegYxzZGLNhM0umeEsmdC";
const AUTH0_MANAGEMENTAPI_SECRET=  process.env.AUTH0_MANAGEMENTAPI_SECRET; //"YHMsevargwqFXmBt7I0rAjjkhCz_yQ6gb8-g4YLwQRvKI_B2at22r0MUmyENEXZ_";
const ACCESS_TOKEN_AUDIENCE= process.env.ACCESS_TOKEN_AUDIENCE; //"https://circlemapping.auth0.com/api/v2/";
   
router.get('/token', function (req, res, next) {
    var options = {
        method: 'POST',
        url: ACCESS_TOKEN_URL,
        headers:
        {
            'content-type': 'application/json'
        },
        body:
        {
            "client_id": AUTH0_MANAGEMENTAPI_KEY,
            "client_secret": AUTH0_MANAGEMENTAPI_SECRET,
            "audience": ACCESS_TOKEN_AUDIENCE,
            "grant_type": "client_credentials"
        },
        json: true
    };

    request(options, function (err, response, body) {
        if(err){
            res.status(500).send(err);
        }
        else{
            res.send(body.access_token)
        }
    })
});


module.exports = router;