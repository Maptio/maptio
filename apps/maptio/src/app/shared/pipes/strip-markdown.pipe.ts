import { Pipe, PipeTransform } from '@angular/core';
import { MarkdownUtilsService } from '../services/markdown/markdown-utils.service';

@Pipe({
  name: 'stripMarkdown',
})
export class StripMarkdownPipe implements PipeTransform {
  constructor(private markdownUtilsService: MarkdownUtilsService) {}

  transform(text: string) {
    return this.markdownUtilsService.convertToPlainText(text);
  }
}
