import {
  Component,
  HostListener,
  inject,
  ViewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '@maptio-shared/model/user.data';
import { UserService } from '@maptio-shared/services/user/user.service';
import { PermissionsService } from '@maptio-shared/services/permissions/permissions.service';

@Component({
  selector: 'maptio-onboarding-video',
  templateUrl: './onboarding-video.component.html',
  styleUrls: ['./onboarding-video.component.scss'],
  imports: [DragDropModule, AsyncPipe],
})
export class OnboardingVideoComponent {
  userService = inject(UserService);
  permissionsService = inject(PermissionsService);

  @ViewChild('onboardingVideo', { static: false })
  videoRef?: ElementRef<HTMLVideoElement>;

  isDragging = false;
  isResizing = false;
  activeHandle: string | null = null;
  resizeStart = { x: 0, y: 0 };

  // Initial size based on the video dimensions
  initialSize = { width: 533, height: 270 };
  aspectRatio = this.initialSize.width / this.initialSize.height;
  minWidth = 300;
  minHeight = this.minWidth / this.aspectRatio;
  size = { ...this.initialSize };
  // Chosen to match default position of the intercom chat on the other side
  // of the screen
  position = { left: '20px', bottom: '20px' };

  showCover = signal(true);

  private hideMessageManually$ = new BehaviorSubject<boolean>(false);

  // Show message only if user has not already dismissed it and only if they
  // are an admin
  messageKey = 'showOnboardingVideo';
  helpPageUrl = '';
  user?: User;
  showMessage$ = combineLatest([
    this.hideMessageManually$,
    this.permissionsService.canSeeOnboardingMessages$,
    this.userService.user$,
  ]).pipe(
    map(([hideMessageManually, canSeeOnboardingMessages, user]) => {
      this.user = user;

      console.log(this.user.onboardingProgress);

      if (
        !hideMessageManually &&
        canSeeOnboardingMessages &&
        user &&
        Object.prototype.hasOwnProperty.call(
          user.onboardingProgress,
          this.messageKey,
        )
      ) {
        return user.onboardingProgress[this.messageKey] === true;
      } else {
        return false;
      }
    }),
  );

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
    let newLeft = parseFloat(this.position.left.replace('px', ''));
    let newBottom = parseFloat(this.position.bottom.replace('px', ''));

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

  dismissVideo() {
    if (this.user && this.messageKey) {
      const onboardingProgress = this.user.onboardingProgress;
      onboardingProgress[this.messageKey] = false;

      this.userService.updateUserOnboardingProgress(
        this.user,
        onboardingProgress,
      );
      this.hideMessageManually$.next(true);
    }
  }

  hideCoverAndPlayVideo() {
    this.showCover.set(false);
    this.videoRef?.nativeElement.play();
  }
}
