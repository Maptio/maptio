# 3. Move to Nx monorepo with new Angular app

Date: 2021-03-12

## Status

Accepted

## Context

The issue motivating this decision, and any context that influences or constrains the decision. Currently, we are using
Angular 7 and a custom webpack setup. We are 4 major Angular versions behind and are missing out on very significant
performance improvements. Because we are not using Angular CLI (i.e. are using a custom webpack setup), Angular version
updates are significantly more time consuming. In addition to this we are missing out on a lot of best practice tooling
that the Angular community has settled on.

Moving all of the code to use Angular CLI and updating Angular by 4 major versions will be a major undertaking.

## Decision

We decided to make use of the opportunity presented by the need to refresh the UI and map UX and start a new project
based on the latest tooling and latest Angular. We can then first focus on building out new features there and then
gradually move all of the functionality to the new app, updating the code and the UI as we go along.

## Consequences

It will be significantly easier to implement new features.

However, we will need to bring back old features gradually into the new app. Doing so in a monorepo and gradually
moving features between two apps in a monorepo might be easier than trying one large update.
