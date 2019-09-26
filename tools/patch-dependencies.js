const fs = require('fs');

const patches = [
  {
    filePath: 'node_modules/openapi3-ts/src/model/SpecificationExtension.ts',
    patch(content) {
      if(!content.includes('// @dynamic')) {
        return content.replace('export class SpecificationExtension', '// @dynamic\nexport class SpecificationExtension');
      } else {
        return content;
      }
    }
  }
];

for(const patch of patches) {
  console.log('Patch file:', patch.filePath);
  const content = fs.readFileSync(patch.filePath, {encoding: 'utf8'});
  const patched = patch.patch(content);
  fs.writeFileSync(patch.filePath, patched, {encoding: 'utf8'});
}
