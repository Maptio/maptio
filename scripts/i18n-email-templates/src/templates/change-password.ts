import { localizeMessage } from '../scripts';

import headerHtml from './components/header';
import signatureHtml from './components/signature';
import footerHtml from './components/footer';

const html = `
  ${headerHtml}
    <h1>${localizeMessage('changePasswordMainHeading')}</h1>

    <p>${localizeMessage('changePasswordExplanation')}</p>

    <p>${localizeMessage('changePasswordIntro')}</p>

    <p>
      <a href="{{ url }}" class="intercom-h2b-button">
        ${localizeMessage('changePasswordCTA')}
      </a>
    </p>

    ${signatureHtml}

    ${localizeMessage('contactIfNotRequested')}
  ${footerHtml}
`;

export default html;
