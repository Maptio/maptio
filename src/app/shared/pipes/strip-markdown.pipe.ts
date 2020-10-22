import { Pipe, PipeTransform } from "@angular/core";
import { MarkdownService } from "ngx-markdown";

@Pipe({
  name: "stripMarkdown"
})
export class StripMarkdownPipe implements PipeTransform {

  constructor(private markdownService: MarkdownService) { }

  transform(text: string) {
    // Convert to HTML
    const textAsHTML = this.markdownService.compile(text);

    // Convert to plaintext
    const tempElement = document.createElement("div");
    tempElement.innerHTML = textAsHTML;
    const textAsPlainText = tempElement.innerText;

    return textAsPlainText;
  }

}
