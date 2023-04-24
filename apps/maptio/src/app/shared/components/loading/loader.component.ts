import { Component } from '@angular/core';
import { NgProgressModule } from '@ngx-progressbar/core';

@Component({
    selector: 'loader',
    templateUrl: './loader.component.html',
    styleUrls: ['loader.component.css'],
    standalone: true,
    imports: [NgProgressModule]
})
export class LoaderComponent {
  constructor() {}
}
