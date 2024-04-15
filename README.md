![Maptio Logo](./apps/maptio/src/assets/images/logo-with-name.png)

# Maptio

For founders of purpose-driven companies and initiatives who want to create a
scalable, autonomous and focussed organisation structure and culture. Our
simple online initiative mapping tool visualises who has taken responsibility
for what and who is helping who to meet those responsibilities, so that people
throughout the organisation can:

- make autonomous decisions while at the same time supporting the autonomy of
  others, all the way up to the founder holding the overall vision
- see how responsibilities throughout the organisation feed into the greater
  system
- enjoy greater transparency
- avoid the tyranny of heavy-weight processes, bureaucracy and excessive
  management.

## Introduction

| Maptio has recently become an open source project 🎉 <br><br> The below documentation is incomplete and we are slowly improving it. In the meantime, if you want to get started, [get in touch with us](mailto:support@maptio.com) or [with me directly](mailto:roman.goj@gmail.com) and we'll be happy to help you e.g. via a video call. <br><br> In addition to this README, you can also check out [this issue where we discuss some issues with setting up locally](https://github.com/Maptio/maptio/issues/811). Please don't forget to add your thumbs up to it, so that we know to prioritise making this easier! |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## Installing / Getting started

The latest version of the app is running at
[https://app.maptio.com](https://app.maptio.com).

To launch it on your local server, see the
[Local development](#local-development) section.

## Developing

### Built With

- Angular
- Bootstrap
- D3
- Express
- MongoDB

Additionally , we use these services/packages :

- Auth0 for authentication as a service
- Intercom for chat and customer support
- Cloudinary for image storage/retrieval

### Prerequisites

You must have [Node.js](https://nodejs.org/en/download/) and
[MongoDB (Community Edition)](https://docs.mongodb.com/manual/installation/)
installed (unless you a cloud-based service).

### Local Development

#### 1. Get the code

```shell
git clone https://github.com/maptio/maptio.git
cd maptio/
```

#### 2. Set up the environment variables

Unforutnately, Maptio currently relies on external services, many of which
need to be set up for the app to work. If you'd like to set the external
services up, please use the `.env.sample` template to create a `.env` file
in the root folder and use the environment variables there as a guide for what
services to set up and what environment variables to obtain from them.

We're aware that this makes setting up Maptio for local development difficult
and we're gradually working on improving this. We've recently created a guide
for setting up Auth0 - see the next step - but more work is needed to replace
our dependencies on non-open-source services and to make setting up easier.
All help is very much welcome! Please see
[#811](https://github.com/Maptio/maptio/issues/811) for a discussion and to
share your thoughts.

#### 3. Set up Auth0

First, we need an Auth0 tenant for Maptio local development. If you don't have
an Auth0 account, go to [Auth0](https://auth0.com/) and create one - a tenant
should be created for you in the process. If all this sounds completely
unfamiliar, quickly going through one of the official Auth0 quickstarts for
Angular (e.g.
[Angular Authentication By Example](https://developer.auth0.com/resources/guides/spa/angular/basic-authentication))
to first familiarise yourself with some of the concepts might be helpful.

Once you've got a new tenant for Maptio, rather than setting up Auth0 manually,
we're going to use the Auth0 Deploy CLI to set up what Maptio needs. Please
check out this helpful
[guide](https://auth0.com/docs/deploy-monitor/deploy-cli-tool/use-as-a-cli) if
you're not familiar with this tool.

To make it possible to import Maptio settings via the CLI, we need to create a
new Machine to Machine (M2M) application via the Auth0 dashboard and allow it
the access the CLI will need to make the changes. To do this, go to
"Applications" and click "+ Create Application". Choose "Machine to Machine
Applications" and name it e.g. "Deploy CLI". In the next step, select the Auth0
Management API and under Permissions click "All" (it might be best to delete
this application after you're finished importing the settings) and then
"Authorize".

Next, we need to install the tool with:

```shell
npm install -g auth0-deploy-cli
```

Then, please log in to your Auth0 account:

```shell
a0deploy login
```

Finally, to connect the CLI tool to the M2M application, we need to copy a few
environment variables from the Auth0 dashboard and use them whenever we call
the tool, e.g.:

```shell
AUTH0_DOMAIN=<YOUR_AUTH0_DOMAIN>; AUTH0_CLIENT_ID=<YOUR_AUTH0_CLIENT_ID>; AUTH0_CLIENT_SECRET=<YOUR_AUTH0_CLIENT_SECRET>; a0deploy
```

You can also add these to your `.env` file and use the `dotenv` package to load
them into your environment, or use the Auth0 Deploy CLI tool's json config
files.

Before we import the settings, we need to make an edit in the tenant.yaml file,
replacing the `AUTH0_DOMAIN` string with your Auth0 domain (e.g.
`my-maptio.eu.auth0.com`).

Now, we can import the settings for Maptio. From the repository's root folder
run:

```shell
a0deploy import --input_file scripts/auth0-config/tenant.yaml
```

Finally, we can now add the following environment variables to our `.env` file:

```shell
AUTH0_DOMAIN=<YOUR_AUTH0_DOMAIN>
AUTH0_AUDIENCE=http://localhost:4200/api/v1
AUTH0_ISSUER=https://<YOUR_AUTH0_DOMAIN>/
AUTH0_MAPTIO_API_CLIENT_ID=<Client ID for Maptio API Development application>
AUTH0_MAPTIO_API_CLIENT_SECRET=<Client Secret for Maptio API Development application>
```

The last two of those can be found in the settings of the "Maptio API
Development" application in the Auth0 dashboard. These will be used by the
server.

For the front-end application to work correctly, we also need to copy a couple
of settings from the "Maptio Development" application in the Auth0 dashboard
into the `environment.ts` file in the `apps/maptio/src/environments` folder:

```typescript
// ...
auth: {
  domain: '<YOUR_AUTH0_DOMAIN>',
  clientId: '<Client ID for Maptio Development application>',
  // ...
}
// ...
```

#### 4. Set up a local database

To keep your data locally, create a new folder in the root of the repository
called `local_data` and run the MongoDB demon pointing it to that folder:

```shell
mongod --dbpath=./local_data/
```

Next, point the app at the database by commenting out the `MONGODB_URI`
environment variable and pointing to your new database, e.g.:

```shell
#MONGODB_URI=mongodb://<PRODUCTION URI>
MONGODB_URI=mongodb://localhost:27017/maptio
```

#### 5. Install dependencies and start the Node.js server

```shell
npm install
npm start
```

#### 6. Check that the application is running correctly

Go to `http://localhost:4200` to see it in the browser.

#### 7. Troubleshooting

Here are some early tips for troubleshooting:

- During importing of the Auth0 settings via the Auth0 Deploy CLI, you might
  encounter various errors as this is a complex import, Auth0 may change their
  API, and we may not have updated or tested the settings for a while. If you
  encounter errors, they're usually easy to correct by editing the
  `tenant.yaml` file. If you're stuck, please raise an issue or add a comment
  [on #811](https://github.com/Maptio/maptio/issues/811) and we'll do our best
  to help you.
- There might also be some discussions of your issue already on
  [on #811](https://github.com/Maptio/maptio/issues/811), so that might be
  worth skimming through too, especially if you're interested in where we're at
  in our journey to becoming fully open source.
- If you're trying to set Auth0 up and have gotten to the stage where clicking
  on "log in" locally redirects you to your own Auth0 tenant (check the URL),
  but when you're redirected back to Maptio, you're still not logged in, it
  might be worth checking Auth0 logs for any errors in the configuration.

### i18n and l10n workflows

To read more about internationalisation and localisation in Maptio, see
[our wiki page on this](https://github.com/Maptio/maptio/wiki/3.-%F0%9F%8C%90-i18n-&-l10n-development-workflows)
