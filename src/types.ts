import * as si from 'systeminformation';
import { ForgingStatus } from 'lisk-sdk';

export * from './';

export type SystemData = {
  os: {
    platform: string;
    distro: string;
    release: string;
  };
  uptime: number;
  memory: {
    total: number;
    free: number;
  };
  disk: {
    total: number;
    free: number;
  };
  cpu: {
    temps: si.Systeminformation.CpuTemperatureData;
    load: number;
  };
};

export type Account = {
  dpos: {
    delegate: {
      username: string;
      totalVotesReceived: string;
    };
  };
};

export type Forger = {
  address: string;
  isConsensusParticipant: boolean;
  minActiveHeight: number;
  nextForgingTime: number;
  totalVotesReceived: string;
  username: string;
};

export type NodeInfo = {
  finalizedHeight: number;
  height: number;
  lastBlockID: string;
  networkIdentifier: string;
  networkVersion: string;
  syncing: boolean;
  unconfirmedTransactions: number;
  version: string;
};

export type Stats = {
  systemData: SystemData;
  nodeInfo: NodeInfo;
  forgingStatus: ForgingStatus;
};

export type Queue = {
  forgers: Forger[];
};

export type PluginConfig = {
  interval: number;
  logFileName: string;
  configFileName: string;
  overruleFile: boolean;
  saveExternalChanges: boolean;
};

export type Options = Partial<PluginConfig>;

export { ManagerPlugin } from './manager_plugin';
