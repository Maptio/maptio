import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environment/environment';

@Component({
    selector: 'app-privacy',
    template: `<iframe src="${environment.PRIVACY_URL}" width="100%" height="100%" frameborder="0" ></iframe>`
})
export class PrivacyComponent{
    constructor() {
     }
}
