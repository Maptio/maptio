.
├── file-tree.md
├── jest.config.ts
├── src
│   ├── app
│   │   ├── app.component.css
│   │   ├── app.component.html
│   │   ├── app.component.spec.ts
│   │   ├── app.component.ts
│   │   ├── app.module.ts
│   │   ├── app.routing.ts
│   │   ├── config
│   │   │   └── environment.ts
│   │   ├── core
│   │   │   ├── 401
│   │   │   │   ├── unauthorized.component.html
│   │   │   │   ├── unauthorized.component.spec.ts
│   │   │   │   └── unauthorized.component.ts
│   │   │   ├── 404
│   │   │   │   ├── not-found.component.html
│   │   │   │   ├── not-found.component.spec.ts
│   │   │   │   └── not-found.component.ts
│   │   │   ├── analytics.module.ts
│   │   │   ├── core.module.ts
│   │   │   ├── error
│   │   │   │   ├── error.page.html
│   │   │   │   ├── error.page.spec.ts
│   │   │   │   └── error.page.ts
│   │   │   ├── footer
│   │   │   │   ├── footer.component.css
│   │   │   │   ├── footer.component.html
│   │   │   │   ├── footer.component.spec.ts
│   │   │   │   └── footer.component.ts
│   │   │   ├── guards
│   │   │   │   ├── access.guard.spec.ts
│   │   │   │   ├── access.guard.ts
│   │   │   │   ├── activation.guard.ts
│   │   │   │   ├── billing.guard.ts
│   │   │   │   ├── permission.guard.ts
│   │   │   │   ├── workspace.guard.spec.ts
│   │   │   │   └── workspace.guard.ts
│   │   │   ├── header
│   │   │   │   ├── header.component.css
│   │   │   │   ├── header.component.html
│   │   │   │   ├── header.component.spec.ts
│   │   │   │   ├── header.component.ts
│   │   │   │   ├── language-picker.component.html
│   │   │   │   ├── language-picker.component.scss
│   │   │   │   ├── language-picker.component.spec.ts
│   │   │   │   ├── language-picker.component.ts
│   │   │   │   ├── locale.interface.ts
│   │   │   │   ├── onboarding-banner.component.html
│   │   │   │   ├── onboarding-banner.component.scss
│   │   │   │   ├── onboarding-banner.component.spec.ts
│   │   │   │   └── onboarding-banner.component.ts
│   │   │   ├── http
│   │   │   │   ├── map
│   │   │   │   │   ├── dataset.factory.spec.ts
│   │   │   │   │   └── dataset.factory.ts
│   │   │   │   ├── team
│   │   │   │   │   ├── team.factory.spec.ts
│   │   │   │   │   └── team.factory.ts
│   │   │   │   └── user
│   │   │   │       ├── user.factory.spec.ts
│   │   │   │       └── user.factory.ts
│   │   │   ├── login-error
│   │   │   │   ├── login-error.page.html
│   │   │   │   ├── login-error.page.spec.ts
│   │   │   │   └── login-error.page.ts
│   │   │   ├── mocks
│   │   │   │   └── events.helper.shared.ts
│   │   │   └── services
│   │   │       └── emitter.service.ts
│   │   ├── modules
│   │   │   ├── circle-map
│   │   │   │   ├── circle
│   │   │   │   │   ├── circle.component.html
│   │   │   │   │   ├── circle.component.scss
│   │   │   │   │   ├── circle.component.spec.ts
│   │   │   │   │   └── circle.component.ts
│   │   │   │   ├── circle-info
│   │   │   │   │   ├── circle-info.component.html
│   │   │   │   │   ├── circle-info.component.scss
│   │   │   │   │   ├── circle-info.component.spec.ts
│   │   │   │   │   └── circle-info.component.ts
│   │   │   │   ├── circle-map.component.html
│   │   │   │   ├── circle-map.component.scss
│   │   │   │   ├── circle-map.component.ts
│   │   │   │   ├── circle-map.module.ts
│   │   │   │   ├── circle-map.service.spec.ts
│   │   │   │   ├── circle-map.service.ts
│   │   │   │   ├── helper-avatar
│   │   │   │   │   ├── helper-avatar.component.html
│   │   │   │   │   ├── helper-avatar.component.scss
│   │   │   │   │   ├── helper-avatar.component.spec.ts
│   │   │   │   │   └── helper-avatar.component.ts
│   │   │   │   ├── initiative.model.ts
│   │   │   │   ├── search
│   │   │   │   │   ├── search.component.html
│   │   │   │   │   ├── search.component.scss
│   │   │   │   │   ├── search.component.spec.ts
│   │   │   │   │   └── search.component.ts
│   │   │   │   └── svg-zoom-pan
│   │   │   │       ├── svg-zoom-pan.component.html
│   │   │   │       ├── svg-zoom-pan.component.scss
│   │   │   │       ├── svg-zoom-pan.component.spec.ts
│   │   │   │       ├── svg-zoom-pan.component.ts
│   │   │   │       ├── svg-zoom-pan.service.spec.ts
│   │   │   │       └── svg-zoom-pan.service.ts
│   │   │   ├── circle-map-expanded
│   │   │   │   ├── circle
│   │   │   │   │   ├── circle.component.html
│   │   │   │   │   ├── circle.component.scss
│   │   │   │   │   ├── circle.component.spec.ts
│   │   │   │   │   └── circle.component.ts
│   │   │   │   ├── circle-info
│   │   │   │   │   ├── circle-info.component.html
│   │   │   │   │   ├── circle-info.component.scss
│   │   │   │   │   ├── circle-info.component.spec.ts
│   │   │   │   │   └── circle-info.component.ts
│   │   │   │   ├── circle-info-svg
│   │   │   │   │   ├── circle-info-svg.component.html
│   │   │   │   │   ├── circle-info-svg.component.scss
│   │   │   │   │   ├── circle-info-svg.component.spec.ts
│   │   │   │   │   └── circle-info-svg.component.ts
│   │   │   │   ├── circle-map-expanded.component.css
│   │   │   │   ├── circle-map-expanded.component.html
│   │   │   │   ├── circle-map-expanded.component.ts
│   │   │   │   ├── circle-map-expanded.module.ts
│   │   │   │   ├── circle-map.service.spec.ts
│   │   │   │   ├── circle-map.service.ts
│   │   │   │   ├── helper-avatar
│   │   │   │   │   ├── helper-avatar.component.html
│   │   │   │   │   ├── helper-avatar.component.scss
│   │   │   │   │   ├── helper-avatar.component.spec.ts
│   │   │   │   │   └── helper-avatar.component.ts
│   │   │   │   ├── helper-avatar-svg
│   │   │   │   │   ├── helper-avatar-svg.component.html
│   │   │   │   │   ├── helper-avatar-svg.component.scss
│   │   │   │   │   └── helper-avatar-svg.component.ts
│   │   │   │   ├── initiative.model.ts
│   │   │   │   ├── svg-zoom-pan
│   │   │   │   │   ├── svg-zoom-pan.component.html
│   │   │   │   │   ├── svg-zoom-pan.component.scss
│   │   │   │   │   ├── svg-zoom-pan.component.spec.ts
│   │   │   │   │   ├── svg-zoom-pan.component.ts
│   │   │   │   │   ├── svg-zoom-pan.service.spec.ts
│   │   │   │   │   └── svg-zoom-pan.service.ts
│   │   │   │   └── tag-svg
│   │   │   │       ├── tag-svg.component.html
│   │   │   │       ├── tag-svg.component.scss
│   │   │   │       ├── tag-svg.component.spec.ts
│   │   │   │       └── tag-svg.component.ts
│   │   │   ├── embed
│   │   │   │   ├── embed.module.ts
│   │   │   │   ├── embed.routing.ts
│   │   │   │   ├── embeddable-dataset.service.ts
│   │   │   │   └── pages
│   │   │   │       └── embed
│   │   │   │           ├── embed.page.html
│   │   │   │           ├── embed.page.scss
│   │   │   │           └── embed.page.ts
│   │   │   ├── help
│   │   │   │   ├── help.module.ts
│   │   │   │   ├── help.routing.ts
│   │   │   │   └── pages
│   │   │   │       └── help
│   │   │   │           ├── help.page.html
│   │   │   │           ├── help.page.spec.ts
│   │   │   │           └── help.page.ts
│   │   │   ├── home
│   │   │   │   ├── components
│   │   │   │   │   └── dashboard
│   │   │   │   │       ├── dashboard.component.css
│   │   │   │   │       ├── dashboard.component.html
│   │   │   │   │       ├── dashboard.component.spec.ts
│   │   │   │   │       └── dashboard.component.ts
│   │   │   │   ├── home.module.ts
│   │   │   │   ├── home.routing.ts
│   │   │   │   └── pages
│   │   │   │       └── home
│   │   │   │           ├── home.page.css
│   │   │   │           ├── home.page.html
│   │   │   │           ├── home.page.spec.ts
│   │   │   │           └── home.page.ts
│   │   │   ├── legal
│   │   │   │   ├── legal.module.ts
│   │   │   │   ├── legal.routing.ts
│   │   │   │   └── pages
│   │   │   │       ├── privacy
│   │   │   │       │   └── privacy.page.ts
│   │   │   │       └── tos
│   │   │   │           └── terms.page.ts
│   │   │   ├── login
│   │   │   │   ├── login-redirect
│   │   │   │   │   ├── login-redirect.directive.spec.ts
│   │   │   │   │   └── login-redirect.directive.ts
│   │   │   │   ├── login.guard.ts
│   │   │   │   ├── login.module.ts
│   │   │   │   ├── login.routing.ts
│   │   │   │   ├── pages
│   │   │   │   │   ├── logout
│   │   │   │   │   │   ├── logout.page.css
│   │   │   │   │   │   ├── logout.page.html
│   │   │   │   │   │   ├── logout.page.spec.ts
│   │   │   │   │   │   └── logout.page.ts
│   │   │   │   │   ├── profile
│   │   │   │   │   │   ├── profile.page.css
│   │   │   │   │   │   ├── profile.page.html
│   │   │   │   │   │   ├── profile.page.spec.ts
│   │   │   │   │   │   └── profile.page.ts
│   │   │   │   │   └── sign-up
│   │   │   │   │       ├── signup.page.html
│   │   │   │   │       ├── signup.page.spec.ts
│   │   │   │   │       └── signup.page.ts
│   │   │   │   └── signup.guard.ts
│   │   │   ├── member
│   │   │   │   ├── index.ts
│   │   │   │   ├── member.component.html
│   │   │   │   ├── member.component.scss
│   │   │   │   ├── member.component.spec.ts
│   │   │   │   ├── member.component.ts
│   │   │   │   └── member.module.ts
│   │   │   ├── member-form
│   │   │   │   ├── index.ts
│   │   │   │   ├── member-form.component.html
│   │   │   │   ├── member-form.component.scss
│   │   │   │   ├── member-form.component.ts
│   │   │   │   └── member-form.module.ts
│   │   │   ├── onboarding-message
│   │   │   │   ├── onboarding-message
│   │   │   │   │   ├── onboarding-message.component.html
│   │   │   │   │   ├── onboarding-message.component.scss
│   │   │   │   │   ├── onboarding-message.component.spec.ts
│   │   │   │   │   └── onboarding-message.component.ts
│   │   │   │   └── onboarding-message.module.ts
│   │   │   ├── payment
│   │   │   │   ├── pages
│   │   │   │   │   ├── checkout
│   │   │   │   │   │   ├── checkout.page.css
│   │   │   │   │   │   ├── checkout.page.html
│   │   │   │   │   │   └── checkout.page.ts
│   │   │   │   │   └── pricing
│   │   │   │   │       ├── billing-schedule.enum.ts
│   │   │   │   │       ├── payment-plan.component.html
│   │   │   │   │       ├── payment-plan.component.ts
│   │   │   │   │       ├── pricing.page.html
│   │   │   │   │       └── pricing.page.ts
│   │   │   │   ├── payment.module.ts
│   │   │   │   └── payment.routing.ts
│   │   │   ├── permissions-messages
│   │   │   │   ├── insufficient-permissions-message.component.html
│   │   │   │   ├── insufficient-permissions-message.component.scss
│   │   │   │   ├── insufficient-permissions-message.component.spec.ts
│   │   │   │   ├── insufficient-permissions-message.component.ts
│   │   │   │   └── permissions-messages.module.ts
│   │   │   ├── team
│   │   │   │   ├── components
│   │   │   │   │   └── member-details
│   │   │   │   │       ├── member-single.component.css
│   │   │   │   │       ├── member-single.component.html
│   │   │   │   │       └── member-single.component.ts
│   │   │   │   ├── pages
│   │   │   │   │   ├── team-billing
│   │   │   │   │   │   ├── billing.component.css
│   │   │   │   │   │   ├── billing.component.html
│   │   │   │   │   │   └── billing.component.ts
│   │   │   │   │   ├── team-import
│   │   │   │   │   │   ├── import.component.css
│   │   │   │   │   │   ├── import.component.html
│   │   │   │   │   │   ├── import.component.spec.ts
│   │   │   │   │   │   └── import.component.ts
│   │   │   │   │   ├── team-integrations
│   │   │   │   │   │   ├── integrations.component.css
│   │   │   │   │   │   ├── integrations.component.html
│   │   │   │   │   │   ├── integrations.component.spec.ts
│   │   │   │   │   │   └── integrations.component.ts
│   │   │   │   │   ├── team-list
│   │   │   │   │   │   ├── team-list-component.css
│   │   │   │   │   │   ├── team-list.component.html
│   │   │   │   │   │   ├── team-list.component.spec.ts
│   │   │   │   │   │   ├── team-list.component.ts
│   │   │   │   │   │   └── team-list.resolver.ts
│   │   │   │   │   ├── team-maps
│   │   │   │   │   │   ├── maps.component.css
│   │   │   │   │   │   ├── maps.component.html
│   │   │   │   │   │   └── maps.component.ts
│   │   │   │   │   ├── team-members
│   │   │   │   │   │   ├── members.component.css
│   │   │   │   │   │   ├── members.component.html
│   │   │   │   │   │   ├── members.component.spec.ts
│   │   │   │   │   │   └── members.component.ts
│   │   │   │   │   ├── team-settings
│   │   │   │   │   │   ├── settings.component.css
│   │   │   │   │   │   ├── settings.component.html
│   │   │   │   │   │   ├── settings.component.spec.ts
│   │   │   │   │   │   └── settings.component.ts
│   │   │   │   │   └── team-single
│   │   │   │   │       ├── team.component.css
│   │   │   │   │       ├── team.component.html
│   │   │   │   │       ├── team.component.spec.ts
│   │   │   │   │       ├── team.component.ts
│   │   │   │   │       ├── team.resolver.spec.ts
│   │   │   │   │       └── team.resolver.ts
│   │   │   │   ├── team.module.ts
│   │   │   │   └── team.routing.ts
│   │   │   └── workspace
│   │   │       ├── components
│   │   │       │   ├── canvas
│   │   │       │   │   ├── mapping.component.css
│   │   │       │   │   ├── mapping.component.html
│   │   │       │   │   ├── mapping.component.spec.ts
│   │   │       │   │   ├── mapping.component.ts
│   │   │       │   │   └── mapping.interface.ts
│   │   │       │   ├── context-menu
│   │   │       │   │   ├── context-menu.component.css
│   │   │       │   │   ├── context-menu.component.html
│   │   │       │   │   └── context-menu.component.ts
│   │   │       │   ├── data-entry
│   │   │       │   │   ├── details
│   │   │       │   │   │   ├── initiative.component.css
│   │   │       │   │   │   ├── initiative.component.html
│   │   │       │   │   │   ├── initiative.component.spec.ts
│   │   │       │   │   │   ├── initiative.component.ts
│   │   │       │   │   │   ├── initiative.service.ts
│   │   │       │   │   │   └── parts
│   │   │       │   │   │       ├── authority
│   │   │       │   │   │       │   ├── authority-select.component.html
│   │   │       │   │   │       │   └── authority-select.component.ts
│   │   │       │   │   │       ├── description
│   │   │       │   │   │       │   ├── description-textarea.component.html
│   │   │       │   │   │       │   └── description-textarea.component.ts
│   │   │       │   │   │       ├── helpers
│   │   │       │   │   │       │   ├── helper-input.component.css
│   │   │       │   │   │       │   ├── helper-input.component.html
│   │   │       │   │   │       │   ├── helper-input.component.ts
│   │   │       │   │   │       │   ├── helper-role-input.component.css
│   │   │       │   │   │       │   ├── helper-role-input.component.html
│   │   │       │   │   │       │   ├── helper-role-input.component.ts
│   │   │       │   │   │       │   ├── helper-role-select.component.html
│   │   │       │   │   │       │   ├── helper-role-select.component.ts
│   │   │       │   │   │       │   ├── helper-role.component.css
│   │   │       │   │   │       │   ├── helper-role.component.html
│   │   │       │   │   │       │   ├── helper-role.component.ts
│   │   │       │   │   │       │   ├── helper-toggle-privilege.component.css
│   │   │       │   │   │       │   ├── helper-toggle-privilege.component.html
│   │   │       │   │   │       │   ├── helper-toggle-privilege.component.ts
│   │   │       │   │   │       │   ├── helpers-select.component.html
│   │   │       │   │   │       │   ├── helpers-select.component.ts
│   │   │       │   │   │       │   ├── vacancies-input.component.css
│   │   │       │   │   │       │   ├── vacancies-input.component.html
│   │   │       │   │   │       │   └── vacancies-input.component.ts
│   │   │       │   │   │       ├── name
│   │   │       │   │   │       │   ├── initiative-input-name.component.html
│   │   │       │   │   │       │   └── initiative-input-name.component.ts
│   │   │       │   │   │       ├── size
│   │   │       │   │   │       │   ├── input-size.component.html
│   │   │       │   │   │       │   ├── input-size.component.scss
│   │   │       │   │   │       │   └── input-size.component.ts
│   │   │       │   │   │       └── tags
│   │   │       │   │   │           ├── list-tags.component.html
│   │   │       │   │   │           └── list-tags.component.ts
│   │   │       │   │   ├── hierarchy
│   │   │       │   │   │   ├── building.component.css
│   │   │       │   │   │   ├── building.component.html
│   │   │       │   │   │   ├── building.component.spec.ts
│   │   │       │   │   │   ├── building.component.ts
│   │   │       │   │   │   └── fixtures
│   │   │       │   │   │       └── data.json
│   │   │       │   │   ├── node
│   │   │       │   │   │   ├── initiative.node.component.css
│   │   │       │   │   │   ├── initiative.node.component.html
│   │   │       │   │   │   └── initiative.node.component.ts
│   │   │       │   │   └── tags
│   │   │       │   │       ├── edit-tags.component.css
│   │   │       │   │       ├── edit-tags.component.html
│   │   │       │   │       └── edit-tags.component.ts
│   │   │       │   ├── filtering
│   │   │       │   │   ├── tags.component.css
│   │   │       │   │   ├── tags.component.html
│   │   │       │   │   ├── tags.component.spec.ts
│   │   │       │   │   └── tags.component.ts
│   │   │       │   ├── searching
│   │   │       │   │   ├── search.component.css
│   │   │       │   │   ├── search.component.html
│   │   │       │   │   ├── search.component.spec.ts
│   │   │       │   │   └── search.component.ts
│   │   │       │   ├── sharing
│   │   │       │   │   ├── sharing.component.html
│   │   │       │   │   ├── sharing.component.scss
│   │   │       │   │   ├── sharing.component.spec.ts
│   │   │       │   │   └── sharing.component.ts
│   │   │       │   ├── summary
│   │   │       │   │   ├── overview
│   │   │       │   │   │   ├── fixtures
│   │   │       │   │   │   │   └── data.json
│   │   │       │   │   │   ├── people.component.css
│   │   │       │   │   │   ├── people.component.html
│   │   │       │   │   │   ├── people.component.ts
│   │   │       │   │   │   ├── personal.component.css
│   │   │       │   │   │   ├── personal.component.html
│   │   │       │   │   │   ├── personal.component.spec.ts
│   │   │       │   │   │   ├── personal.component.ts
│   │   │       │   │   │   ├── roles.component.css
│   │   │       │   │   │   ├── roles.component.html
│   │   │       │   │   │   ├── roles.component.ts
│   │   │       │   │   │   ├── vacancies.component.css
│   │   │       │   │   │   ├── vacancies.component.html
│   │   │       │   │   │   └── vacancies.component.ts
│   │   │       │   │   └── tab
│   │   │       │   │       ├── card.component.css
│   │   │       │   │       ├── card.component.html
│   │   │       │   │       ├── card.component.ts
│   │   │       │   │       ├── role-holders-in-initiative.component.css
│   │   │       │   │       ├── role-holders-in-initiative.component.html
│   │   │       │   │       └── role-holders-in-initiative.component.ts
│   │   │       │   └── tooltip
│   │   │       │       ├── tooltip.component.css
│   │   │       │       ├── tooltip.component.html
│   │   │       │       └── tooltip.component.ts
│   │   │       ├── pages
│   │   │       │   ├── circles
│   │   │       │   │   ├── fixtures
│   │   │       │   │   │   └── data.json
│   │   │       │   │   ├── mapping.zoomable.component.css
│   │   │       │   │   ├── mapping.zoomable.component.html
│   │   │       │   │   ├── mapping.zoomable.component.spec.ts
│   │   │       │   │   └── mapping.zoomable.component.ts
│   │   │       │   ├── circles-expanded
│   │   │       │   │   ├── mapping-circles-expanded.component.css
│   │   │       │   │   ├── mapping-circles-expanded.component.html
│   │   │       │   │   └── mapping-circles-expanded.component.ts
│   │   │       │   ├── circles-gradual-reveal
│   │   │       │   │   ├── mapping.circles-gradual-reveal.component.css
│   │   │       │   │   ├── mapping.circles-gradual-reveal.component.html
│   │   │       │   │   └── mapping.circles-gradual-reveal.component.ts
│   │   │       │   ├── directory
│   │   │       │   │   ├── summary.component.css
│   │   │       │   │   ├── summary.component.html
│   │   │       │   │   └── summary.component.ts
│   │   │       │   ├── network
│   │   │       │   │   ├── fixtures
│   │   │       │   │   │   └── data.json
│   │   │       │   │   ├── mapping.network.component.css
│   │   │       │   │   ├── mapping.network.component.html
│   │   │       │   │   ├── mapping.network.component.spec.ts
│   │   │       │   │   └── mapping.network.component.ts
│   │   │       │   ├── tree
│   │   │       │   │   ├── fixtures
│   │   │       │   │   │   └── data.json
│   │   │       │   │   ├── mapping.tree.component.css
│   │   │       │   │   ├── mapping.tree.component.html
│   │   │       │   │   ├── mapping.tree.component.spec.ts
│   │   │       │   │   └── mapping.tree.component.ts
│   │   │       │   └── workspace
│   │   │       │       ├── workspace.component.css
│   │   │       │       ├── workspace.component.html
│   │   │       │       ├── workspace.component.spec.ts
│   │   │       │       ├── workspace.component.ts
│   │   │       │       ├── workspace.resolver.spec.ts
│   │   │       │       └── workspace.resolver.ts
│   │   │       ├── services
│   │   │       │   ├── data.service.ts
│   │   │       │   ├── fixtures
│   │   │       │   │   ├── withmanysvg.html
│   │   │       │   │   ├── withoutsvg.html
│   │   │       │   │   └── withsvg.html
│   │   │       │   ├── map-settings.service.ts
│   │   │       │   ├── role-library.service.ts
│   │   │       │   ├── ui.service.spec.ts
│   │   │       │   └── ui.service.ts
│   │   │       ├── workspace.module.ts
│   │   │       └── workspace.routing.ts
│   │   ├── shared
│   │   │   ├── components
│   │   │   │   ├── autocomplete
│   │   │   │   │   ├── autocomplete.component.html
│   │   │   │   │   └── autocomplete.component.ts
│   │   │   │   ├── cards
│   │   │   │   │   ├── create-map
│   │   │   │   │   │   ├── create-map.component.css
│   │   │   │   │   │   ├── create-map.component.html
│   │   │   │   │   │   └── create-map.component.ts
│   │   │   │   │   ├── create-team
│   │   │   │   │   │   ├── create-team.component.css
│   │   │   │   │   │   ├── create-team.component.html
│   │   │   │   │   │   └── create-team.component.ts
│   │   │   │   │   ├── map
│   │   │   │   │   │   ├── map-card.component.css
│   │   │   │   │   │   ├── map-card.component.html
│   │   │   │   │   │   └── map-card.component.ts
│   │   │   │   │   └── team
│   │   │   │   │       ├── card-team.component.html
│   │   │   │   │       └── card-team.component.ts
│   │   │   │   ├── color-picker
│   │   │   │   │   ├── color-picker.component.html
│   │   │   │   │   └── color-picker.component.ts
│   │   │   │   ├── image-upload
│   │   │   │   │   ├── image-upload.component.html
│   │   │   │   │   ├── image-upload.component.scss
│   │   │   │   │   ├── image-upload.component.spec.ts
│   │   │   │   │   └── image-upload.component.ts
│   │   │   │   ├── loading
│   │   │   │   │   ├── loader.component.css
│   │   │   │   │   ├── loader.component.html
│   │   │   │   │   ├── loader.component.spec.ts
│   │   │   │   │   ├── loader.component.ts
│   │   │   │   │   └── loader.service.ts
│   │   │   │   ├── member
│   │   │   │   ├── modal
│   │   │   │   │   ├── modal.component.css
│   │   │   │   │   ├── modal.component.html
│   │   │   │   │   └── modal.component.ts
│   │   │   │   ├── onboarding
│   │   │   │   │   ├── add-terminology.component.html
│   │   │   │   │   ├── add-terminology.component.ts
│   │   │   │   │   ├── consent.component.html
│   │   │   │   │   ├── consent.component.scss
│   │   │   │   │   ├── consent.component.spec.ts
│   │   │   │   │   ├── consent.component.ts
│   │   │   │   │   ├── onboarding.component.css
│   │   │   │   │   ├── onboarding.component.html
│   │   │   │   │   ├── onboarding.component.ts
│   │   │   │   │   ├── onboarding.enum.ts
│   │   │   │   │   └── onboarding.service.ts
│   │   │   │   └── textarea
│   │   │   │       ├── textarea.component.html
│   │   │   │       └── textarea.component.ts
│   │   │   ├── create-map.module.ts
│   │   │   ├── create-team.module.ts
│   │   │   ├── directives
│   │   │   │   ├── closable.directive.ts
│   │   │   │   ├── debounce.directive.ts
│   │   │   │   ├── equal-validator.directive.ts
│   │   │   │   ├── focusif.directive.spec.ts
│   │   │   │   ├── focusif.directive.ts
│   │   │   │   ├── permission.directive.ts
│   │   │   │   └── sticky.directive.ts
│   │   │   ├── image.module.ts
│   │   │   ├── interfaces
│   │   │   │   ├── intercom-company.interface.ts
│   │   │   │   ├── serializable.interface.ts
│   │   │   │   ├── team-status.interface.ts
│   │   │   │   └── traversable.interface.ts
│   │   │   ├── model
│   │   │   │   ├── circle-map-data.interface.ts
│   │   │   │   ├── dataset.data.spec.ts
│   │   │   │   ├── dataset.data.ts
│   │   │   │   ├── fixtures
│   │   │   │   │   ├── dataset.json
│   │   │   │   │   └── serialize.json
│   │   │   │   ├── helper.data.spec.ts
│   │   │   │   ├── helper.data.ts
│   │   │   │   ├── initiative.data.spec.ts
│   │   │   │   ├── initiative.data.ts
│   │   │   │   ├── integrations.data.ts
│   │   │   │   ├── onboarding-progress.data.ts
│   │   │   │   ├── permission.data.ts
│   │   │   │   ├── role.data.spec.ts
│   │   │   │   ├── role.data.ts
│   │   │   │   ├── tag.data.ts
│   │   │   │   ├── team.data.spec.ts
│   │   │   │   ├── team.data.ts
│   │   │   │   ├── user.data.spec.ts
│   │   │   │   ├── user.data.ts
│   │   │   │   └── userWithTeamsAndDatasets.interface.ts
│   │   │   ├── onboarding.module.ts
│   │   │   ├── permissions.module.ts
│   │   │   ├── pipes
│   │   │   │   ├── ellipsis.pipe.ts
│   │   │   │   ├── keys.pipe.ts
│   │   │   │   ├── safe.pipe.ts
│   │   │   │   └── strip-markdown.pipe.ts
│   │   │   ├── sanitizer.module.ts
│   │   │   ├── services
│   │   │   │   ├── billing
│   │   │   │   │   └── billing.service.ts
│   │   │   │   ├── color
│   │   │   │   │   └── color.service.ts
│   │   │   │   ├── encoding
│   │   │   │   │   ├── jwt.service.spec.ts
│   │   │   │   │   └── jwt.service.ts
│   │   │   │   ├── error
│   │   │   │   │   └── error.service.ts
│   │   │   │   ├── export
│   │   │   │   │   ├── export.service.spec.ts
│   │   │   │   │   ├── export.service.ts
│   │   │   │   │   └── fixtures
│   │   │   │   │       └── data.json
│   │   │   │   ├── file
│   │   │   │   │   ├── file.service.spec.ts
│   │   │   │   │   └── file.service.ts
│   │   │   │   ├── map
│   │   │   │   │   └── map.service.ts
│   │   │   │   ├── markdown
│   │   │   │   │   └── markdown-utils.service.ts
│   │   │   │   ├── open-replay.service.spec.ts
│   │   │   │   ├── open-replay.service.ts
│   │   │   │   ├── permissions
│   │   │   │   │   └── permissions.service.ts
│   │   │   │   ├── team
│   │   │   │   │   ├── intercom.service.ts
│   │   │   │   │   └── team.service.ts
│   │   │   │   ├── uri
│   │   │   │   │   ├── uri.service.spec.ts
│   │   │   │   │   └── uri.service.ts
│   │   │   │   └── user
│   │   │   │       ├── duplication.error.ts
│   │   │   │       ├── multiple-user-duplication.error.ts
│   │   │   │       ├── user.service.spec.ts
│   │   │   │       └── user.service.ts
│   │   │   └── shared.module.ts
│   │   └── state
│   │       ├── app.state.ts
│   │       ├── current-organisation.actions.ts
│   │       ├── current-organisation.reducer.ts
│   │       └── current-organisation.selectors.ts
│   ├── assets
│   │   ├── images
│   │   │   ├── add_to_slack.png
│   │   │   ├── btn_google_signin_light_normal_web@2x.png
│   │   │   ├── circles-expanded.svg
│   │   │   ├── circles.svg
│   │   │   ├── favicon
│   │   │   │   ├── android-chrome-192x192.png
│   │   │   │   ├── android-chrome-384x384.png
│   │   │   │   ├── apple-touch-icon.png
│   │   │   │   ├── browserconfig.xml
│   │   │   │   ├── favicon-16x16.png
│   │   │   │   ├── favicon-32x32.png
│   │   │   │   ├── favicon.ico
│   │   │   │   ├── mstile-150x150.png
│   │   │   │   ├── safari-pinned-tab.svg
│   │   │   │   └── site.webmanifest
│   │   │   ├── home-background.png
│   │   │   ├── home-background.webp
│   │   │   ├── loading.png
│   │   │   ├── logo-full.png
│   │   │   ├── logo-full.webp
│   │   │   ├── logo-with-name.png
│   │   │   ├── logo.png
│   │   │   ├── logo.webp
│   │   │   ├── minus.png
│   │   │   ├── network.png
│   │   │   ├── network.webp
│   │   │   ├── onboarding
│   │   │   │   ├── circles_list.png
│   │   │   │   ├── full_map.png
│   │   │   │   ├── left_panel.png
│   │   │   │   ├── one_circle.png
│   │   │   │   ├── one_circle_details.png
│   │   │   │   ├── personal_summary.png
│   │   │   │   ├── right_click.gif
│   │   │   │   └── right_click.png
│   │   │   ├── plus.png
│   │   │   ├── reset-zoom.png
│   │   │   ├── right_click.gif
│   │   │   ├── screenshot.png
│   │   │   ├── screenshot.webp
│   │   │   ├── share-button.png
│   │   │   ├── slack-icon.jpeg
│   │   │   ├── slack-icon.png
│   │   │   ├── sso
│   │   │   │   └── google
│   │   │   │       ├── btn_google_signin_dark_disabled_web.png
│   │   │   │       ├── btn_google_signin_dark_disabled_web@2x.png
│   │   │   │       ├── btn_google_signin_dark_focus_web.png
│   │   │   │       ├── btn_google_signin_dark_focus_web@2x.png
│   │   │   │       ├── btn_google_signin_dark_normal_web.png
│   │   │   │       ├── btn_google_signin_dark_normal_web@2x.png
│   │   │   │       ├── btn_google_signin_dark_pressed_web.png
│   │   │   │       ├── btn_google_signin_dark_pressed_web@2x.png
│   │   │   │       ├── btn_google_signin_light_disabled_web.png
│   │   │   │       ├── btn_google_signin_light_disabled_web@2x.png
│   │   │   │       ├── btn_google_signin_light_focus_web.png
│   │   │   │       ├── btn_google_signin_light_focus_web@2x.png
│   │   │   │       ├── btn_google_signin_light_normal_web.png
│   │   │   │       ├── btn_google_signin_light_normal_web@2x.png
│   │   │   │       ├── btn_google_signin_light_pressed_web.png
│   │   │   │       ├── btn_google_signin_light_pressed_web@2x.png
│   │   │   │       └── icon.png
│   │   │   ├── tom.png
│   │   │   ├── treeview.svg
│   │   │   ├── treeview.webp
│   │   │   ├── user.jpg
│   │   │   └── welcome.png
│   │   ├── other
│   │   │   ├── Maptio - Import template - Users.csv
│   │   │   └── auth0-account-linking-page.css
│   │   ├── styles
│   │   │   ├── custom
│   │   │   │   ├── angular-tree-component.css
│   │   │   │   ├── animations.css
│   │   │   │   ├── collapsing.css
│   │   │   │   ├── color-picker.css
│   │   │   │   ├── forms.css
│   │   │   │   ├── global.css
│   │   │   │   ├── maps.css
│   │   │   │   ├── markdown.css
│   │   │   │   ├── popover.css
│   │   │   │   ├── progress-bar.css
│   │   │   │   ├── progress-pie.css
│   │   │   │   ├── ribbon.css
│   │   │   │   ├── tags.css
│   │   │   │   ├── theme.css
│   │   │   │   ├── tooltip.css
│   │   │   │   └── typeahead.css
│   │   │   ├── vendor-font-awesome.css
│   │   │   └── vendor-google-fonts.css
│   │   └── webfonts
│   │       ├── fa-brands-400.eot
│   │       ├── fa-brands-400.svg
│   │       ├── fa-brands-400.ttf
│   │       ├── fa-brands-400.woff
│   │       ├── fa-brands-400.woff2
│   │       ├── fa-regular-400.eot
│   │       ├── fa-regular-400.svg
│   │       ├── fa-regular-400.ttf
│   │       ├── fa-regular-400.woff
│   │       ├── fa-regular-400.woff2
│   │       ├── fa-solid-900.eot
│   │       ├── fa-solid-900.svg
│   │       ├── fa-solid-900.ttf
│   │       ├── fa-solid-900.woff
│   │       ├── fa-solid-900.woff2
│   │       ├── lato-v14-latin-regular.eot
│   │       ├── lato-v14-latin-regular.svg
│   │       ├── lato-v14-latin-regular.ttf
│   │       ├── lato-v14-latin-regular.woff
│   │       ├── lato-v14-latin-regular.woff2
│   │       ├── open-sans-v15-latin-ext_latin-600.eot
│   │       ├── open-sans-v15-latin-ext_latin-600.svg
│   │       ├── open-sans-v15-latin-ext_latin-600.ttf
│   │       ├── open-sans-v15-latin-ext_latin-600.woff
│   │       ├── open-sans-v15-latin-ext_latin-600.woff2
│   │       ├── open-sans-v15-latin-ext_latin-700.eot
│   │       ├── open-sans-v15-latin-ext_latin-700.svg
│   │       ├── open-sans-v15-latin-ext_latin-700.ttf
│   │       ├── open-sans-v15-latin-ext_latin-700.woff
│   │       ├── open-sans-v15-latin-ext_latin-700.woff2
│   │       ├── open-sans-v15-latin-ext_latin-regular.eot
│   │       ├── open-sans-v15-latin-ext_latin-regular.svg
│   │       ├── open-sans-v15-latin-ext_latin-regular.ttf
│   │       ├── open-sans-v15-latin-ext_latin-regular.woff
│   │       ├── open-sans-v15-latin-ext_latin-regular.woff2
│   │       ├── roboto-v18-latin-ext_latin-500.eot
│   │       ├── roboto-v18-latin-ext_latin-500.svg
│   │       ├── roboto-v18-latin-ext_latin-500.ttf
│   │       ├── roboto-v18-latin-ext_latin-500.woff
│   │       └── roboto-v18-latin-ext_latin-500.woff2
│   ├── environments
│   │   ├── environment.common.ts
│   │   ├── environment.prod.ts
│   │   ├── environment.staging.ts
│   │   └── environment.ts
│   ├── index.html
│   ├── locale
│   │   ├── messages.de.xlf
│   │   ├── messages.es.xlf
│   │   ├── messages.fr.xlf
│   │   ├── messages.ja.xlf
│   │   ├── messages.nl.xlf
│   │   ├── messages.pl.xlf
│   │   ├── messages.pt.xlf
│   │   └── messages.xlf
│   ├── main.ts
│   ├── polyfills.ts
│   ├── proxy.conf.json
│   ├── styles.scss
│   └── test-setup.ts
├── tsconfig.app.json
├── tsconfig.doc.json
├── tsconfig.editor.json
├── tsconfig.json
└── tsconfig.spec.json

159 directories, 615 files
