import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { InitiativeNode } from '@maptio-circle-map/initiative.model';
import { CircleMapService } from '@maptio-circle-map/circle-map.service';

@Component({
  selector: 'maptio-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  @Input() rootCircle: InitiativeNode;

  initiatives: InitiativeNode[];

  inputField = new FormControl('');
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions$: Observable<InitiativeNode[]>;

  constructor(private circleMapService: CircleMapService) {}

  ngOnInit() {
    this.initiatives = this.flattenInitiatives(this.rootCircle);

    // Skip the root circle
    this.initiatives.shift();

    this.filteredOptions$ = this.inputField.valueChanges.pipe(
      startWith(''),

      // Change input field value if it's not a string
      map((value) => {
        if (typeof value !== 'string') {
          this.inputField.setValue('');
          return '';
        } else {
          return value;
        }
      }),

      map((value) => this.filterInitiatives(value || ''))
    );
  }

  private flattenInitiatives(rootCircle: InitiativeNode): InitiativeNode[] {
    const initiatives = [rootCircle];

    if (rootCircle.children) {
      rootCircle.children.forEach((child) => {
        initiatives.push(...this.flattenInitiatives(child));
      });
    }
    return initiatives;
  }

  private filterInitiatives(value: string): InitiativeNode[] {
    if (value === '') {
      // Simulate typeahead behavior
      return [];
    }

    // Skip filtering if value is not a string
    if (typeof value !== 'string') {
      console.error('The search value is not a string, aborting search');
      return [];
    }

    const filterValue = value.toLowerCase();

    return this.initiatives.filter((initiative) =>
      initiative.data.name.toLowerCase().includes(filterValue)
    );
  }

  onSelect(circleSelectionEvent: MatAutocompleteSelectedEvent) {
    const circle: InitiativeNode = circleSelectionEvent.option.value;

    this.circleMapService.onCircleClick(circle);
  }
}

