## Building
This module uses [Webpack](https://webpack.js.org/) to bundle the front end files before the module
is compiled and packaged using [Maven](https://maven.apache.org/).

# Production build
As a bare minimum to do a production build you will need to install [Maven](https://maven.apache.org/).
From the module working directory run `mvn install`, the module zip file will be in the `maven-target` folder.

This works by the by using the [frontend-maven-plugin](https://github.com/eirslett/frontend-maven-plugin) to install a local copy
of Node.js and run the commands below.

# Developer build - webpack development mode build
You will need [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/).

Then run:
1. `yarn install`
2. `yarn run webpack --mode development`

This will run Webpack using the development mode. You may also want to try Webpack's `watch` option:
1. `yarn run webpack --mode development --watch`

Alternatively you build the whole .zip file for the module with development mode turned on by running
`mvn install -Dwebpack.mode=development`
