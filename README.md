# OpenAPI UI

[![CircleCI](https://img.shields.io/circleci/build/gh/dhcode/openapi-ui.svg)](https://circleci.com/gh/dhcode/openapi-ui)
[![Codecov](https://img.shields.io/codecov/c/github/dhcode/openapi-ui.svg)](https://codecov.io/gh/dhcode/openapi-ui)

A documentation UI and API Console with focus on [Swagger v2 and OpenAPI v3 RESTful API specifications](https://swagger.io/specification/).

This UI is inspired by the [Swagger UI](https://github.com/swagger-api/swagger-ui) project, but is more focused on doing API requests.

**[Demo](https://dhcode.github.io/openapi-ui/)**

It is developed as Angular Library and Angular App.

## Current state

This project is in its early stages. You can try it out and see if it works with your API specification.

If you find any issues please report them. Thank you.

## Usage of the Web component (custom element)

See [Web component README](projects/openapi-viewer-element/README.md)

```html
<oav-openapi-viewer-element
  specurl="https://petstore.swagger.io/v2/swagger.json"
  settings='{"showRawOperationDefinition":true}'
></oav-openapi-viewer-element>
<script src="//unpkg.com/@dhcode/openapi-viewer-element/openapi-viewer-element-es2015.js" type="module"></script>
<script src="//unpkg.com/@dhcode/openapi-viewer-element/openapi-viewer-element-es5.js" nomodule defer></script>
```


## Usage of the Angular Library

See [Angular library README](projects/openapi-viewer/README.md)


## Usage of the Angular App (for development)

    git clone https://github.com/dhcode/openapi-ui.git
    npm install
    npm run start

Open [localhost:4200](http://localhost:4200)


## Browser Compatibility

This project aims to support the most common browsers.

- Chrome
- Firefox
- Safari
- Internet Explorer 11
- Microsoft Edge

## Not supported features

- Example values for XML

## TODO

- Integrate support for [links](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#linkObject)
- Show generated commandline for curl
- Show generated code for JavaScript and other languages
- Increase test coverage
- Publish library to npm

## Other libraries used

- [ngx-ace-wrapper](https://github.com/zefoy/ngx-ace-wrapper) + [brace](https://github.com/thlorenz/brace) + [ace](https://github.com/ajaxorg/ace) to show nicely formatted code
- [ngx-markdown](https://github.com/jfcere/ngx-markdown) + [marked](https://github.com/markedjs/marked) to show nicely formatted descriptions, if markdown was used in a specification
- [swagger-client](https://github.com/swagger-api/swagger-js) to parse specifications and to create HTTP requests based on parameters
- [openapi3-ts](https://github.com/metadevpro/openapi3-ts) for OpenAPI specification typings

## License

[MIT](LICENSE)
