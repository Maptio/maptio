import { Component, HostListener } from '@angular/core';
import { NgIf } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'maptio-onboarding-video',
  templateUrl: './onboarding-video.component.html',
  styleUrls: ['./onboarding-video.component.scss'],
  standalone: true,
  imports: [NgIf, DragDropModule],
})
export class OnboardingVideoComponent {
  isVisible = true;
  isDragging = false;
  isResizing = false;
  activeHandle: string | null = null;
  resizeStart = { x: 0, y: 0 };

  // Initial size with 16:9 aspect ratio
  initialSize = { width: 500, height: 281 };
  size = { ...this.initialSize };
  aspectRatio = this.initialSize.width / this.initialSize.height;

  // This is used to prevent the video from being clicked when dragging
  onDragStarted() {
    this.isDragging = true;
  }

  // Prevent the video from being clicked when dragging
  onVideoClick(event: MouseEvent): void {
    if (this.isDragging) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = false;
    }
  }

  onResizeStart(event: MouseEvent, handle: string) {
    event.preventDefault();
    event.stopPropagation();
    this.isResizing = true;
    this.activeHandle = handle;
    this.resizeStart = { x: event.clientX, y: event.clientY };
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing || !this.activeHandle) return;

    event.preventDefault();
    const deltaX = event.clientX - this.resizeStart.x;
    const deltaY = event.clientY - this.resizeStart.y;

    let newWidth = this.size.width;
    let newHeight = this.size.height;

    switch (this.activeHandle) {
      case 'e':
        newWidth = this.size.width + deltaX;
        newHeight = newWidth / this.aspectRatio;
        break;
      case 'w':
        newWidth = this.size.width - deltaX;
        newHeight = newWidth / this.aspectRatio;
        break;
      case 'n':
        newHeight = this.size.height - deltaY;
        newWidth = newHeight * this.aspectRatio;
        break;
      case 's':
        newHeight = this.size.height + deltaY;
        newWidth = newHeight * this.aspectRatio;
        break;
      case 'nw':
        newWidth = this.size.width - deltaX;
        newHeight = newWidth / this.aspectRatio;
        break;
      case 'ne':
        newWidth = this.size.width + deltaX;
        newHeight = newWidth / this.aspectRatio;
        break;
      case 'sw':
        newWidth = this.size.width - deltaX;
        newHeight = newWidth / this.aspectRatio;
        break;
      case 'se':
        newWidth = this.size.width + deltaX;
        newHeight = newWidth / this.aspectRatio;
        break;
    }

    // Enforce minimum size
    const minWidth = 300;
    const minHeight = minWidth / this.aspectRatio;

    if (newWidth >= minWidth && newHeight >= minHeight) {
      this.size = {
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      };
      this.resizeStart = { x: event.clientX, y: event.clientY };
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.isResizing) {
      this.isResizing = false;
      this.activeHandle = null;
    }
  }

  close(): void {
    this.isVisible = false;
  }
}
