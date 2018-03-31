// import { Initiative } from "./../model/initiative.data";
// import { Auth } from "./../services/auth/auth.service";
// import { Permissions } from "./../model/permission.data";
// import { Directive, ElementRef, Input } from "@angular/core";

// @Directive({
//     selector: "[checkInitiativePermissions]"
// })
// export class CheckInitiativePermissions {
//     @Input("checkInitiativePermissions") permission: Permissions;
//     @Input("checkedInitiative") checkedInitiative: Initiative;

//     userPermissions: Permissions[];
//     userId: string;

//     constructor(private el: ElementRef, private auth: Auth) {
//         this.userPermissions = auth.getPermissions();
//         this.userId = JSON.parse(localStorage.getItem("profile")).user_id
//     }

//     ngOnInit() {
//         if (!this.checkPermission()) {
//             (this.el.nativeElement as HTMLElement).setAttribute("title", "not avilaable")
//         }
//     }

//     private checkPermission() {
//         console.log(this.permission, this.userPermissions, this.userId, this.checkedInitiative)
//         switch (this.permission) {
//             case Permissions.canMoveInitiative:
//                 return this.canMoveInitiative();
//             case Permissions.canDeleteInitiative:
//                 return this.canDeleteInitiative();
//             default:
//                 return false;
//         }
//     }

//     private canMoveInitiative(): boolean {
//         return this.userPermissions.includes(Permissions.canMoveInitiative)
//     }

//     private canDeleteInitiative(): boolean {
//         return this.userPermissions.includes(Permissions.canDeleteInitiative)
//             ||
//             this.checkedInitiative.accountable.user_id === this.userId
//     }
// }