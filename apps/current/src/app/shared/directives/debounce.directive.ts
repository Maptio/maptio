import {EventEmitter, ElementRef, OnInit, Directive, Input, Output} from "@angular/core";
import {Observable} from "rxjs";
import {NgModel} from "@angular/forms";

@Directive({ selector: "[debounce]" })
export class DebounceDirective implements OnInit {
    @Input() delay: number = 750;
    @Output() func: EventEmitter<any> = new EventEmitter();

    constructor(private elementRef: ElementRef, private model: NgModel) {
    }

    ngOnInit(): void {
        const eventStream = Observable.fromEvent(this.elementRef.nativeElement, "keyup")
            .map(() => this.model.value)
            .debounceTime(this.delay)
            .distinctUntilChanged();

        eventStream.subscribe(input => this.func.emit(input));
    }

}