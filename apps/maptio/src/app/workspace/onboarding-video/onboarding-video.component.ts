import { Component, HostListener, HostBinding } from '@angular/core';
import { NgIf } from '@angular/common';
import { DragDropModule, CdkDragStart } from '@angular/cdk/drag-drop';

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

  // Resizing
  isResizing = false;
  resizeStart = { x: 0, y: 0 };
  initialSize = { width: 500, height: 316 }; // Hardcoded to match the video
  size = { ...this.initialSize };

  @HostBinding('style.userSelect')
  get userSelect(): string {
    return this.isResizing ? 'none' : '';
  }

  @HostBinding('class.resizing')
  get isResizingClass(): boolean {
    return this.isResizing;
  }

  // This is used below to prevent the video from being clicked when dragging
  onDragStarted() {
    this.isDragging = true;
  }

  // Prevent the video from being clicked when dragging
  onVideoClick(event: MouseEvent): void {
    if (this.isDragging) {
      event.preventDefault();
      event.stopPropagation();

      // Reset the dragging state now that we've captured the click generated
      // by dragging
      this.isDragging = false;
    }
  }

  onResizeStart(event: MouseEvent): void {
    if (
      event.target instanceof HTMLElement &&
      event.target.classList.contains('onboarding-video__resize-handle')
    ) {
      event.preventDefault();
      this.isResizing = true;
      this.resizeStart = { x: event.clientX, y: event.clientY };
      this.initialSize = { ...this.size };
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (this.isResizing) {
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
    if (this.isResizing) {
      this.isResizing = false;
    }
  }

  close(): void {
    this.isVisible = false;
  }
}
