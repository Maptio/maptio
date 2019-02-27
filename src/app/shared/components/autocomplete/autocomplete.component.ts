import { Component, OnInit, Input, TemplateRef, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, SimpleChanges, HostListener } from '@angular/core';
import { Observable, merge, Subject } from 'rxjs';
import { NgbTypeaheadSelectItemEvent, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { map, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';


@Component({
    selector: 'common-autocomplete',
    templateUrl: './autocomplete.component.html',
    host: { "class": "w-100" },
    // styleUrls: ['./autocomplete.component.css']
})
export class CommonAutocompleteComponent implements OnInit {
    @Input("placeholder") placeholder: string;
    @Input("removeConfirmationMessage") removeConfirmationMessage: string;
    @Input("item") item: any;
    @Input("filter") filter: (text: string) => Array<any>;
    @Input("resultFormatter") resultFormatter: (item: any) => string;
    @Input("resultTemplate") resultTemplate: TemplateRef<any>;

    @Output("pick") pick: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild("inputAutocomplete") public inputAutocomplete: NgbTypeahead;

    cancelClicked: boolean;
    searching: boolean;
    searchFailed: boolean;
    click$ = new Subject<string>();
    focus$ = new Subject<string>();


    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit(): void { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.item && !changes.item.currentValue) {
            this.inputAutocomplete.writeValue("");
        }
    }


    search = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.inputAutocomplete.isPopupOpen()));
        const inputFocus$ = this.focus$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => this.filter(term))
        );
    }

    onSelect(selected: NgbTypeaheadSelectItemEvent) {
        this.item = selected.item;
        this.pick.emit(this.item);
        this.cd.markForCheck();
    }
    
    onRemove() {
        this.item = null;
        this.pick.emit(this.item);
        this.cd.markForCheck();
    }
}
