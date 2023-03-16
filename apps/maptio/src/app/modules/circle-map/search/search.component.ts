import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { remove, flatten, filter } from 'lodash-es';

import { Helper, InitiativeNode } from '@maptio-circle-map/initiative.model';
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

    return this.findInitiatives(filterValue);
  }

  private findInitiatives(term: string): InitiativeNode[] {
    return this.initiatives.filter(
      (initiativeNode) =>
        initiativeNode.data.name?.toLowerCase().indexOf(term.toLowerCase()) >
          -1 ||
        (initiativeNode.data.description &&
          initiativeNode.data.description
            .toLowerCase()
            .indexOf(term.toLowerCase()) > -1) ||
        (initiativeNode.data.accountable &&
          initiativeNode.data.accountable.name
            .toLowerCase()
            .indexOf(term.toLowerCase()) > -1) ||
        (this.getAllParticipants(initiativeNode) &&
          this.getAllParticipants(initiativeNode)
            .map((h) => h.name)
            .join('')
            .toLowerCase()
            .indexOf(term.toLowerCase()) > -1) ||
        (this.getAllParticipants(initiativeNode) &&
          this.getAllParticipants(initiativeNode)
            .map((h) => (h.roles && h.roles[0] ? h.roles[0].description : ''))
            .join('')
            .toLowerCase()
            .indexOf(term.toLowerCase()) > -1)
    );
  }

  private getAllParticipants(initiativeNode: InitiativeNode): Helper[] {
    const initiative = initiativeNode.data;
    return remove(flatten([...[initiative.accountable], initiative.helpers]));
  }

  onSelect(circleSelectionEvent: MatAutocompleteSelectedEvent) {
    const circle: InitiativeNode = circleSelectionEvent.option.value;

    this.circleMapService.onHighlightInitiativeNode(circle);
  }
}
