import { Options, PluginConfig } from '../types';
import * as fs from 'fs';
import { configFileName, interval, logFileName, saveExternalChanges, overruleFile } from '../defaults';
import { Logger } from 'lisk-framework/dist-node/logger/logger';
import { getFullPath } from './system';

const fsPromises = fs.promises;

export const getConfig = async (options?: Options): Promise<PluginConfig> => {
  let config: PluginConfig;

  if (options?.overruleFile) {
    return getConfigFromOptionsOrDefault(options);
  }

  try {
    const file: PluginConfig = await fsPromises
      .readFile(getFullPath(configFileName), 'utf-8')
      .then((data) => JSON.parse(data));

    config = file;
  } catch {
    config = getConfigFromOptionsOrDefault(options);
  }

  return config;
};

export const setConfig = async (params: Partial<PluginConfig>, options?: Options) => {
  const currentConfig = await getConfig(options);

  const updatedConfig = {
    ...currentConfig,
    ...params
  };

  const shouldSaveToFile =
    (options?.saveExternalChanges !== undefined && options?.saveExternalChanges) ||
    (options?.saveExternalChanges === undefined && saveExternalChanges);

  if (shouldSaveToFile) {
    fsPromises.writeFile(getFullPath(currentConfig.configFileName), JSON.stringify(updatedConfig, null, 2));
  }
};

export const getConfigFromOptionsOrDefault = (options?: Options) => {
  return {
    interval: options?.interval || interval,
    logFileName: options?.logFileName || logFileName,
    configFileName: options?.configFileName || configFileName,
    saveExternalChanges: options?.saveExternalChanges !== undefined ? options.saveExternalChanges : saveExternalChanges,
    overruleFile: options?.overruleFile !== undefined ? options.overruleFile : overruleFile
  };
};

export const validateOptions = (options: any, logger: Logger) => {
  logger.debug('Validating custom options file...');

  const filenameRegex = /.*\..*/;

  const { configFileName, interval, logFileName } = options;

  if (
    (configFileName && typeof configFileName !== 'string') ||
    (configFileName && !configFileName.match(filenameRegex))
  ) {
    const error = `Invalid value for 'configFileName' field`;
    logger.error(error);
    throw new Error(error);
  }

  if ((logFileName && typeof logFileName !== 'string') || (logFileName && !logFileName.match(filenameRegex))) {
    const error = `Invalid value for 'logFileName' field`;
    logger.error(error);
    throw new Error(error);
  }

  if (interval && typeof interval !== 'number') {
    const error = `Invalid value for 'interval' field`;
    logger.error(error);
    throw new Error(error);
  }

  logger.debug('Custom options successfully verified');
};
