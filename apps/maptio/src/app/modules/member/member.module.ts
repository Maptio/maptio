import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MemberComponent } from './member.component';

@NgModule({
    imports: [CommonModule, MemberComponent],
    exports: [MemberComponent]
})
export class MemberModule {}
