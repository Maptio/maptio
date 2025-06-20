import { Component } from '@angular/core';
import { NgProgressModule } from 'ngx-progressbar';

@Component({
    selector: 'loader',
    templateUrl: './loader.component.html',
    styleUrls: ['loader.component.css'],
    imports: [NgProgressModule]
})
export class LoaderComponent {
  constructor() {}
}
