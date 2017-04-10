## Building
You will need [node.js](https://nodejs.org/), [Bower](http://bower.io/) and [Gulp](http://gulpjs.com/).

1. npm install
2. bower install
3. gulp

To run JavaScript (mocha) tests
1. Import web/private/demoMangoConfig.json into your Mango
2. Create web-test/config.json e.g.
{
  "url": "http://localhost:8080",
  "username": "admin",
  "password": "admin"
}
3. Run "npm test"
