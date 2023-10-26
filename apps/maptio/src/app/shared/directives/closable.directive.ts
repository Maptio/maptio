import {
  Directive,
  ElementRef,
  EventEmitter,
  Output,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[closable]',
  standalone: true,
})
export class ClosableDirective {
  @Output() close: EventEmitter<null> = new EventEmitter();

  constructor(closableElementRef: ElementRef, private renderer: Renderer2) {
    const closable = closableElementRef.nativeElement;
    renderer.addClass(closable, 'position-relative');
    renderer.addClass(closable, 'closable');

    const closingIcon = renderer.createElement('i');
    renderer.addClass(closingIcon, 'fas');
    renderer.addClass(closingIcon, 'fa-times');

    const closingSpan = renderer.createElement('button');
    renderer.addClass(closingSpan, 'position-absolute');
    renderer.addClass(closingSpan, 'text-muted');
    renderer.addClass(closingSpan, 'top-right');
    renderer.addClass(closingSpan, 'btn');
    renderer.addClass(closingSpan, 'bg-transparent');
    renderer.addClass(closingSpan, 'z-index-1');

    renderer.appendChild(closingSpan, closingIcon);

    renderer.listen(closingSpan, 'click', (event: any) => {
      this.close.emit();
    });

    renderer.listen('body', 'click', (event: Event) => {
      if (
        (<any>event)
          .composedPath()
          .filter(
            (p: Element) => p.classList && p.classList.contains('closable')
          ).length > 0
      ) {
        // the clicked element is inside a 'closable' element, do nothing
      } else {
        this.close.emit();
      }
    });

    renderer.appendChild(closable, closingSpan);
  }
}
