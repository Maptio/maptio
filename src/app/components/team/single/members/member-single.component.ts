import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { User } from '../../../../shared/model/user.data';
import { UserRole, Permissions } from "../../../../shared/model/permission.data";
import { UserService } from '../../../../shared/services/user/user.service';
import { Angulartics2Mixpanel } from 'angulartics2';
import { Intercom } from 'ng-intercom';
import { Team } from '../../../../shared/model/team.data';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'member-single',
    templateUrl: './member-single.component.html',
    styleUrls: ['./member-single.component.css']
})
export class MemberSingleComponent implements OnInit {

    UserRole = UserRole;
    Permissions = Permissions;

    @Input("team") team: Team;
    @Input("member") member: User;
    @Input("user") user: User;
    @Input("isOnlyMember") isOnlyMember: Boolean;
    @Input("invite") invite: Observable<User>;

    @Output("delete") delete = new EventEmitter<User>();

    isDisplaySendingLoader: boolean;
    isDisplayUpdatingLoader: boolean;
    subscription: Subscription;

    constructor(private cd: ChangeDetectorRef,
        private userService: UserService,
        private analytics: Angulartics2Mixpanel,
        private intercom: Intercom) { }

    ngOnInit(): void {

        this.subscription = this.invite.subscribe(() => {
            if (this.member.isActivationPending){
                console.log(this.member.user_id, this.member.name)
                this.inviteUser()
            }
        })
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    deleteMember() {
        this.delete.emit(this.member);
    }

    changeUserRole(userRole: UserRole) {
        this.isDisplayUpdatingLoader = true;
        this.cd.markForCheck();
        this.userService.updateUserRole(this.member.user_id, UserRole[userRole]).then(() => {
            this.isDisplayUpdatingLoader = false;
            this.cd.markForCheck();
        })
    }

    inviteUser(): Promise<void> {
        this.isDisplaySendingLoader = true;
        this.cd.markForCheck();
        return this.userService.sendInvite(this.member.email, this.member.user_id, this.member.firstname, this.member.lastname, this.member.name, this.team.name, this.user.name)
            .then((isSent) => {
                this.member.isInvitationSent = isSent;
                this.isDisplaySendingLoader = false;
                this.cd.markForCheck();
                return;
            }).then(() => {
                this.analytics.eventTrack("Team", { action: "invite", team: this.team.name, teamId: this.team.team_id })
                return;
            })
            .then(() => {
                this.intercom.trackEvent("Invite user", { team: this.team.name, teamId: this.team.team_id, email: this.member.email });
                return;
            })
    }
}
