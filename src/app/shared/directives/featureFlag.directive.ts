import {
    Directive,
    Input,
    TemplateRef,
    ViewContainerRef,
} from "@angular/core";

/**
 * A very simplified feature flag directive
 *
 * Instead of providing a good way of configuring flags, we're simpling setting an array of flags inside the directive. This is all we need
 * for now for disabling editing on preview.
 *
 * The directive is base on this post (which also describes ways of doing this better):
 * https://netbasal.com/the-ultimate-guide-to-implementing-feature-flags-in-angular-applications-d4ae1fd33684 
 */
@Directive({
    selector: "[featureFlag]"
})
export class FeatureFlagDirective {
    @Input() featureFlag: string;

    flags = {
        enableEditing: false,
    }

    constructor(
        private viewContainer: ViewContainerRef,
        private template: TemplateRef<any>,
    ) {
    }

    ngOnInit() {
        if (this.hasFlag(this.featureFlag)) {
            this.viewContainer.createEmbeddedView(this.template);
        }
    }

    hasFlag(featureFlag: string) {
        if (featureFlag.charAt(0) === "!") {
            return !this.flags[featureFlag.slice(1)];
        } else {
            return this.flags[featureFlag];
        }
    }
  }
