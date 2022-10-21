import { localizeMessage } from '../scripts';

import headerHtml from './components/header';
import signatureHtml from './components/signature';
import footerHtml from './components/footer';

const html = `
  ${headerHtml}
    <h1>${localizeMessage('verificationEmailMainHeading')}</h1>

    <p>${localizeMessage('verificationEmailExplanation')}</p>

    <p>
      {% assign splitURL = url | split: '#' %}
      {% assign languageURL = splitURL[0] | append: '&ui_locales=' | append: request_language %}

      <a href="{{ languageURL }}" class="intercom-h2b-button">
        ${localizeMessage('verificationEmailCTA')}
      </a>
    </p>

    <p>${localizeMessage('verificationEmailContactUs')}</p>

    ${signatureHtml}

    ${localizeMessage('contactIfNotRequested')}
  ${footerHtml}
`;

export default html;
