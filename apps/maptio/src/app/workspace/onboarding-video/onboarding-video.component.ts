import { Component, HostListener } from '@angular/core';
import { NgIf } from '@angular/common';
import { DragDropModule, CdkDragMove } from '@angular/cdk/drag-drop';

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

  onResizeHandleDragged(event: CdkDragMove, handle: string) {
    const delta = {
      x: event.distance.x,
      y: event.distance.y,
    };

    // Reset the drag position to prevent accumulation
    event.source.reset();

    let newWidth = this.size.width;
    let newHeight = this.size.height;

    switch (handle) {
      case 'e':
        newWidth = this.size.width + delta.x;
        newHeight = newWidth / this.aspectRatio;
        break;
      case 'w':
        newWidth = this.size.width - delta.x;
        newHeight = newWidth / this.aspectRatio;
        break;
      case 'n':
        newHeight = this.size.height - delta.y;
        newWidth = newHeight * this.aspectRatio;
        break;
      case 's':
        newHeight = this.size.height + delta.y;
        newWidth = newHeight * this.aspectRatio;
        break;
      case 'nw':
        newWidth = this.size.width - delta.x;
        newHeight = newWidth / this.aspectRatio;
        break;
      case 'ne':
        newWidth = this.size.width + delta.x;
        newHeight = newWidth / this.aspectRatio;
        break;
      case 'sw':
        newWidth = this.size.width - delta.x;
        newHeight = newWidth / this.aspectRatio;
        break;
      case 'se':
        newWidth = this.size.width + delta.x;
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
    }
  }

  close(): void {
    this.isVisible = false;
  }
}
