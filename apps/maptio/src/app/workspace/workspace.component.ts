import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DatasetService } from '../dataset.service';


@Component({
  selector: 'maptio-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {
  datasetId: string | null = null;
  dataset: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private datasetService: DatasetService,
  ) {}

  ngOnInit(): void {
    this.getDataset();
  }

  getDataset(): void {
    this.datasetId = this.route.snapshot.paramMap.get('id');
    this.datasetService.getDataset(this.datasetId)
      .subscribe((dataset: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        this.dataset = dataset;
        if (this.dataset === null) {
          this.isLoading = false;
        }
      });
  }

}
