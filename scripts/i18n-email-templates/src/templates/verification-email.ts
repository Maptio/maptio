import { localizeMessage } from '../scripts';
import {
  headerHtml,
  signatureHtml,
  footerHtml,
  generateCtaButtonHtml,
} from './components';

const html = `
  ${headerHtml}
    <h1>${localizeMessage('verificationEmailMainHeading')}</h1>

    <p>${localizeMessage('verificationEmailExplanation')}</p>

    ${generateCtaButtonHtml('verificationEmailCTA')}

    <p>${localizeMessage('verificationEmailContactUs')}</p>

    ${signatureHtml}

    ${localizeMessage('contactIfNotRequested')}
  ${footerHtml}
`;

export default html;
