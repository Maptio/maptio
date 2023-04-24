<!-- prettier-ignore -->
.
├── file-tree.md
├── jest.config.ts
├── src
│   ├── app
│   │   ├── (...)
│   │   ├── modules
│   │   │   ├── (...)
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
│   │   └── (...)
│   └── (...)
└── (...)
