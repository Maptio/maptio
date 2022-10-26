import { localizeMessage } from '../scripts';
import {
  headerHtml,
  signatureHtml,
  footerHtml,
  generateCtaButtonHtml,
} from './components';

const html = `
  ${headerHtml}
    <h1 class="center">
      ${localizeMessage('inviteEmailMainHeading')}
    </h1>

    <p>
      ${localizeMessage('inviteEmailExplanation')}
    </p>

    <p>
      ${localizeMessage('inviteEmailCTAIntro')}
    </p>

    ${generateCtaButtonHtml('inviteEmailCTA')}

    <p>
      ${localizeMessage('inviteEmailContactUs')}
    </p>

    ${signatureHtml}

    ${localizeMessage('contactIfNotRequestedInvite')}
  ${footerHtml}
`;

export default html;
