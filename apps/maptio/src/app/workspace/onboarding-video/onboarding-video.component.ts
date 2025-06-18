import { Component, HostListener } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'maptio-onboarding-video',
  templateUrl: './onboarding-video.component.html',
  styleUrls: ['./onboarding-video.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, DragDropModule],
})
export class OnboardingVideoComponent {
  isVisible = true;
  isDragging = false;
  isResizing = false;
  activeHandle: string | null = null;
  resizeStart = { x: 0, y: 0 };

  // Initial size and minimum size
  initialSize = { width: 500, height: 281 };
  aspectRatio = this.initialSize.width / this.initialSize.height;
  minWidth = 300;
  minHeight = this.minWidth / this.aspectRatio;
  size = { ...this.initialSize };
  position = { left: '16px', bottom: '16px' };

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
    let newLeft = this.getNumericValue(this.position.left);
    let newBottom = this.getNumericValue(this.position.bottom);

    switch (this.activeHandle) {
      case 'e':
        newWidth = this.size.width + deltaX;
        newHeight = newWidth / this.aspectRatio;
        break;
      case 'w':
        newWidth = this.size.width - deltaX;
        newHeight = newWidth / this.aspectRatio;
        if (newWidth >= this.minWidth) {
          newLeft += deltaX;
        }
        break;
      case 'n':
        newHeight = this.size.height - deltaY;
        newWidth = newHeight * this.aspectRatio;
        break;
      case 's':
        newHeight = this.size.height + deltaY;
        newWidth = newHeight * this.aspectRatio;
        if (newHeight >= this.minHeight) {
          newBottom -= deltaY;
        }
        break;
      case 'nw':
        newWidth = this.size.width - deltaX;
        newHeight = newWidth / this.aspectRatio;
        if (newWidth >= this.minWidth) {
          newLeft += deltaX;
        }
        break;
      case 'ne':
        if (Math.abs(deltaX) > Math.abs(deltaY) * this.aspectRatio) {
          newWidth = this.size.width + deltaX;
          newHeight = newWidth / this.aspectRatio;
        } else {
          newHeight = this.size.height - deltaY;
          newWidth = newHeight * this.aspectRatio;
        }
        break;
      case 'sw':
        newWidth = this.size.width - deltaX;
        newHeight = newWidth / this.aspectRatio;
        if (newWidth >= this.minWidth) {
          newLeft += deltaX;
        }
        break;
      case 'se':
        newWidth = this.size.width + deltaX;
        newHeight = newWidth / this.aspectRatio;
        if (newHeight >= this.minHeight) {
          newBottom -= deltaY;
        }
        break;
    }

    // Enforce minimum size
    if (newWidth >= this.minWidth && newHeight >= this.minHeight) {
      this.size = {
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      };
      this.position = {
        left: `${Math.round(newLeft)}px`,
        bottom: `${Math.round(newBottom)}px`,
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

  private getNumericValue(value: string): number {
    return parseFloat(value.replace('px', ''));
  }
}
