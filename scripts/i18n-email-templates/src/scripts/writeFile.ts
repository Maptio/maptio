import * as fs from 'fs-extra';

export const writeFile = (name: string, content: string): void => {
  try {
    fs.mkdirSync('./scripts/i18n-email-templates/output', { recursive: true });
    fs.writeFileSync(
      `scripts/i18n-email-templates/output/${name}.html`,
      content,
      {
        encoding: 'utf8',
      }
    );
  } catch (err) {
    console.error(err);
  }
};
