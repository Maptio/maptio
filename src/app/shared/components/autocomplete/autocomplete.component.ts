import { Component, OnInit, Input, TemplateRef, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { _do } from 'rxjs/operator/do';
import { switchMap } from 'rxjs/operator/switchMap';
import { distinctUntilChanged } from 'rxjs/operator/distinctUntilChanged';
import { debounceTime } from 'rxjs/operator/debounceTime';
import { _catch } from 'rxjs/operator/catch';
import { map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

@Component({
    selector: 'common-autocomplete',
    templateUrl: './autocomplete.component.html',
    host : {"class": "w-100"},
    // styleUrls: ['./autocomplete.component.css']
})
export class CommonAutocompleteComponent implements OnInit {
    @Input("placeholder") placeholder: string;
    @Input("removeConfirmationMessage") removeConfirmationMessage: string;
    @Input("item") item: any;
    @Input("filter") filter: (text: string) => Observable<any>;
    @Input("resultFormatter") resultFormatter: (item: any) => string;
    @Input("resultTemplate") resultTemplate: TemplateRef<any>;

    @Output("pick") pick: EventEmitter<any> = new EventEmitter<any>()


    @ViewChild("inputAutocomplete") public inputAutocomplete: ElementRef;

    cancelClicked: boolean;
    searching: boolean;
    searchFailed: boolean;

    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit(): void { }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.item && !changes.item.currentValue){
            (<HTMLInputElement>this.inputAutocomplete.nativeElement).value = "";
        }
    }

    search = (text$: Observable<string>) =>
        _do.call(
            switchMap.call(
                _do.call(
                    distinctUntilChanged.call(
                        debounceTime.call(text$, 300)),
                    () => this.searching = true),
                (term: string) =>
                    _catch.call(
                        _do.call(

                            this.filter(term)
                            , () => this.searchFailed = false),
                        () => {
                            this.searchFailed = true;
                            return Observable.of.call([]);
                        }
                    )
            ),
            () => this.searching = false);

    onSelect(selected: NgbTypeaheadSelectItemEvent) {
        this.item = selected.item;
        this.pick.emit(this.item);
        this.cd.markForCheck();
    }

    onBlur() {
        if (!this.item) {
            (<HTMLInputElement>this.inputAutocomplete.nativeElement).value = "";
        } else {
            (<HTMLInputElement>this.inputAutocomplete.nativeElement).value = this.resultFormatter(this.item)
        }
    }


    onRemove() {
        this.item = null;
        this.pick.emit(this.item);
        this.cd.markForCheck();
    }
}
