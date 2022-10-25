import { localizeMessage } from '../../scripts';

const html = `
  ${localizeMessage('thanks')}

  <br>

  <strong>
    ${localizeMessage('signatureTeam')}
  </strong>

  <br>

  <hr style="border: 2px solid #EAEEF3; border-bottom: 0; margin: 20px 0;">

  <p style="text-align: center;color: #A9B3BC;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%; font-size: 16px;">
`;

export default html;