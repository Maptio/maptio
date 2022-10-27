import { localizeMessage } from '../../scripts';

const html = `
                    ${localizeMessage('thanks')}

                    <br>

                    <strong>
                      ${localizeMessage('signatureTeam')}
                    </strong>

                    <br>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Footer -->
    <table width="100%" class="footer" align="middle">
      <tbody>
        <tr>
          <td>
            <table
              cellspacing="0"
              border="0"
              cellpadding="0"
              align="center"
              width="600"
              bgcolor="transparent"
              class="footer-main"
            >
              <tbody>
                <tr>
                  <td class="footer-td">
`;

export default html;
