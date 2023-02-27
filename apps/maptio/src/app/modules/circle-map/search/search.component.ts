import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import {
  InitiativeNode,
  InitiativeViewModel,
} from '@maptio-circle-map/initiative.model';

@Component({
  selector: 'maptio-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  @Input() rootCircle: InitiativeNode;

  initiatives: InitiativeViewModel[];

  myControl = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;

  ngOnInit() {
    this.initiatives = this.flattenInitiatives(this.rootCircle);

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterInitiatives(value || ''))
    );
  }

  private flattenInitiatives(
    rootCircle: InitiativeNode
  ): InitiativeViewModel[] {
    // Not starting with the root circle itself as it's not really a circle on
    // the map
    const initiatives = [];

    if (rootCircle.children) {
      rootCircle.children.forEach((child) => {
        initiatives.push(...this.flattenInitiatives(child));
      });
    }
    return initiatives;
  }

  private filterInitiatives(value: string): string[] {
    if (value === '') {
      // Simulate typeahead behavior
      return this.initiatives.map((initiative) => initiative.name).slice(0, 5);
    }

    const filterValue = value.toLowerCase();

    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }
}
