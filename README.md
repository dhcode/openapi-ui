# OpenAPI UI

An documentation UI and API Console with focus on [Swagger v2 and OpenAPI v3 RESTful API specifications](https://swagger.io/specification/).

This UI is inspired by the [Swagger UI](https://github.com/swagger-api/swagger-ui) project, but is more focused on doing API requests.

It is developed as Angular Library and Angular App.

## Current state

This project is currently **in development**. It is not intended for production use.
But you can try it out and see if it works with your API specification.

If you find any issues please report them. Thank you.

## Usage of the Angular App

    git clone https://github.com/dhcode/openapi-ui.git
    npm install
    npm run start

Open [localhost:4200](http://localhost:4200)

## Usage of the Angular Library

Coming soon


## Browser Compatibility

This project aims to support the most common browsers.

* Chrome
* Firefox
* Safari
* Internet Explorer 11
* Microsoft Edge

## Not supported features

* Example values for XML

## TODO

* Integrate OAuth authentication support
* Show JSON Schema description
* Show generated commandline for curl
* Show generated code for JavaScript and other languages
* Setup CI build with Github pages deployment
* Increase test coverage

## Other libraries used

* [ngx-ace-wrapper](https://github.com/zefoy/ngx-ace-wrapper) + [brace](https://github.com/thlorenz/brace) + [ace](https://github.com/ajaxorg/ace) to show nicely formatted code
* [ngx-markdown](https://github.com/jfcere/ngx-markdown) + [marked](https://github.com/markedjs/marked) to show nicely formatted descriptions, if markdown was used in a specification
* [swagger-client](https://github.com/swagger-api/swagger-js) to parse specifications and to create HTTP requests based on parameters
* [openapi3-ts](https://github.com/metadevpro/openapi3-ts) for OpenAPI specification typings

## License

[MIT](LICENSE)
