import { localizeMessage } from '../scripts';
import {
  headerHtml,
  signatureHtml,
  footerHtml,
  generateCtaButtonHtml,
} from './components';

const html = `
  ${headerHtml}
    <h1 style="margin: 5px 0 7px">
      ${localizeMessage('verificationEmailMainHeading')}
    </h1>

    <p>${localizeMessage('verificationEmailExplanation')}</p>

    ${generateCtaButtonHtml('verificationEmailCTA')}

    <p>${localizeMessage('verificationEmailContactUs')}</p>

    ${signatureHtml}

    <p>${localizeMessage('contactIfNotRequested')}</p>
  ${footerHtml}
`;

export default html;
