import { Injectable, state } from "@angular/core";
import { McBreadcrumbsResolver, IBreadcrumb } from "ngx-breadcrumbs";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { inherits } from "util";
import { UserFactory } from "../../../../shared/services/user.factory";
import { User } from "../../../../shared/model/user.data";

@Injectable()
export class MappingSummaryBreadcrumbs extends McBreadcrumbsResolver {


    // Optional: inject any required dependencies
    constructor(private userFactory: UserFactory) {
        super();
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<IBreadcrumb[]> {

        if (route.queryParams.member) {
            return this.userFactory.get(route.queryParams.member)
                .then((user: User) => {
                    return [
                        {
                            text: "Summary",
                            path: super.getFullPath(route)
                        },
                        {
                            text: user.name,
                            path: super.getFullPath(route)
                        }
                    ]
                });
        } else {
            return Promise.resolve([
                {
                    text: "Summary",
                    path: super.getFullPath(route)
                }
            ])
        }
    }

    getFullPath(route: ActivatedRouteSnapshot): string {
        return super.getFullPath(route);
    }
}