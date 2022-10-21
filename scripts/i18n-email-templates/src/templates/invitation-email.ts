import { localizeMessage } from '../scripts';

import headerHtml from './components/header';
import signatureHtml from './components/signature';
import footerHtml from './components/footer';

const html = `
  ${headerHtml}
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
      {% assign splitURL = url | split: '#' %}
      {% assign languageURL = splitURL[0] | append: '&ui_locales=' | append: request_language %}

      <a href="{{ languageURL }}" class="intercom-h2b-button">
        ${localizeMessage('inviteEmailCTA')}
      </a>
    </p>

    <p>
      ${localizeMessage('inviteEmailContactUs')}
    </p>

    ${signatureHtml}

    ${localizeMessage('contactIfNotRequestedInvite')}
  ${footerHtml}
`;

export default html;
