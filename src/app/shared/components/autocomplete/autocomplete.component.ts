import { Component, OnInit, Input, TemplateRef, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, SimpleChanges, HostListener, ViewEncapsulation } from '@angular/core';
import { Observable, merge, Subject } from 'rxjs';
import { NgbTypeaheadSelectItemEvent, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { map, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';


@Component({
    selector: 'common-autocomplete',
    templateUrl: './autocomplete.component.html',
    host: { "class": "w-100" }
    // styleUrls: ['./autocomplete.component.css']
})
export class CommonAutocompleteComponent implements OnInit {
    @Input("placeholder") placeholder: string;
    @Input("removeConfirmationMessage") removeConfirmationMessage: string;
    @Input("item") item: any;
    @Input("filter") filter: (text: string) => Array<any>;
    @Input("resultFormatter") resultFormatter: (item: any) => string;
    @Input("resultTemplate") resultTemplate: TemplateRef<any>;
    @Input("label") label: string;
    @Input("isUnauthorized") isUnauthorized: boolean;
    @Input("showSelectedResult") showSelectedResult:boolean;

    @Output("pick") pick: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild("inputAutocomplete") public inputAutocomplete: NgbTypeahead;

    cancelClicked: boolean;
    searching: boolean;
    searchFailed: boolean;
    click$ = new Subject<string>();
    focus$ = new Subject<string>();
    isShowAutocomplete: boolean;


    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit(): void { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.item && !changes.item.currentValue) {
            if (this.inputAutocomplete) this.inputAutocomplete.writeValue("");
        }
    }


    search = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.inputAutocomplete.isPopupOpen()));
        const inputFocus$ = this.focus$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => {
                return [null].concat(this.filter(typeof(this.item)==='object' ? '' : term).slice(0, 5));
            })
        );
    }

    onClick(text: string) {
        if(this.isUnauthorized) return;
        this.click$.next(text);
        this.isShowAutocomplete = true
        this.cd.markForCheck();
    }

    onFocus(text: string) {
        if(this.isUnauthorized) return;
        this.focus$.next(text);
        this.isShowAutocomplete = true
        this.cd.markForCheck();
    }

    onSelect(event: NgbTypeaheadSelectItemEvent) {
        event.preventDefault()
        this.pick.emit(event.item);
        this.isShowAutocomplete = false;
        this.cd.markForCheck();
        this.inputAutocomplete.writeValue("");
    }

    onRemove() {
        this.item = null;
        this.pick.emit(this.item);
        this.cd.markForCheck();
    }

    onFocusOut() {
        this.isShowAutocomplete = false;
        this.cd.markForCheck();
    }
}
