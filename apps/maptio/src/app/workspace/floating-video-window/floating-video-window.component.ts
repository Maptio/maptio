import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'maptio-floating-video-window',
  templateUrl: './floating-video-window.component.html',
  styleUrls: ['./floating-video-window.component.scss'],
  standalone: true,
  imports: [NgIf],
})
export class FloatingVideoWindowComponent implements OnInit {
  isVisible = true;
  width = 500;
  height = 316;
  size = { width: this.width, height: this.height };
  marginX = 60;
  marginY = 60;
  position = {
    x: this.marginX,
    y: window.innerHeight - this.height - this.marginY,
  };
  isDragging = false;
  dragOffset = { x: 0, y: 0 };
  isResizing = false;
  resizeStart = { x: 0, y: 0 };
  initialSize = { width: 0, height: 0 };

  constructor() {}

  ngOnInit(): void {}

  onMouseDown(event: MouseEvent): void {
    if (
      event.target instanceof HTMLElement &&
      event.target.classList.contains('resize-handle')
    ) {
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

  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.position = {
        x: event.clientX - this.dragOffset.x,
        y: event.clientY - this.dragOffset.y,
      };
    } else if (this.isResizing) {
      const deltaX = event.clientX - this.resizeStart.x;
      const deltaY = event.clientY - this.resizeStart.y;
      this.size = {
        width: Math.max(300, this.initialSize.width + deltaX),
        height: Math.max(200, this.initialSize.height + deltaY),
      };
    }
  }

  onMouseUp(): void {
    this.isDragging = false;
    this.isResizing = false;
  }

  close(): void {
    this.isVisible = false;
  }
}
