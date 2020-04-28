# OpenAPI Viewer Web Component

[![npm](https://img.shields.io/npm/v/@dhcode/openapi-viewer-element.svg)](https://www.npmjs.com/package/@dhcode/openapi-viewer-element)

This Web component contains an UI to show API documentation based on [Swagger v2 and OpenAPI v3 RESTful API specifications](https://swagger.io/specification/).

This UI is inspired by the [Swagger UI](https://github.com/swagger-api/swagger-ui) project, but is more focused on doing API requests.

**[Demo](https://dhcode.github.io/openapi-ui/)**

## Usage

You can install it and use it from node_modules or include to from a CDN.

    npm install @dhcode/openapi-viewer-element

    <oav-openapi-viewer specurl="https://petstore.swagger.io/v2/swagger.json">
    <script src="node_modules/@dhcode/openapi-viewer-element/openapi-viewer-element-es2015.js" type="module"></script>
    <script src="node_modules/@dhcode/openapi-viewer-element/openapi-viewer-element-es5.js" nomodule defer></script>

You can use any Swagger v2 json file or OpenAPI v3 json or yaml file to load a specification.

## CDN Example
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>API Docs</title>
    <style>
      body {
        font-family: sans-serif;
        margin: 0;
        padding: 0;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <oav-openapi-viewer-element
      specurl="https://petstore.swagger.io/v2/swagger.json"
      settings='{"showRawOperationDefinition":true}'
    ></oav-openapi-viewer-element>
    <script src="//unpkg.com/@dhcode/openapi-viewer-element/openapi-viewer-element-es2015.js" type="module"></script>
    <script src="//unpkg.com/@dhcode/openapi-viewer-element/openapi-viewer-element-es5.js" nomodule defer></script>
  </body>
</html>
```

## Configuration options

See [openapi-viewer.settings.ts](../openapi-viewer/src/lib/models/openapi-viewer.settings.ts)

## License

[MIT](../../LICENSE)
