# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment (GitHub Pages)

The site is deployed to GitHub Pages via the `publish-docs` workflow on push to `main` (when `docs/**` or the workflow file change). The site is published to the `gh-pages` branch.

**Repo setup:** In GitHub go to **Settings → Pages → Build and deployment**: Source = **Deploy from a branch**, Branch = **gh-pages**, Folder = **/ (root)**. The site will be available at:

`https://doublesymmetry.github.io/react-native-track-player/`

To deploy manually (e.g. with SSH):

```
$ USE_SSH=true yarn deploy
```

Or with a Git user:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```
