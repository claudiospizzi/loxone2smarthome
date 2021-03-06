import { createSocket as dgramCreateSocket, Socket } from 'dgram';
import { SmartHomeDevice } from './SmartHomeDevice';
import { SmartHomeThing } from './SmartHomeThing';

/**
 * Connection options for a Loxone Miniserver.
 */
export type LoxoneMiniserverOption = {
  host: string;
  virtualInputPort: number;
  virtualOutputPort: number;
};

/**
 * Message interface to the Loxone Miniserver.
 */
export type LoxoneMiniserverMessage = {
  thing: string;
  property: string;
  value: string;
};

/**
 * Class representing a Loxone Miniserver.
 */
export class LoxoneMiniserver extends SmartHomeDevice {
  private server?: Socket;
  public initialized: boolean = false;

  /**
   * Port for the Loxone virtual input.
   */
  public viPort: number;

  /**
   * Port for the Loxone virtual output.
   */
  public voPort: number;

  /**
   * Create a new Loxone Miniserver.
   * @param option Connection option.
   */
  constructor(option: LoxoneMiniserverOption) {
    super('LoxoneMiniserver', option.host);

    this.viPort = option.virtualInputPort;
    this.voPort = option.virtualOutputPort;
  }

  /**
   * Initialize the Loxone Miniserver.
   */
  initialize() {
    if (!this.initialized) {
      try {
        this.server = dgramCreateSocket('udp4');
        this.server.on('listening', () => {
          this.emitConnect<LoxoneMiniserver>(`${this.address}:${this.viPort}`, `udp://0.0.0.0:${this.voPort}`);
        });
        this.server.on('close', () => {
          this.emitDisconnect<LoxoneMiniserver>(`${this.address}:${this.viPort}`, `udp://0.0.0.0:${this.voPort}`);
        });
        this.server.on('message', (msg, rinfo) => {
          const loxoneRegex = /^(thing|name|device|dev|d)=(?<thing>.*) (property|key|k)=(?<property>.*) (value|val|v)=(?<value>.*)$/g;
          const messageMatch = msg.toString().match(loxoneRegex);
          if (messageMatch !== undefined) {
            this.emitReceive<LoxoneMiniserver, LoxoneMiniserverMessage>(rinfo.address, {
              thing: `${messageMatch?.groups?.thing}`,
              property: `${messageMatch?.groups?.property}`,
              value: `${messageMatch?.groups?.value}`
            });
          }
        });
        this.server.on('error', (error) => {
          this.emitError<LoxoneMiniserver>(error);
          // this.server.close();
        });
        this.server.bind(this.voPort);
        this.initialized = true;
      } catch (error) {
        this.emitError<LoxoneMiniserver>(error);
      }
    }
  }

  /**
   * Send a message to the Loxone Miniserver.
   * @param thing The smart home thing.
   * @param measure The measure to send.
   * @param value The value to send.
   */
  send(thing: SmartHomeThing, property: string, value: string) {
    if (this.initialized && this.server !== undefined) {
      const message = `thing=${thing.name} property=${property} value=${value}`;
      const data = Buffer.from(message);
      this.server.send(data, this.viPort, this.address, (error) => {
        if (error === null) {
          this.emitSend<LoxoneMiniserver, LoxoneMiniserverMessage>(`${this.address}:${this.viPort}`, {
            thing: thing.name,
            property: property,
            value: value
          });
        } else {
          this.emitError<LoxoneMiniserver>(error);
        }
      });
    } else {
      this.emitWarning<LoxoneMiniserver>('Loxone Miniserver not initialized, unable to send message.');
    }
  }
}
