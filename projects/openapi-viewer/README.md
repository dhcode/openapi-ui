# OpenAPI Viewer Angular Component Library

[![npm](https://img.shields.io/npm/v/@dhcode/openapi-viewer.svg)](https://www.npmjs.com/package/@dhcode/openapi-viewer)

This Angular library contains components to show API documentation based on [Swagger v2 and OpenAPI v3 RESTful API specifications](https://swagger.io/specification/).

This UI is inspired by the [Swagger UI](https://github.com/swagger-api/swagger-ui) project, but is more focused on doing API requests.

**[Demo](https://dhcode.github.io/openapi-ui/)**

## Usage

    npm install @dhcode/openapi-viewer
    
Add the `OpenapiViewerModule` to your module `imports`.

Add the `oav-openapi-viewer` component to your template.

    <oav-openapi-viewer specUrl="https://petstore.swagger.io/v2/swagger.json">

You can use any Swagger v2 json file or OpenAPI v3 json or yaml file to load a specification.

## Provide configuration

To supply custom settings, you can provide them in your module `providers`.

    {
      provide: OavSettings,
      useValue: new OavSettings({
        showRawOperationDefinition: true,
        showRawModelDefinition: true
      })
    }

## License

[MIT](../../LICENSE)
