import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { Initiative } from '../../../../shared/model/initiative.data';
import { Permissions } from '../../../../shared/model/permission.data';
import { environment } from '../../../../../environment/environment';

@Component({
    selector: 'context-menu',
    templateUrl: './context-menu.component.html',
    styleUrls: ['./context-menu.component.css']
})
export class ContextMenuComponent implements OnInit {

    @Input("initiatives") initiatives: Initiative[];
    @Input("x") x: Number;
    @Input("y") y: Number;
    @Input("isReadOnly") isReadOnly: Boolean;

    @Output() add: EventEmitter<{ node: Initiative, subNode: Initiative }> = new EventEmitter<{ node: Initiative, subNode: Initiative }>();
    @Output() remove: EventEmitter<Initiative> = new EventEmitter<Initiative>();
    @Output() edit: EventEmitter<Initiative> = new EventEmitter<Initiative>();

    @ViewChild("inputNewInitiative") public inputNewInitiative: ElementRef;
    isRemovingNode: Boolean;
    isAddingNode: Boolean;
    Permissions = Permissions;
    KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;

    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit(): void { 
        this.isAddingNode=false;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.isAddingNode =false;
    }

    addNode(node: Initiative, subNodeName: string, openDetailsPanel: Boolean) {
        let subNode = new Initiative({ name: subNodeName })
        this.add.emit({ node: node, subNode: subNode });
        if (openDetailsPanel) {
            this.edit.emit(subNode);
        }
        this.isAddingNode = false;
        (<HTMLInputElement>this.inputNewInitiative.nativeElement).value = "";
        this.cd.markForCheck();
    }


    removeNode(node: Initiative) {
        this.remove.emit(node);
        this.isRemovingNode = false;
        this.cd.markForCheck();
    }

    openNode(node:Initiative){
        this.edit.emit(node);
    }
}
