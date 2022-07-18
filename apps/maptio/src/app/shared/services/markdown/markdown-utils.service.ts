import { Injectable } from '@angular/core';
import { MarkdownService } from 'ngx-markdown';

@Injectable()
export class MarkdownUtilsService {
  constructor(private markdownService: MarkdownService) {}

  convertToPlainText(markdownText: string): string {
    // Convert to HTML
    const textAsHTML = this.markdownService.compile(markdownText);

    // Convert to plain text
    const tempElement = document.createElement('div');
    tempElement.innerHTML = textAsHTML;
    const textAsPlainText = tempElement.innerText;

    return textAsPlainText;
  }
}
