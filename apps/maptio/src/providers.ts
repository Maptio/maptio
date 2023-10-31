import { Injectable } from '@angular/core';
import {
  HAMMER_GESTURE_CONFIG,
  HammerGestureConfig,
} from '@angular/platform-browser';

import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';

import { environment } from '@maptio-environment';

// TODO: Consider moving to individual files in a providers/ folder?

export const authConfig = {
  ...environment.auth,
  httpInterceptor: {
    allowedList: [
      {
        uri: `/api/v1/embeddable-dataset/*`,
        allowAnonymous: true,
      },
      {
        uri: `/api/*`,
        tokenOptions: {
          audience: environment.auth.audience,
          scope: 'api',
        },
      },
    ],
  },
};

// Override default Hammer.js configuration for SVG zoom and pan gesture support
@Injectable()
class CustomHammerConfig extends HammerGestureConfig {
  overrides = {
    pan: {
      direction: Hammer.DIRECTION_ALL, // Enable vertical panning too
      threshold: 0, // Make the smallest movements trigger panning
    },
  };
}

export const hammerProvider = {
  provide: HAMMER_GESTURE_CONFIG,
  useClass: CustomHammerConfig,
};

function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.link = (href: string, title: string, text: string) => {
    let linkHtml = `<a href=${href} class="markdown-link" target="_blank"`;

    if (title) {
      linkHtml += ` title="${title}"`;
    }

    linkHtml += `>${text}</a>`;

    return linkHtml;
  };

  renderer.paragraph = (text: string) => {
    return `<p class="markdown">${text}</p>`;
  };

  renderer.listitem = (text: string) => {
    return text.includes('type="checkbox"')
      ? `<li class="task-list-item">${text}</li>`
      : `<li>${text}</li>`;
  };

  return {
    renderer: renderer,
    breaks: true,
    smartLists: true,
  };
}

export const markedConfig = {
  markedOptions: {
    provide: MarkedOptions,
    useFactory: markedOptionsFactory,
  },
};
