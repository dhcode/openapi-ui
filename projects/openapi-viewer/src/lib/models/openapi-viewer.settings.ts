export class OavSettings {
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
   * Which value of an operation is shown in the overview navigation, in which order.
   * The first one is displayed if available, otherwise the nex one will be  chosen until a value is available.
   */
  overviewPrimaryLabel: ('summary' | 'operationId')[] = ['summary', 'operationId'];

  /**
   * Whether to show the option to display the raw operation definition on the operation page.
   */
  showRawOperationDefinition = false;

  /**
   * Show raw model definitions
   */
  showRawModelDefinition = false;

  /**
   * Whether authentication is enabled.
   * - Status is shown at operations
   * - Authentication page is shown, where a user can enter credentials
   */
  enableAuthentication = true;

  /**
   * Show the models overview page
   */
  enableModelsOverview = true;
}
export const defaultOavSettings = new OavSettings();
