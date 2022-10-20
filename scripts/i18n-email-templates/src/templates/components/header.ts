const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
  <head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <meta name="viewport" content="width=device-width" />
    <meta name="format-detection" content="telephone=no" />

    <!-- Resets -->

    <style type="text/css" data-premailer="ignore">
      #outlook a {
        padding: 0;
      }
      body {
        -webkit-text-size-adjust: none;
        -ms-text-size-adjust: none;
        font-weight: 400;
        margin: 0;
        padding: 0;
      }
      .ReadMsgBody {
        width: 100%;
      }
      .ExternalClass {
        width: 100%;
      }
      img {
        border: 0;
        max-width: 100%;
        height: auto;
        outline: none;
        display: inline-block;
        margin: 0;
        padding: 0;
        text-decoration: none;
        line-height: 100%;
      }
      #backgroundTable {
        height: 100% !important;
        margin: 0;
        padding: 0;
        width: 100% !important;
      }
    </style>

    <!-- Main styles -->

    <style type="text/css">
      /**
   * Generic
   */

      body {
        background-color: #f9f9f9;
      }

      body .main {
        background-color: white;
      }

      .main {
        font-family: Helvetica, Arial, sans-serif;
        letter-spacing: 0;
      }

      .main .main-td {
        padding: 40px 60px;
        border: 1px solid #dddddd;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        border-radius: 2px;
      }

      table {
        border-spacing: 0;
        border-collapse: separate;
        table-layout: fixed;
      }

      td {
        font-size: 16px;
        padding: 0;
        font-family: Helvetica, Arial, sans-serif;
      }

      a {
        border: none;
        outline: none !important;
      }

      /**
   * Header
   */

      .header td img {
        padding: 15px 0 30px;
        text-align: left;
      }

      .header .logo {
        text-align: center;
      }

      /**
   * Content
   */

      .content-td {
        font-size: 18px;
        line-height: 27px;
        padding: 0;
        color: #525252;
      }

      .content-td > :first-child {
        margin-top: 0;
      }

      .content-td h1 {
        font-size: 26px;
        line-height: 33px;
        color: #282f33;
        margin-bottom: 7px;
        margin-top: 30px;
        font-weight: normal;
      }

      .content-td h2 {
        font-size: 18px;
        font-weight: bold;
        color: #282f33;
        margin-top: 30px;
        margin-bottom: 7px;
      }

      .content-td h1 + h2 {
        margin-top: 0px !important;
      }

      .content-td h2 + h1 {
        margin-top: 0px !important;
      }

      .content-td h3,
      .content-td h4,
      .content-td h5 {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .content-td p {
        margin: 0 0 17px 0;
        line-height: 1.5;
      }

      .content-td p img,
      .content-td h1 img,
      .content-td h2 img,
      .content-td li img,
      .content-td .intercom-h2b-button img {
        margin: 0;
        padding: 0;
      }

      .content-td p.intro {
        font-size: 20px;
        line-height: 30px;
      }

      .content-td blockquote {
        margin: 40px 0;
        font-style: italic;
        color: #8c8c8c;
        font-size: 18px;
        text-align: center;
        padding: 0 30px;
        font-family: Georgia, sans-serif;
        quotes: none;
      }

      .content-td blockquote a {
        color: #8c8c8c;
      }

      .content-td ul {
        list-style: disc;
        margin: 0 0 20px 40px;
        padding: 0;
      }

      .content-td ol {
        list-style: decimal;
        margin: 0 0 20px 40px;
        padding: 0;
      }

      .content-td img {
        max-width: 100%;
        margin: 0;
      }

      .content-td .intercom-container {
        margin-bottom: 16px;
      }

      .content-td div.intercom-container {
        margin-bottom: 17px;
        margin-top: 17px;
        line-height: 0;
      }

      .content-td table.intercom-responsive-layout-table div.intercom-container,
      .content-td
        table.intercom-responsive-layout-table
        div.embercom-prosemirror-composer-block-container {
        margin-top: 0;
      }

      .content-td hr {
        border: none;
        border-top: 1px solid #ddd;
        margin: 50px 30% 50px 30%;
      }

      .content-td table {
        border-collapse: collapse;
        border-spacing: 0;
        margin-bottom: 20px;
      }

      .content-td td,
      .content-td th {
        padding: 5px 7px;
        border: 1px solid #dadada;
        text-align: left;
        vertical-align: top;
      }

      .content-td th {
        font-weight: bold;
        background: #f6f6f6;
      }

      .content-td a {
        color: #1251ba;
      }

      .content td.content-td table.intercom-container {
        margin: 17px 0;
      }
      .content td.content-td table.intercom-container.intercom-align-center {
        margin-left: auto;
        margin-right: auto;
      }

      .content td.content-td table.intercom-container td {
        background-color: #3177a5;
        padding: 12px 35px;
        border-radius: 3px;
        font-family: Helvetica, Arial, sans-serif;
        margin: 0;
        border: none;
      }

      .content td.content-td table.intercom-container .intercom-h2b-button {
        display: inline-block;
        color: white;
        font-weight: bold;
        font-size: 18px;
        text-decoration: none;
        background-color: #303db4;
        border: none !important;
        border-radius: 3px;
      }

      .content-td table.intercom-responsive-layout-table {
        padding: 0;
        width: 100%;
        position: relative;
        display: table;
        table-layout: fixed;
        border-spacing: 0;
        border-collapse: collapse;
        border: none;
      }

      .content-td table.intercom-responsive-layout-table td {
        word-wrap: break-word;

        -moz-hyphens: auto;
        hyphens: auto;
        border-spacing: 0;
        border-collapse: collapse;
        border: none;
        color: #525252;
        font-size: 15px;
        vertical-align: top;
        text-align: left;
      }

      .content-td table.intercom-responsive-layout-table td.columns {
        margin: 0 auto;
        padding-left: 16px;
        padding-bottom: 16px;
        min-width: none !important;
      }

      /**/
      .content-td pre {
        margin: 0 0 10px;
        padding: 10px;
        background-color: #f5f5f5;
        overflow: auto;
      }

      .content-td pre code {
        font-family: Courier, monospace;
        font-size: 14px;
        line-height: 1.4;
        white-space: nowrap;
      }

      .footer-main {
        font-family: Helvetica, Arial, sans-serif;
        letter-spacing: 0;
      }

      .footer-td {
        text-align: center;
        padding: 21px 30px 15px;
      }

      .footer-td p,
      .footer-td a {
        font-size: 12px;
        color: #b7b7b7;
        text-decoration: none;
        font-weight: 300;
      }

      .footer-td p {
        margin: 0 0 6px 0;
      }

      .footer-td p.address {
        margin-top: 9px;
        line-height: 1.5em;
      }

      .footer-td p.powered-by {
        margin-top: 18px;
      }

      .footer-td p.unsub {
        margin: 0;
      }

      .footer .unsub a {
        text-decoration: underline;
        display: block;
        margin: 12px 0 0;
      }

      p.unsub a {
        text-decoration: underline;
      }

      .footer-td p.powered-by a {
        font-weight: bold;
      }

      .footer-td textarea {
        text-decoration: none;
        font-size: 12px;
        color: #b7b7b7;
        font-family: Helvetica, Arial, sans-serif;
        padding: 9px 0;
        font-weight: 300;
        line-height: normal;
      }

      a.intercom-h2b-button {
        background-color: #303db4;
        font-size: 18px;
        color: #fff;
        font-weight: bold;
        border-radius: 3px;
        display: inline-block;
        text-decoration: none;

        padding: 13px 35px;
      }

      table.intercom-container td > a.intercom-h2b-button {
        padding: 0px;
      }

      /**
   * Overrides
   */

      table.intercom-embedded-survey td {
        border: 0;
      }
    </style>

    <!-- Responsive-->
    <style type="text/css" data-premailer="ignore">
      @media screen and (max-width: 595px) {
        body {
          padding: 10px !important;
        }
        .main {
          width: 100% !important;
        }
        .main .main-td {
          padding: 20px !important;
        }
        .header td {
          text-align: center;
        }
        .footer-main {
          width: 100% !important;
        }
      }

      .content-td blockquote + * {
        margin-top: 20px !important;
      }

      .ExternalClass .content-td h1 {
        padding: 20px 0 !important;
      }

      .ExternalClass .content-td h2 {
        padding: 0 0 5px !important;
      }

      .ExternalClass .content-td p {
        padding: 10px 0 !important;
      }

      .ExternalClass .content-td .intercom-container {
        padding: 5px 0 !important;
      }

      .ExternalClass .content-td hr + * {
        padding-top: 30px !important;
      }

      .ExternalClass .content-td ol,
      .ExternalClass .content-td ul {
        padding: 0 0 20px 40px !important;
        margin: 0 !important;
      }

      .ExternalClass .content-td ol li,
      .ExternalClass .content-td ul li {
        padding: 3px 0 !important;
        margin: 0 !important;
      }

      .ExternalClass table .footer-td p {
        padding: 0 0 6px 0 !important;
        margin: 0 !important;
      }

      .ExternalClass table .footer-td p.powered-by,
      .ExternalClass table .footer-td p.unsub {
        padding-top: 15px;
      }
    </style>

    <!-- Outlook fix -->

    <!--[if gte mso 9]>
      <style type="text/css">
        table {
          border-collapse: collapse !important;
        }
        td {
          border-collapse: collapse !important;
        }
      </style>
    <![endif]-->

    <style type="text/css">
      .intercom-align-right {
        text-align: right !important;
      }
      .intercom-align-center {
        text-align: center !important;
      }
      .intercom-align-left {
        text-align: left !important;
      }
      /* Over-ride for RTL */
      .right-to-left .intercom-align-right {
        text-align: left !important;
      }
      .right-to-left .intercom-align-left {
        text-align: right !important;
      }
      .right-to-left .intercom-align-left {
        text-align: right !important;
      }
      .right-to-left li {
        text-align: right !important;
        direction: rtl;
      }
      .right-to-left .intercom-align-left img,
      .right-to-left .intercom-align-left .intercom-h2b-button {
        margin-left: 0 !important;
      }
      .intercom-attachment,
      .intercom-attachments,
      .intercom-attachments td,
      .intercom-attachments th,
      .intercom-attachments tr,
      .intercom-attachments tbody,
      .intercom-attachments .icon,
      .intercom-attachments .icon img {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .intercom-attachments {
        margin: 10px 0 !important;
      }
      .intercom-attachments .icon,
      .intercom-attachments .icon img {
        width: 16px !important;
        height: 16px !important;
      }
      .intercom-attachments .icon {
        padding-right: 5px !important;
      }
      .intercom-attachment {
        display: inline-block !important;
        margin-bottom: 5px !important;
      }

      .intercom-interblocks-content-card {
        width: 334px !important;
        max-height: 136px !important;
        max-width: 100% !important;
        overflow: hidden !important;
        border-radius: 20px !important;
        font-size: 16px !important;
        border: 1px solid #e0e0e0 !important;
      }

      .intercom-interblocks-link,
      .intercom-interblocks-article-card {
        text-decoration: none !important;
      }

      .intercom-interblocks-article-icon {
        width: 22.5% !important;
        height: 136px !important;
        float: left !important;
        background-color: #fafafa !important;
        background-image: url('https://maptio-e24fac79c150.intercom-mail.com/assets/article_book-1a595be287f73c0d02f548f513bfc831.png') !important;
        background-repeat: no-repeat !important;
        background-size: 32px !important;
        background-position: center !important;
      }

      .intercom-interblocks-article-text {
        width: 77.5% !important;
        float: right !important;
        background-color: #fff !important;
      }

      .intercom-interblocks-link-title,
      .intercom-interblocks-article-title {
        color: #519dd4 !important;
        font-size: 15px !important;
        margin: 16px 18px 12px !important;
        line-height: 1.3em !important;
        overflow: hidden !important;
      }

      .intercom-interblocks-link-description,
      .intercom-interblocks-article-body {
        margin: 0 18px 12px !important;
        font-size: 14px !important;
        color: #65757c !important;
        line-height: 1.3em !important;
      }

      .intercom-interblocks-link-author,
      .intercom-interblocks-article-author {
        margin: 10px 15px !important;
        height: 24px !important;
        line-height: normal !important;
      }

      .intercom-interblocks-link-author-avatar,
      .intercom-interblocks-article-author-avatar {
        width: 16px !important;
        height: 16px !important;
        display: inline-block !important;
        vertical-align: middle !important;
        float: left;
        margin-right: 5px;
      }

      .intercom-interblocks-link-author-avatar-image,
      .intercom-interblocks-article-author-avatar-image {
        width: 16px !important;
        height: 16px !important;
        border-radius: 50% !important;
        margin: 0 !important;
        vertical-align: top !important;
        font-size: 12px !important;
      }

      .intercom-interblocks-link-author-name,
      .intercom-interblocks-article-author-name {
        color: #74848b !important;
        margin: 0 0 0 5px !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        overflow: hidden !important;
      }

      .intercom-interblocks-article-written-by {
        color: #8897a4 !important;
        margin: 1px 0 0 5px !important;
        font-size: 12px !important;
        overflow: hidden !important;
        vertical-align: middle !important;
        float: left !important;
      }
    </style>
  </head>

  <body style="margin: 0px; padding: 20px; background-color: #f9f9f9" class="intercom-template-body">
    <table
      cellspacing="0"
      border="0"
      cellpadding="0"
      align="center"
      width="595"
      class="main company"
      style="background-color: white"
    >
      <tbody>
        <tr>
          <td class="main-td intercom-template-content">
            <!-- Header -->

            <table width="100%" class="header">
              <tbody>
                <tr>
                  <td class="logo">
                    <img
                      src="https://maptio-e24fac79c150.intercom-mail.com/i/o/517956271/dfa86b7d1a1685df8ccaf5b1/MAPTIO+Color+PNG.png"
                      width="137"
                      height=""
                      class="featured"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Main content -->
            <table width="100%" class="content">
              <tbody>
                <tr>
                  <td class="content-td">
`;

export default html;
