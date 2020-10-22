import { Pipe, PipeTransform } from "@angular/core";
import { MarkdownService } from "ngx-markdown";

@Pipe({
  name: "stripMarkdown"
})
export class StripMarkdownPipe implements PipeTransform {

  constructor(private markdownService: MarkdownService) { }

  transform(text: string) {
    const textAsMarkdown = this.markdownService.compile(text);
    const textAsPlainText = textAsMarkdown.replace(/<(?:.|\n)*?>/gm, " ");
    return textAsPlainText;
  }

}
