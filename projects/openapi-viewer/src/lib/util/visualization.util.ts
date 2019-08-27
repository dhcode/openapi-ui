import { OperationsItem, PathItem } from '../models/openapi-viewer.model';

export function getLabel(op: OperationsItem, pathItem: PathItem, fields: string[]): string {
  for (const field of fields) {
    if (field === 'path') {
      return pathItem.path;
    }
    if (op.operation[field]) {
      return op.operation[field];
    }
  }
  return '';
}
