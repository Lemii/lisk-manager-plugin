import { BaseChannel, ForgingStatus, PluginCodec } from 'lisk-sdk';
import { Account } from '../types';
import { Logger } from 'lisk-framework/dist-node/logger/logger';

import { isHexString } from '@liskhq/lisk-validator';

const validateToggleForgingData = (params: any) => {
  const errors: string[] = [];

  const { address, password, forging, height, maxHeightPreviouslyForged, maxHeightPrevoted, overwrite } = params;

  if (!isHexString(address)) {
    errors.push('The address parameter should be a hex string.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('The password parameter should be of type string');
  }

  if (forging === undefined || typeof forging !== 'boolean') {
    errors.push('The forging parameter should be of type boolean.');
  }

  if (height && height < 0) {
    errors.push('The height parameter should not be less than zero');
  }

  if (maxHeightPreviouslyForged && maxHeightPreviouslyForged < 0) {
    errors.push('The height parameter should not be less than zero');
  }

  if (maxHeightPrevoted && maxHeightPrevoted < 0) {
    errors.push('The height parameter should not be less than zero');
  }

  return errors;
};

export const getForgingQueue = async (channel: BaseChannel, codec: PluginCodec) => {
  const forgersFrameworkInfo: ReadonlyArray<{ address: string; forging: boolean }> = await channel.invoke(
    'app:getForgers'
  );
  const forgerAccounts = await channel.invoke<string[]>('app:getAccounts', {
    address: forgersFrameworkInfo.map((info) => info.address)
  });

  const queue = forgerAccounts.map((forger, i) => {
    const account = codec.decodeAccount<Account>(forgerAccounts[i]);

    return {
      username: account.dpos.delegate.username,
      totalVotesReceived: account.dpos.delegate.totalVotesReceived,
      ...forgersFrameworkInfo[i]
    };
  });

  return queue;
};

export const getForgingStatus = async (channel: BaseChannel): Promise<Object> => {
  const statusArray: ForgingStatus[] = await channel.invoke('app:getForgingStatus');
  return statusArray[0];
};

export const toggleForging = async (channel: BaseChannel, logger: Logger, params?: any) => {
  const errors = validateToggleForgingData(params);

  if (errors.length) {
    logger.warn(`Toggle forging request data contained ${errors.length} errors:`);
    channel.publish(`manager:toggleForging`, { result: errors });
    return;
  }

  const { address, password, forging, height, maxHeightPreviouslyForged, maxHeightPrevoted, overwrite } = params;

  const result = await channel.invoke('app:updateForgingStatus', {
    address,
    password,
    forging,
    height: height || 0,
    maxHeightPreviouslyForged: maxHeightPreviouslyForged || 0,
    maxHeightPrevoted: maxHeightPrevoted || 0,
    overwrite
  });

  channel.publish(`manager:toggleForging`, { result });
};
