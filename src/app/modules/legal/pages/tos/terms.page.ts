import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../config/environment';

@Component({
    selector: 'app-terms',
    template: `<iframe src="${environment.TOS_URL}" width="100%" height="100%" frameborder="0" ></iframe>`
})
export class TermsComponent{
    constructor() {
        // window.location.href = environment.TOS_URL;
     }
}
