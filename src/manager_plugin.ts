import { getSystemData, getConfig, setConfig, validateOptions } from './utils';
import { getForgingQueue, getForgingStatus, getNodeInfo, initializeLogger, toggleForging } from './handlers';
import { ActionsDefinition, BasePlugin, BaseChannel, EventsDefinition, PluginInfo } from 'lisk-sdk';
import { alias } from './defaults';
import { Logger } from 'lisk-framework/dist-node/logger/logger';
import { PluginConfig, Options } from './types';

const packageJSON = require('../package.json');

export class ManagerPlugin extends BasePlugin {
  private _channel!: BaseChannel;
  private _intervalId: NodeJS.Timeout | undefined;
  private _config!: PluginConfig;
  private _logger!: Logger;

  public static get alias(): string {
    return alias;
  }

  public static get info(): PluginInfo {
    return {
      author: packageJSON.author,
      version: packageJSON.version,
      name: packageJSON.name
    };
  }

  public get defaults(): Record<string, unknown> {
    return {};
  }

  public get events(): EventsDefinition {
    return ['statsUpdate', 'queueUpdate', 'toggleForging'];
  }

  public get actions(): ActionsDefinition {
    return {
      updateInterval: this._updateInterval,
      triggerAll: this._triggerAll,
      toggleForging: (params) => toggleForging(this._channel, this._logger, params)
    };
  }

  public async load(channel: BaseChannel) {
    this._channel = channel;
    this._logger = initializeLogger(this.options);

    if (this.options) {
      validateOptions(this.options as Options, this._logger);
    }

    this._config = await getConfig(this.options);

    channel.once('app:ready', () => {
      this._publishNewQueue();
      this._setPublishStatsInterval();
      this._subscribeToNewBlockEvent();
    });
  }

  public async unload() {
    this._cleanUpInterval();
    this._intervalId = undefined;
  }

  private async _publishStats() {
    const systemData = await getSystemData();
    const nodeInfo = await getNodeInfo(this._channel);
    const forgingStatus = await getForgingStatus(this._channel);

    this._channel.publish(`manager:statsUpdate`, { systemData, nodeInfo, forgingStatus });
    this._logger.debug(`Publishing statistics (interval ${this._config.interval}ms)`);
  }

  private async _publishNewQueue() {
    const forgers = await getForgingQueue(this._channel, this.codec);
    this._channel.publish(`manager:queueUpdate`, { forgers });
  }

  private _subscribeToNewBlockEvent() {
    this._channel.subscribe('app:block:new', () => {
      this._publishNewQueue();
    });
  }

  private _updateInterval = (params?: any) => {
    this._cleanUpInterval();

    this._logger.info('Interval update triggered from external client');

    if (!params?.ms || typeof params.ms !== 'number') {
      throw new Error('Invalid ms param');
    }

    const ms = params.ms as number;
    this._config.interval = ms;

    this._setPublishStatsInterval();
    setConfig({ interval: ms }, this.options);
  };

  private _triggerAll = () => {
    this._publishStats();
    this._publishNewQueue();
  };

  private _setPublishStatsInterval() {
    const ms = this._config.interval;

    this._intervalId = setInterval(async () => {
      this._publishStats();
    }, ms);

    this._logger.info(`Interval set to ${ms}ms`);
  }

  private _cleanUpInterval() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }
  }
}
