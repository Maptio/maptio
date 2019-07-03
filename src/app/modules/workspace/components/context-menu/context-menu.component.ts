import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { Initiative } from '../../../../shared/model/initiative.data';
import { Permissions } from '../../../../shared/model/permission.data';
import { environment } from '../../../../config/environment';
import { User } from '../../../../shared/model/user.data';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
    @Input("canDelete") canDelete: boolean;

    @Output() add: EventEmitter<{ node: Initiative, subNode: Initiative }> = new EventEmitter<{ node: Initiative, subNode: Initiative }>();
    @Output() remove: EventEmitter<Initiative> = new EventEmitter<Initiative>();
    @Output() edit: EventEmitter<Initiative> = new EventEmitter<Initiative>();
    @Output() openAccountable: EventEmitter<User> = new EventEmitter<User>();

    isRemovingNode: Boolean;
    isAddingNode: Boolean;
    isClosed: boolean;
    addNodeForm: FormGroup;
    Permissions = Permissions;
    KB_URL_PERMISSIONS = environment.KB_URL_PERMISSIONS;

    constructor(private cd: ChangeDetectorRef) {
        this.addNodeForm = new FormGroup({
            "newName": new FormControl("", {
                validators: [
                    Validators.required
                ],
                updateOn: "submit"
            }),
        });

    }

    ngOnInit(): void {
        this.isAddingNode = false;
        this.isRemovingNode = false;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.isAddingNode = false;
        this.isRemovingNode = false;
        this.isClosed = false;
        this.cd.markForCheck();
    }

    addNode(node: Initiative) {
        if (this.addNodeForm.valid) {
            let subNodeName = this.addNodeForm.controls["newName"].value
            let subNode = new Initiative({ name: subNodeName })
            this.add.emit({ node: node, subNode: subNode });
            this.edit.emit(subNode);
            this.isAddingNode = false;
            this.addNodeForm.reset();
            this.cd.markForCheck();
        }

    }


    removeNode(node: Initiative) {
        this.remove.emit(node);
        this.isRemovingNode = false;
        this.cd.markForCheck();
    }

    openNode(node: Initiative) {
        this.edit.emit(node);
    }

    openUser(node: Initiative) {
        this.openAccountable.emit(node.accountable);
        this.isClosed = true;
        this.cd.markForCheck();
    }
}
