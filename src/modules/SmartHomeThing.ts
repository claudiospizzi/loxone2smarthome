import { SmartHomeDevice } from './SmartHomeDevice';

/**
 * Base class to interact with a Loxone controlled smart home thing.
 */
export abstract class SmartHomeThing extends SmartHomeDevice {
  /**
   * The identifier for the thing. If not specified, the address is used.
   */
  public name: string;

  /**
   * Location or room of the thing within the smart home.
   */
  public location: string;

  /**
   * Optional thing description.
   */
  public description: string;

  /**
   * Create a smart home thing.
   * @param type The smart home thing type.
   * @param address The thing IP address or hostname.
   * @param name The thing name. Can be the address.
   * @param location The thing location. Can be an empty string.
   * @param description The thing description. Can be an empty string.
   */
  constructor(type: string, address: string, name: string, location: string, description: string) {
    super(type, address);

    this.name = name;
    this.location = location;
    this.description = description;
  }
}
