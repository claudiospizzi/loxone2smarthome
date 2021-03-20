import { EventEmitter } from 'events';
import { Logger } from 'tslog';

/**
 * Arguments of a connect event.
 */
export type ConnectArgs = {
  source: SmartHomeDevice;
};

/**
 * Arguments of a connect event.
 */
export type DisconnectArgs = {
  source: SmartHomeDevice;
};

/**
 * Arguments of an informational event.
 */
export type InfoArgs = {
  source: SmartHomeDevice;
  message: string;
};

/**
 * Arguments of a warning event.
 */
export type WarningArgs = {
  source: SmartHomeDevice;
  message: string;
};

/**
 * Arguments of an error event.
 */
export type ErrorArgs = {
  source: SmartHomeDevice;
  message: string;
  error: Error;
};

/**
 * Arguments of a send event.
 */
export type SendArgs<T> = {
  source: SmartHomeDevice;
  sendTo: string;
  message: T;
};

/**
 * Arguments of a receive event.
 */
export type ReceiveArgs<T> = {
  source: SmartHomeDevice;
  receiveFrom: string;
  message: T;
};

/**
 * Base class to interact with smart home systems and devices.
 */
export abstract class SmartHomeDevice extends EventEmitter {
  protected log: Logger;

  /**
   * IP address or hostname of the device.
   */
  public address: string;

  /**
   * Create a smart home system or device.
   * @param type The smart home system or device type.
   * @param address The device IP address or hostname.
   */
  constructor(type: string, address: string) {
    super();

    this.address = address;

    this.log = new Logger({ name: type, prefix: [`(${this.address})`], ignoreStackLevels: 4 });
  }

  /**
   * Emit a connect event.
   */
  protected emitConnect(connectTo?: string, bindOn?: string) {
    const args: ConnectArgs = {
      source: this
    };
    this.emit('connect', args);
    if (connectTo !== undefined) {
      this.log.debug(`Connect to ${connectTo}`);
    }
    if (bindOn !== undefined) {
      this.log.debug(`Bind on ${bindOn}`);
    }
  }

  /**
   * Emit a disconnect event.
   */
  protected emitDisconnect(disconnectFrom?: string, unbindFrom?: string) {
    const args: DisconnectArgs = {
      source: this
    };
    this.emit('disconnect', args);
    if (disconnectFrom !== undefined) {
      this.log.debug(`Disconnect from ${disconnectFrom}`);
    }
    if (unbindFrom !== undefined) {
      this.log.debug(`Unbind from ${unbindFrom}`);
    }
  }

  /**
   * Emit an informational event.
   * @param message The info message.
   */
  protected emitInfo(message: string) {
    this.emit('info', { source: this, message: message } as InfoArgs);
    this.log.info(message);
  }

  /**
   * Emit a warning event.
   * @param message The warning message.
   */
  protected emitWarning(message: string) {
    this.emit('warning', { source: this, message: message } as WarningArgs);
    this.log.warn(message);
  }

  /**
   * Emit an error event.
   * @param error The error object.
   */
  protected emitError(error: Error) {
    this.emit('warning', { source: this, message: `${error}`, error: error } as ErrorArgs);
    this.log.error(error);
  }
  
  /**
   * Emit a send event.
   * @param to Target where the data was delivered.
   * @param object The sent object.
   */
  protected emitSend<T>(sendTo: string, message: T) {
    this.emit('send', { source: this, sendTo: sendTo, message: message } as SendArgs<T>);
    this.log.info(`Send to ${sendTo} => ${message}`);
  }

  /**
   * Emit a receive event.
   * @param from Source of the received data.
   * @param object The received object.
   */
  protected emitReceive<T>(receiveFrom: string, message: T) {
    this.emit('receive', { source: this, receiveFrom: receiveFrom, message: message } as ReceiveArgs<T>);
    this.log.info(`Received from ${receiveFrom} => ${message}`);
  }
}
