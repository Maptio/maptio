import { localizeMessage } from '../scripts';
import {
  headerHtml,
  signatureHtml,
  footerHtml,
  generateCtaButtonHtml,
} from './components';

const html = `
  ${headerHtml}
    <p>${localizeMessage('changePasswordExplanation')}</p>

    <p>${localizeMessage('changePasswordIntro')}</p>

    ${generateCtaButtonHtml('changePasswordCTA')}

    <p>${localizeMessage('changePasswordOutro')}</p>

    ${signatureHtml}
  ${footerHtml}
`;

export default html;
