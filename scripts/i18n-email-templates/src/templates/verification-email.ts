import { localizeMessage } from '../scripts';

import headerHtml from './components/header';
import signatureHtml from './components/signature';
import footerHtml from './components/footer';

const html = `
  ${headerHtml}
    <h1>${localizeMessage('verificationEmailMainHeading')}</h1>

    <p>${localizeMessage('verificationEmailExplanation')}</p>

    <p>
      <a href="{{ url }}" class="intercom-h2b-button">
        ${localizeMessage('verificationEmailCTA')}
      </a>
    </p>

    <p>${localizeMessage('verificationEmailContactUs')}</p>

    ${signatureHtml}

    ${localizeMessage('contactIfNotRequested')}
  ${footerHtml}
`;

export default html;
