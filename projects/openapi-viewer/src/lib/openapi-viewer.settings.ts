export class OavSettings {
  static default: OavSettings;

  constructor(overwriteSettings?: Partial<OavSettings>) {
    if (overwriteSettings) {
      Object.assign(this, overwriteSettings);
    }
  }

  /**
   * Which value of an operation is shown in the index navigation, in which order.
   * The first one is displayed if available, otherwise the nex one will be  chosen until a value is available.
   */
  indexPrimaryLabel: ('summary' | 'operationId' | 'path')[] = ['summary', 'operationId', 'path'];

  /**
   * Which value is shown in the index navigation on hover.
   */
  indexHoverLabel: ('summary' | 'operationId' | 'path')[] | null = ['path'];

  /**
   * Whether to show the option to display the raw operation definition on the operation page.
   */
  showRawOperationDefinition = false;
}
OavSettings.default = new OavSettings();
