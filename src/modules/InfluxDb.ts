import { InfluxDB } from 'influx';
import { SmartHomeDevice } from './SmartHomeDevice';
import { SmartHomeThing } from './SmartHomeThing';

/**
 * Connection options for an InfluxDB.
 */
export type InfluxDbOption = {
  host: string;
  port: number;
  database: string;
};

/**
 * Class representing a InfluxDB.
 */
export class InfluxDb extends SmartHomeDevice {
  private client?: InfluxDB;
  public initialized: boolean = false;

  /**
   * InfluxDB port.
   */
  public port: number;

  /**
   * InfluxDB database.
   */
  public database: string;

  /**
   * Create a new InfluxDB.
   * @param option Connection option.
   */
  constructor(option: InfluxDbOption) {
    super('InfluxDb', option.host);

    this.port = option.port;
    this.database = option.database;
  }

  /**
   * Initialize the InfluxDB.
   */
  initialize() {
    if (!this.initialized) {
      try {
        this.client = new InfluxDB({
          host: this.address,
          port: this.port,
          database: this.database
        });
        this.client
          .ping(5000)
          .then((hosts) => {
            if (hosts.length >= 1 && hosts[0].online) {
              this.emitConnect(`http://${this.address}:${this.port}/${this.database}`);
            } else {
              this.emitDisconnect(`http://${this.address}:${this.port}/${this.database}`);
            }
          })
          .catch((error) => {
            this.emitError(error);
          });
        this.initialized = true;
      } catch (error) {
        this.emitError(error);
      }
    }
  }

  /**
   * Write a InfluxDB measurement.
   * @param thing The smart home thing.
   * @param measurement The InfluxDB measurement.
   * @param field The value field name.
   * @param value The value itself.
   */
  send(thing: SmartHomeThing, measurement: string, field: string, value: string) {
    if (this.initialized && this.client !== undefined) {
      const data = {
        measurement: measurement,
        points: [
          {
            fields: {
              [field]: value
            },
            tags: {
              name: thing.name,
              location: `${thing.location}`,
              description: `${thing.description}`
            }
          }
        ]
      };
      this.client?.writeMeasurement(data.measurement, data.points);
      this.emitSend(`${this.address}:${this.port}`, data);
    } else {
      this.emitWarning('InfluxDB not initialized, unable to write measurement.');
    }
  }
}
