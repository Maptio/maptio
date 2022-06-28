import { fromEvent as observableFromEvent, Observable } from 'rxjs';

import { distinctUntilChanged, debounceTime, map } from 'rxjs/operators';
import {
  EventEmitter,
  ElementRef,
  OnInit,
  Directive,
  Input,
  Output,
} from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({ selector: '[debounce]' })
export class DebounceDirective implements OnInit {
  @Input() delay: number = 750;
  @Output() func: EventEmitter<any> = new EventEmitter();

  constructor(private elementRef: ElementRef, private model: NgModel) {}

  ngOnInit(): void {
    const eventStream = observableFromEvent(
      this.elementRef.nativeElement,
      'keyup'
    ).pipe(
      map(() => this.model.value),
      debounceTime(this.delay),
      distinctUntilChanged()
    );

    eventStream.subscribe((input) => this.func.emit(input));
  }
}
