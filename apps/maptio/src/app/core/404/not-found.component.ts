import { Component, OnInit } from '@angular/core';
import { ErrorPageComponent } from '../error/error.page';

@Component({
    selector: 'not-found',
    templateUrl: './not-found.component.html',
    imports: [ErrorPageComponent]
})
export class NotFoundComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
