import { Component, OnInit, HostListener, HostBinding } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'maptio-onboarding-video',
  templateUrl: './onboarding-video.component.html',
  styleUrls: ['./onboarding-video.component.scss'],
  standalone: true,
  imports: [NgIf],
})
export class OnboardingVideoComponent implements OnInit {
  // Size hardcoded to match the video size
  size = { width: 500, height: 316 }; //px

  // Positionin in relation to the bottom left corner of the screen
  margin = 60; // px
  position = {
    x: this.margin,
    y: window.innerHeight - this.size.height - this.margin,
  };

  isVisible = true;

  // Dragging
  isDragging = false;
  dragOffset = { x: 0, y: 0 };

  // Resizing
  isResizing = false;
  resizeStart = { x: 0, y: 0 };
  initialSize = { width: 0, height: 0 };

  @HostBinding('style.userSelect')
  get userSelect(): string {
    return this.isDragging || this.isResizing ? 'none' : '';
  }

  @HostBinding('class.dragging')
  get isDraggingClass(): boolean {
    return this.isDragging;
  }

  @HostBinding('class.resizing')
  get isResizingClass(): boolean {
    return this.isResizing;
  }

  constructor() {}

  ngOnInit(): void {}

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      event.preventDefault();

      this.position = {
        x: event.clientX - this.dragOffset.x,
        y: event.clientY - this.dragOffset.y,
      };
    } else if (this.isResizing) {
      event.preventDefault();

      const deltaX = event.clientX - this.resizeStart.x;
      const deltaY = event.clientY - this.resizeStart.y;
      this.size = {
        width: Math.max(300, this.initialSize.width + deltaX),
        height: Math.max(200, this.initialSize.height + deltaY),
      };
    }
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp(): void {
    if (this.isDragging || this.isResizing) {
      this.isDragging = false;
      this.isResizing = false;
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (
      event.target instanceof HTMLElement &&
      event.target.classList.contains('onboarding-video__resize-handle')
    ) {
      event.preventDefault();
      this.isResizing = true;
      this.resizeStart = { x: event.clientX, y: event.clientY };
      this.initialSize = { ...this.size };
    } else {
      this.isDragging = true;
      this.dragOffset = {
        x: event.clientX - this.position.x,
        y: event.clientY - this.position.y,
      };
    }
  }

  close(): void {
    this.isVisible = false;
  }
}
