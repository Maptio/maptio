import { Component, OnInit, Input, TemplateRef, Output , EventEmitter, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'common-autocomplete',
    templateUrl: './autocomplete.component.html',
    // styleUrls: ['./autocomplete.component.css']
})
export class CommonAutocompleteComponent implements OnInit {
    @Input("placeholder") placeholder:string;
    @Input("removeConfirmationMessage") removeConfirmationMessage:string;
    @Input("item") item:any;
    @Input("search") search : (text$: Observable<string>) => Observable<string>;
    @Input("resultFormatter") resultFormatter : (item: any) => string;
    @Input("resultTemplate") resultTemplate : TemplateRef<any>;

    @Output("select") select:EventEmitter<any> = new EventEmitter<any>()


    @ViewChild("inputAutocomplete") public inputAutocomplete: ElementRef;
    
    cancelClicked:boolean;

    constructor(private cd:ChangeDetectorRef) { }

    ngOnInit(): void { }

    onSelect(selected: NgbTypeaheadSelectItemEvent){
        this.item = selected.item;
        this.select.emit(this.item);
        this.cd.markForCheck();
    }

    onBlur(){
        if(!this.item){
            (<HTMLInputElement>this.inputAutocomplete.nativeElement).value ="";
        }else{
            (<HTMLInputElement>this.inputAutocomplete.nativeElement).value = this.resultFormatter(this.item)
        }
    }


    onRemove() {
        this.item = null;
        this.select.emit(this.item);
        this.cd.markForCheck();
    }
}
