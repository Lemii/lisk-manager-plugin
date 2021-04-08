import { BaseChannel } from 'lisk-sdk';
import { createLogger } from 'lisk-framework/dist-node/logger/logger';
import { getFullPath } from '../utils';
import { logFileName, alias } from '../defaults';
import { Options } from '../types';

export const getNodeInfo = (channel: BaseChannel): Promise<Object> => {
  return channel.invoke('app:getNodeInfo');
};

export const initializeLogger = (options?: Options) => {
  return createLogger({
    fileLogLevel: 'info',
    consoleLogLevel: 'debug',
    logFilePath: getFullPath(options?.logFileName || logFileName),
    module: alias
  });
};
