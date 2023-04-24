import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmbedComponent } from './pages/embed/embed.page';
import { EmbedRoutingModule } from './embed.routing';
import { CircleMapModule } from '@maptio-circle-map/circle-map.module';

@NgModule({
    imports: [CommonModule, EmbedRoutingModule, CircleMapModule, EmbedComponent],
    exports: [],
    providers: []
})
export class EmbedModule {}
