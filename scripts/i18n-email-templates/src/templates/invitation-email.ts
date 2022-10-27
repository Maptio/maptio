import { localizeMessage } from '../scripts';
import {
  headerHtml,
  signatureHtml,
  footerHtml,
  generateCtaButtonHtml,
} from './components';

const html = `
  ${headerHtml}
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

    <p>
      ${localizeMessage('contactIfNotRequestedInvite')}
    </p>

  ${footerHtml}
`;

export default html;
