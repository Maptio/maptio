import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';

import { environment } from '@maptio-config/environment';
import { MarkdownModule } from 'ngx-markdown';
import { StickyPopoverDirective } from '../../directives/sticky.directive';
import { NgIf, NgClass } from '@angular/common';

@Component({
    selector: 'common-textarea',
    templateUrl: './textarea.component.html',
    standalone: true,
    imports: [NgIf, StickyPopoverDirective, MarkdownModule, NgClass]
})
export class CommonTextareaComponent implements OnInit {
  @Input('placeholder') placeholder: string;
  @Input('text') text: string;
  @Input('rows') rows: number;
  @Input('label') label = 'Edit';
  @Input('isUnauthorized') isUnauthorized: boolean;
  @Input('isHeader') isHeader: boolean;

  @Output('save') save: EventEmitter<string> = new EventEmitter<string>();

  isEditMode: boolean;
  isTextEmpty = true;
  showUnauthorized: boolean;

  KB_URL_MARKDOWN = environment.KB_URL_MARKDOWN;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.text) {
      this.isTextEmpty =
        !changes.text.currentValue || changes.text.currentValue.trim() === '';
    }
  }

  onChange(text: string) {
    this.text = text;
    this.save.emit(text);
    this.cd.markForCheck();
  }

  onClick(event: Event) {
    const eventTarget = event.target as HTMLElement;
    const isLink = eventTarget.nodeName === 'A';

    if (!isLink && !this.isUnauthorized) {
      this.isEditMode = true;
      this.cd.markForCheck();
    }
  }
}
