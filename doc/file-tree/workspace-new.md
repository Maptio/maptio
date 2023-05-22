<!--
This is the best visualisation of the structure of the workspace as of
20 April 2023, before major refactorings. It was created manually from the
workspace-full.md file.
-->

<!-- prettier-ignore -->
```bash
#
# New workspace structure
#
.
├── src
│   ├── app
│   │   ├── (...)
│   │   ├── workspace
│   │   │   ├── map-container
│   │   │   │   ├── map-container.component.*
│   │   │   │   └── map-container.interface.ts
│   │   │   ├── circles-covered
│   │   │   │   └── circles-covered.component.*
│   │   │   ├── circles-expanded
│   │   │   │   └── circles-expanded.component.*
│   │   │   ├── network
│   │   │   │   └── network.component.*
│   │   │   ├── directory
│   │   │   │   └── directory.component.*
│   │   │   ├── outline
│   │   │   │   └── outline.component.*
│   │   │   ├── initiative-details
│   │   │   │   └── initiative-details.component.*
│   │   │   ├── tag-editor
│   │   │   │   └── tag-editor.component.*
│   │   │   ├── sidebar
│   │   │   │   └── sidebar.component.*
│   │   │   ├── toolbar
│   │   │   │   └── toolbar.component.*
│   │   │   └── workspace.component.*

#
# Remaining files from the old workspace structure
#
│   │   ├── modules
│   │   │   ├── (...)
│   │   │   └── workspace
│   │   │       ├── components
│   │   │       │   ├── context-menu
│   │   │       │   │   └── context-menu.component.*
│   │   │       │   ├── data-entry
│   │   │       │   │   ├── details
│   │   │       │   │   │   ├── initiative.component.*
│   │   │       │   │   │   ├── initiative.service.ts
│   │   │       │   │   │   └── parts
│   │   │       │   │   │       ├── authority
│   │   │       │   │   │       │   ├── authority-select.component.*
│   │   │       │   │   │       ├── description
│   │   │       │   │   │       │   ├── description-textarea.component.*
│   │   │       │   │   │       ├── helpers
│   │   │       │   │   │       │   ├── helper-input.component.*
│   │   │       │   │   │       │   ├── helper-role-input.component.*
│   │   │       │   │   │       │   ├── helper-role-select.component.*
│   │   │       │   │   │       │   ├── helper-role.component.*
│   │   │       │   │   │       │   ├── helper-toggle-privilege.component.*
│   │   │       │   │   │       │   ├── helpers-select.component.*
│   │   │       │   │   │       │   └── vacancies-input.component.*
│   │   │       │   │   │       ├── name
│   │   │       │   │   │       │   └── initiative-input-name.component.*
│   │   │       │   │   │       ├── size
│   │   │       │   │   │       │   └── input-size.component.*
│   │   │       │   │   │       └── tags
│   │   │       │   │   │           └── list-tags.component.*
│   │   │       │   │   ├── hierarchy
│   │   │       │   │   │   └── building.component.*
│   │   │       │   │   ├── node
│   │   │       │   │   │   └── initiative.node.component.*
│   │   │       │   │   └── tags
│   │   │       │   │       └── edit-tags.component.*
│   │   │       │   ├── filtering
│   │   │       │   │   └── tags.component.*
│   │   │       │   ├── searching
│   │   │       │   │   └── search.component.*
│   │   │       │   ├── sharing
│   │   │       │   │   └── sharing.component.*
│   │   │       │   ├── summary
│   │   │       │   │   ├── overview
│   │   │       │   │   │   ├── people.component.*
│   │   │       │   │   │   ├── personal.component.*
│   │   │       │   │   │   ├── roles.component.*
│   │   │       │   │   │   └── vacancies.component.*
│   │   │       │   │   └── tab
│   │   │       │   │       ├── card.component.*
│   │   │       │   │       ├── role-holders-in-initiative.component.*
│   │   │       │   └── tooltip
│   │   │       │       └── tooltip.component.*
│   │   │       ├── pages
│   │   │       │   ├── circles
│   │   │       │   │   └── mapping.zoomable.component.*
│   │   │       │   ├── circles-expanded
│   │   │       │   │   └── mapping-circles-expanded.component.*
│   │   │       │   ├── circles-gradual-reveal
│   │   │       │   │   └── mapping.circles-gradual-reveal.component.*
│   │   │       │   ├── directory
│   │   │       │   │   └── summary.component.*
│   │   │       │   ├── network
│   │   │       │   │   └── mapping.network.component.*
│   │   │       │   ├── tree
│   │   │       │   │   └── mapping.tree.component.*
│   │   │       │   └── workspace
│   │   │       │       ├── workspace.component.*
│   │   │       │       └── workspace.resolver.*
│   │   │       ├── services
│   │   │       │   ├── data.service.ts
│   │   │       │   ├── map-settings.service.ts
│   │   │       │   ├── role-library.service.ts
│   │   │       │   ├── ui.service.spec.ts
│   │   │       │   └── ui.service.ts
│   │   │       └── workspace.routing.ts
│   │   └── (...)
│   └── (...)
└── (...)
```

# Files no longer needed

These files will no longer be needed if we implement everything correctly:

- `modules/workspace/workspace.module.ts`
  - By moving to standalone components, we remove the need for a module file.
- `modules/workspace/workspace.routing.ts`

# Files to be renamed

These old files have been renamed (with the new name in brackets):

- `modules/workspace/components/canvas/mapping.component.ts` (`workspace/map-container/map-container.component.ts`)
- `modules/workspace/components/canvas/mapping.interface.ts` (`workspace/map-container/map-container.interface.ts`)

# Questions remaining

- Do we need the map-container in its current shape? Do we still need the
  interface? Could we remove this component or at least the interface?
