import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'common-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class CommonModalComponent implements OnInit {
  constructor() {}

  @Input('nextActionName') nextActionName: string;
  @Input('previousActionName') previousActionName: string;
  @Input('isSkippable') isSkippable: boolean;
  @Input('isReady') isReady: boolean;
  @Input('isClosable') isClosable: boolean;
  @Input('isWithProgress') isWithProgress: boolean;
  @Input() isUpdating = false;
  @Input('progress') progress: string;
  @Input('progressLabel') progressLabel: string;

  @Output('next') next: EventEmitter<any> = new EventEmitter<any>();
  @Output('previous') previous: EventEmitter<any> = new EventEmitter<any>();
  @Output('close') close: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit(): void {}

  nextStep() {
    this.next.emit();
  }

  previousStep() {
    this.previous.emit();
  }

  closeModal() {
    this.close.emit();
  }
}
