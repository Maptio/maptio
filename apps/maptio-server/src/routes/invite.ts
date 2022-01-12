/* eslint-disable @typescript-eslint/no-var-requires */

const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const templating = require('lodash/template');
require('dotenv').config();
const isDevelopment = process.env.NODE_ENV !== 'production';

import { getAuth0MangementClient } from '../auth/management-client';


const ses = new aws.SES({
  apiVersion: '2010-12-01',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
  endpoint: process.env.AWS_DEFAULT_ENDPOINT,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.post('/', function (req, res, next) {
  console.log(req.body);
  // res.json('ok');

  const auth0ManagementClient = getAuth0MangementClient();

  auth0ManagementClient
    .getUsers()
    .then(function(users) {
      res.send(users);
    })
    .catch(function(err) {
      console.log(err);
    });



  // sendInvitationEmail(req, res);
});

function sendInvitationEmail(req, res) {
  const from = req.body.from;
  const to = isDevelopment ? ['roman.goj@gmail.com'] : req.body.to;
  const subject = req.body.subject;
  const url = req.body.url;
  const team = req.body.team;

  const template = templating(
    fs.readFileSync(
      path.join(__dirname, 'assets/templates/email-invitation.html')
    )
  );
  const htmlBody = template({ url: url, team: team });

  ses.sendEmail(
    {
      Source: from,
      Destination: { ToAddresses: to },
      Message: {
        Body: {
          Html: {
            Data: htmlBody,
          },
        },
        Subject: {
          Data: subject,
        },
      },
    },
    function (err, data) {
      if (err) {
        res.send(err);
      } else {
        res.json(data);
      }
    }
  );
}

module.exports = router;
