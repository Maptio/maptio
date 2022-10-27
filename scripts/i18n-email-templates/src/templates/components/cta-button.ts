import { localizeMessage } from '../../scripts';

export default function generateCtaButtonHtml(buttonTextKey) {
  return `
    <p>
      {% assign splitURL = url | split: '#' %}
      {% assign languageURL = splitURL[0] | append: '&ui_locales=' | append: request_language %}

      <a href="{{ languageURL }}" class="intercom-h2b-button">
        ${localizeMessage(buttonTextKey)}
      </a>
    </p>
  `;
}
