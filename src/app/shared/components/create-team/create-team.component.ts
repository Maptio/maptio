import { Component, EventEmitter, OnInit, TemplateRef, Renderer2, Input, Output, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Team } from '../../model/team.data';
import { User } from '../../model/user.data';
import { Router } from '@angular/router';
import { Permissions } from "../../../shared/model/permission.data";
import { TeamService } from '../../services/team/team.service';

@Component({
    selector: 'common-create-team',
    templateUrl: './create-team.component.html'
})
export class CreateTeamComponent implements OnInit {
    createForm: FormGroup;
    isCreating: boolean;
    cannotCreateMoreTeamMessage: string;
    Permissions = Permissions;

    @Input("existingTeamCount") existingTeamCount: number;
    @Input("user") user: User;
    @Input("isRedirectHome") isRedirectHome: boolean;

    @Output("create") create: EventEmitter<Team> = new EventEmitter<Team>();
    @Output("error") error: EventEmitter<string> = new EventEmitter<string>();

    constructor(private renderer: Renderer2, private teamService: TeamService, private router: Router,
        private cd: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.createForm = new FormGroup({
            "teamName": new FormControl("", {
                validators: [
                    Validators.required,
                    Validators.minLength(2)
                ],
                updateOn: "submit"
            }),
        });
    }

    public disableFieldset = (templateRef: TemplateRef<any>) => {
        this.renderer.setAttribute(templateRef.elementRef.nativeElement.nextSibling, "disabled", "");
    }
    public enableFieldset = (templateRef: TemplateRef<any>) => {
        // this.renderer.removeAttribute(templateRef.elementRef.nativeElement.nextSibling, "disabled");
    }

    createNewTeam() {
        if (this.existingTeamCount >= 1) {
            this.cannotCreateMoreTeamMessage = "You have reached your maximum number of teams allowed: 1. Please reach out at support@maptio.com if you need to change these settings."

        } else {
            if (this.createForm.dirty && this.createForm.valid) {
                let teamName = this.createForm.controls["teamName"].value;
                this.isCreating = true;
                this.teamService.create(teamName, this.user)
                    .then((team: Team) => {
                        if (this.isRedirectHome) {
                            this.router.navigateByUrl("/home")
                        }
                        else {
                            this.router.navigate(["teams", team.team_id, team.getSlug()])
                        }
                        this.isCreating = false;
                    })
                    .catch((error) => {
                        this.error.emit(error);
                        this.isCreating = false;
                        this.cd.markForCheck();
                    })

            }
        }

    }
}
