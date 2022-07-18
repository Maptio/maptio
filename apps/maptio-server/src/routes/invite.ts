/* eslint-disable @typescript-eslint/no-var-requires */

// Old imports
// TODO: Import as ES6 modules
const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const templating = require('lodash/template');
require('dotenv').config();

// New imports
import { Request, Response, NextFunction } from 'express';

import { environment } from '../environments/environment';
import { getAuth0MangementClient } from '../auth/management-client';

// TODO: Dry just like the Auth0 code has been dried
const ses = new aws.SES({
  apiVersion: '2010-12-01',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
  endpoint: process.env.AWS_DEFAULT_ENDPOINT,
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  let inviteData;
  let userData;
  let userId: string;
  let userEmail: string;
  let invitedBy: string;
  let teamName: string;
  let createUser: boolean;

  // TODO: Error checking could be improved hear to avoid the try/catch tower of terror
  try {
    inviteData = req.body;
    userData = inviteData.userData;
    userId = userData.user_id;
    userEmail = userData.email;
    invitedBy = inviteData.invitedBy;
    teamName = inviteData.teamName;
    createUser = inviteData.createUser;
  } catch (error) {
    error.message = 'Error parsing invite data: ' + error.message;
    return next(error);
  }

  const auth0ManagementClient = getAuth0MangementClient();

  let createdUser;

  if (createUser) {
    try {
      createdUser = await auth0ManagementClient.createUser(userData);
    } catch (error) {
      error.message = 'Error creating invited user in Auth0: ' + error.message;
      return next(error);
    }

    try {
      userId = createdUser.user_id;
    } catch (error) {
      error.message = 'Error getting ID of created user: ' + error.message;
      return next(error);
    }
  }

  let changePasswordTicketResponse;

  try {
    changePasswordTicketResponse = await auth0ManagementClient.tickets.changePassword(
      {
        user_id: userId,
      }
    );
  } catch (error) {
    error.message =
      'Error getting ticket from Auth0 for user invitation' +
      `(password change for user with user id "${userId}"): ${error.message}`;
    return next(error);
  }

  let changePasswordTicket: string;

  try {
    changePasswordTicket = changePasswordTicketResponse.ticket;
  } catch (error) {
    error.message =
      'Error processing password change ticket response from Auth0: ' +
      error.message;
    return next(error);
  }

  let sendInvitationEmailResponse;

  try {
    sendInvitationEmailResponse = await sendInvitationEmail(
      userEmail,
      invitedBy,
      teamName,
      changePasswordTicket
    );
  } catch (error) {
    error.message = 'Error sending invitation email: ' + error.message;
    return next(error);
  }

  // TODO: Inherited from FE code but might be worth digging into whether this is the best way to do this
  const sendInvitationEmailSuccess =
    sendInvitationEmailResponse.MessageId !== undefined;

  res.send(sendInvitationEmailSuccess);
});

function sendInvitationEmail(userEmail, invitedBy, team, url) {
  const from = process.env.SUPPORT_EMAIL;

  // Send email to developer when running locally
  const to = environment.isDevelopment
    ? process.env.DEVELOPMENT_EMAIL
    : userEmail;

  const subject = `${invitedBy} invited you to join organisation "${team}" on Maptio`;

  const template = templating(
    fs.readFileSync(
      path.join(__dirname, 'assets/templates/email-invitation.html')
    )
  );
  const htmlBody = template({ url, team });

  return ses
    .sendEmail({
      Source: from,
      Destination: { ToAddresses: [to] },
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
    })
    .promise();
}

module.exports = router;
