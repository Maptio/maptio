# auth0-i18n-liquid-template-generator

## Acknowledgements

This code is adapted from:

https://github.com/pazel-io/auth0-i18n-liquid-template-generator

## Introduction

This is a tool to generate the HTML/Liquid templates for the Auth0 Email Templates so we can easily translate for different languages.

There is a blog post which describes this solution in more details:

https://pazel.dev/use-json-to-localizetranslate-auth0-email-templates-based-on-user-language

## How to use

1. Clone this repo
2. Run `npm run i18n-email-templates:build` to compile the TypeScript code
3. Run `npm run i18n-email-templates:generate` to generate the Liquid templates
4. Running `npm run gi18n-email-templates:enerate` will create a folder called `output` at `scripts/i18n-email-templates/`. This folder contains the generated HTML/Liquid templates. Each template will be localized based on the language json files in the `scripts/i18n-email-templates/src/languages` folder.
5. Find the template you want to translate and copy the HTML/Liquid code. You can then paste it into the Auth0 Email Templates editor.

## How to add a new Template

1. Create a new file in the `src/templates` folder. The file name should be the same as the template name in Auth0 for easy reference.
   For example, if you want to create a template for the `verification-email` template, you should create a file named `verification-email.ts` in the `src/templates` folder.

2. You also need to add the template name to the `src/templates/index.ts` file. This is to make sure the template is included in the build process.

3. Localize the template using the `localizeMessage` function. You can import the function like this:

```typescript
import { localizeMessage } from '../scripts';
```

4. `localizeMessage` takes a `messageKey`. This is the key used to define a message in language json files. For example, calling `localizeMessage("welcome")` will return all the if statements for the `welcome` message in all the supported languages. The result looks something like this:

```html
{% if user.user_metadata.lang == 'en' %} Hello {{application.user}} Welcome to
the site {% elsif user.user_metadata.lang == 'fr' %} Bonjour
{{application.user}} Bienvenue sur le site {% elsif user.user_metadata.lang ==
'jp' %} こんにちは{{application.user}}さん。サイトへようこそ。 {% else %} Hello
{{application.user}} Welcome to the site {% endif %}
```

## How to add a new language

Each language is defined in the `src/languages` folder.
To add a new language, create a new file in that folder with the language code and the extension `.json`.

For example, to add the language `fr`, create a file called `fr.json` in the `src/languages` folder.

This json file is a map of message keys to the translated message. For example, the `fr.json` file might look like this:

```json
{
  "welcome": "Bonjour {{application.user}} Bienvenue sur le site",
  "thankYou": "Merci de vous être inscrit. Veuillez vérifier votre adresse e-mail en cliquant sur le lien suivant:",
  "confirm": "Confirmer mon compte",
  "needHelp": "Si vous rencontrez des problèmes avec votre compte, n'hésitez pas à nous contacter en répondant à ce mail.",
  "regards": "Cordialement",
  "footer": "Si vous n'avez pas fait cette demande, veuillez nous contacter en répondant à ce mail."
}
```

For this to work properly, the message keys should be the same as the message keys in the `en.json` file.

You also need to add the language code to the `src/languages/index.ts` file. This is to make sure the language code is included in the build.
