import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { FileUploader, FileSelectDirective , FileDropDirective} from 'ng2-file-upload';

// const URL = '/api/';
const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';


@Component({
    selector: 'import',
    templateUrl: 'import.component.html'
})
export class ImportComponent implements OnInit {

    @ViewChild('importModal')
    modal: ModalComponent;

    constructor() { }

    ngOnInit() { }

    open() {
        this.modal.open();
    }

    public uploader: FileUploader = new FileUploader({ url: URL });
    public hasBaseDropZoneOver: boolean = false;
    public hasAnotherDropZoneOver: boolean = false;

    public fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

    public fileOverAnother(e: any): void {
        this.hasAnotherDropZoneOver = e;
    }
}