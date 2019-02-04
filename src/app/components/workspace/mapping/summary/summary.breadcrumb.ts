import { Injectable } from "@angular/core";
import { BreadcrumbsResolver, Breadcrumb } from "@exalif/ngx-breadcrumbs";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { inherits } from "util";
import { UserFactory } from "../../../../core/http/user/user.factory";
import { User } from "../../../../shared/model/user.data";

@Injectable()
export class MappingSummaryBreadcrumbs extends BreadcrumbsResolver {


    // Optional: inject any required dependencies
    constructor(private userFactory: UserFactory) {
        super();
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Breadcrumb[]> {

        if (route.queryParams.member) {
            return this.userFactory.get(route.queryParams.member)
                .then((user: User) => {
                    return [
                        {
                            text: "Directory",
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
                    text: "Directory",
                    path: super.getFullPath(route)
                }
            ])
        }
    }

    getFullPath(route: ActivatedRouteSnapshot): string {
        return super.getFullPath(route);
    }
}