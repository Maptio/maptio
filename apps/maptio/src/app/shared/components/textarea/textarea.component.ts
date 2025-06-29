import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';

import { environment } from '@maptio-config/environment';
import { MarkdownModule } from 'ngx-markdown';
import { StickyPopoverDirective } from '../../directives/sticky.directive';
import { NgClass } from '@angular/common';

@Component({
  selector: 'common-textarea',
  templateUrl: './textarea.component.html',
  imports: [StickyPopoverDirective, MarkdownModule, NgClass],
})
export class CommonTextareaComponent implements OnInit, AfterViewInit {
  @Input('placeholder') placeholder: string;
  @Input('text') text: string;
  @Input('rows') rows: number;
  @Input('label') label = 'Edit';
  @Input('isUnauthorized') isUnauthorized: boolean;
  @Input('isHeader') isHeader: boolean;
  @Input('isEditMode') isEditMode: boolean;

  @Output('save') save: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('inputDescription') textareaElement: ElementRef;

  isTextEmpty = true;
  showUnauthorized: boolean;

  KB_URL_MARKDOWN = environment.KB_URL_MARKDOWN;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.text) {
      this.isTextEmpty =
        !changes.text.currentValue || changes.text.currentValue.trim() === '';
    }

    // If isEditMode is explicitly set to false, ensure we're not in edit mode
    if (changes.isEditMode && changes.isEditMode.currentValue === false) {
      this.isEditMode = false;
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

  activateEditing() {
    if (!this.isUnauthorized) {
      // Set edit mode
      this.isEditMode = true;
      this.cd.markForCheck();

      // Use setTimeout to ensure the DOM is updated before focusing
      setTimeout(() => {
        if (this.textareaElement?.nativeElement) {
          const element = this.textareaElement.nativeElement;
          element.focus();
          element.select();
        }
      });
    }
  }
}
