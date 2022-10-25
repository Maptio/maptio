/* eslint-disable @typescript-eslint/no-var-requires */

// Old imports
// TODO: Import as ES6 modules
const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// New imports
import { Request, Response, NextFunction } from 'express';

import { Liquid } from 'liquidjs';

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
  let languageCode: string;

  // TODO: Error checking could be improved hear to avoid the try/catch tower of terror
  try {
    inviteData = req.body;
    userData = inviteData.userData;
    userId = userData.user_id;
    userEmail = userData.email;
    invitedBy = inviteData.invitedBy;
    teamName = inviteData.teamName;
    createUser = inviteData.createUser;
    languageCode = inviteData.languageCode;
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
      changePasswordTicket,
      languageCode
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

async function sendInvitationEmail(
  userEmail,
  invitedBy,
  team,
  url,
  languageCode
) {
  const from = process.env.SUPPORT_EMAIL;

  // Send email to developer when running locally
  const to = environment.isDevelopment
    ? process.env.DEVELOPMENT_EMAIL
    : userEmail;

  const emailSubject = await readAndRenderTemplateFromFile(
    'invitation-subject.liquid',
    {
      nameOfInvitationSender: invitedBy,
      team,
      request_language: languageCode,
    }
  );

  const emailBodyHtml = await readAndRenderTemplateFromFile(
    'invitation-email.liquid',
    {
      url,
      team,
      request_language: languageCode,
    }
  );

  return ses
    .sendEmail({
      Source: from,
      Destination: { ToAddresses: [to] },
      Message: {
        Body: {
          Html: {
            Data: emailBodyHtml,
          },
        },
        Subject: {
          Data: emailSubject,
        },
      },
    })
    .promise();
}

async function readAndRenderTemplateFromFile(templateFilename, variables) {
  const templatingEngine = new Liquid();

  const templateFilePath = path.join(
    __dirname,
    'assets/templates/',
    templateFilename
  );

  // This is the body of the liquid template
  const template = fs.readFileSync(templateFilePath).toString();

  // This is the html created based on the liquid template with the variables inserted
  const html = await templatingEngine.parseAndRender(template, variables);

  return html;
}

module.exports = router;
