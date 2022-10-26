import { localizeMessage } from '../scripts';
import {
  headerHtml,
  signatureHtml,
  footerHtml,
  generateCtaButtonHtml,
} from './components';

const html = `
  ${headerHtml}
    <h1>${localizeMessage('changePasswordMainHeading')}</h1>

    <p>${localizeMessage('changePasswordExplanation')}</p>

    <p>${localizeMessage('changePasswordIntro')}</p>

    ${generateCtaButtonHtml('changePasswordCTA')}

    <p>${localizeMessage('changePasswordOutro')}</p>

    ${signatureHtml}

    ${localizeMessage('contactIfNotRequested')}
  ${footerHtml}
`;

export default html;
