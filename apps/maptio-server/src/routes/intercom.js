var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var request = require('request');
var Intercom = require('intercom-client');

require('dotenv').config();

// const INTERCOM_CLIENT_ID = process.env.INTERCOM_CLIENT_ID;
// const INTERCOM_CLIENT_SECRET = process.env.INTERCOM_CLIENT_SECRET;
const INTERCOM_ACCESS_TOKEN = process.env.INTERCOM_ACCESS_TOKEN;

var client = new Intercom.Client({ token: INTERCOM_ACCESS_TOKEN });

router.post('/user/update', function (req, res, next) {
  let email = req.body.email;
  let company = req.body.company;
  client.users.update(
    {
      email: email,
      companies: [company],
    },
    function (error, user) {
      if (error) {
        res.send(error);
      } else {
        res.json(user);
      }
    }
  );
});

router.get('/team/:tid', function (req, res, next) {
  client.companies.find({ company_id: req.params.tid }, function (error, user) {
    if (error) {
      res.send(error);
    } else {
      res.json(user);
    }
  });
});

module.exports = router;
