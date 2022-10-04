const fs = require('fs');

const messagesFile = './apps/maptio/src/locale/messages.xlf';

const messagesContent = fs.readFileSync(messagesFile, 'utf8');

fs.writeFileSync(
  messagesFile,
  messagesContent
    .replaceAll(/\s<\/source>/g, '</source>')
    .replaceAll(/<source>\s/g, '<source>')
);
