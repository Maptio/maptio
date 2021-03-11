# 2. Implement helper roles library

Date: 2020-10-09

## Status

Accepted

## Issue

#476

## Context

Currently, all helper roles within iniatitives are custom. Many customers have requested the ability to add the same
role to multiple helpers (organisation-wide) to avoid copy/pasting the same text.

Although the roles in the UI were fairly simple - with one role per helper, the code was clearly ready for multple
roles as each helper had an array of roles: `Role[]`.

## Decision

Each organisation needs to have its own set of roles. Ideally, we would have a collection of roles as the source of
truth (one already exists in the database). However, this would decrease performance as we'd need to fetch roles from
that collecion every time we resolve data for a map. Ideally, we'd resolve this by having an explicit source of truth
and a cache of the denormalised version of each map. In practice, this is what the data in the dataset collection is -
althought it's a mix between a cache and a source of truth. In the future, it would be good to make these distinctions
clearer.

For now, we will follow a similar pattern and continue storing roles within the helper objects in the initiatives in 
the datasets. We will additionally store an array of all of the organisation's roles on the dataset and the team
object. When any of the roles are edited while editing a map, the change will be propagated to all three locations
(helper objects across the map being edited, as well as the arrays of roles on the dataset and the team objects). 
When a map is read into memory, the array of roles on the map will be checked against the array of roles on the team
objects. The team version will be considered the source of truth.

Additionally, we will reuse the current `Role` class and simply add optional `shortid` and `title` fields to it. Roles
without these fields will be displayed as they currently are and will be considered "custom" roles, i.e. not saved in
the library. Custom roles will also be able to have a title. Roles with the `shortid` field populated will be
considered team-wide roles and will be saved in the role library and will require the `title` field to be populated.

## Consequences

By storing the role data in the helper objects, we avoid performance issues while loading, multiple database calls,
etc. We sacrifice loading time for the map object, whill will grow much larger as there will be a high amount of data
duplication. This, however, follows the pattern already established in the app and requires few changes.

By making it possible to reuse the current `Role` objects with added optional fields, we will make it possible to
transition to the new enhanced roles functionality without data migration.

A downside of this decision is that we are making the data objects more complex, harder to reason about, introducing
further complexity and further lack of clarity about what the source of truth is for all objects.

We are also moving some of the data model complexity onto the UI, which will need to handle roles differently depending
on the optional parameters.

All of the downside are offset by our ability to move fast and build on current data patterns.
