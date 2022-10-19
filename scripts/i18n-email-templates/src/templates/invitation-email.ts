import { localizeMessage } from '../scripts';

import signature from './components/signature';
import footerHtml from './components/footer';

const html = `
  <html>
    <head>
      <style>
        .action {
          border-radius: 3px;
          background: #3aa54c;
          color: #fff;
          display: block;
          font-weight: 700;
          font-size: 16px;
          line-height: 1.25em;
          margin: 2rem auto;
          padding: 10px 18px;
          text-decoration: none;
          width: 180px;
          height: 56px;
          width: 194px;
          border-radius: 3px;
          background-color: #5aac44;
          font-size: 20px;
          vertical-align: middle;
          line-height: 56px;
          padding: 0px;
          text-align: center;
        }

        .center {
          text-align: center;
        }

        p {
          font-size: 1rem;
        }
      </style>
    </head>
    <body>
      <table border="0" width="100%" cellspacing="0" cellpadding="0">
        <tbody>
          <tr>
            <td>
              <div>
                <p class="center">
                  <img
                    src="https://app.maptio.com/assets/images/logo.png"
                    alt="Maptio logo"
                    width="100"
                  />
                </p>

                <h1 class="center">
                  ${localizeMessage('inviteEmailMainHeading')}
                </h1>

                <p>
                  ${localizeMessage('inviteEmailExplanation')}
                </p>

                <p>
                  ${localizeMessage('inviteEmailIntro')}
                </p>

                <p>
                  <a href="{{ url }}" class="action">
                    ${localizeMessage('inviteEmailCTA')}
                  </a>
                </p>

                <p>
                  ${localizeMessage('inviteEmailContactUs')}
                </p>

                ${signature}
                  ${localizeMessage('contactIfNotRequestedInvite')}
                ${footerHtml}
`;

export default html;
