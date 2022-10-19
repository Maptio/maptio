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
      <a href="{{ url }}" class="action">
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
