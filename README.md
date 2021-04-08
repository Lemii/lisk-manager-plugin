# @lemii/lisk-manager-plugin

> This plugin is meant to be used in conjunction with the `Lisk Manager Client` (coming Soon™).

The Lisk Manager Plugin provides system and forger statistics of your Lisk node and allows you to easily manage it through an external client.

## Installation

#### Install package

```sh
$ npm install --save @lemii/lisk-manager-plugin
```

#### Import plugin

```ts
import { ManagerPlugin } from '@lemii/lisk-manager-plugin';
```

#### Register plugin

```ts
app.registerPlugin(ManagerPlugin);
```

#### Register plugin with custom options

```ts
app.registerPlugin(ManagerPlugin, {
  interval: 3000,
  // The frequency of the polling interval in milliseconds
  logFileName: 'lmp.log',
  // The filename of the log file
  configFileName: 'lmp-config.json',
  // The filename of the config file
  saveExternalChanges: false,
  // Enables persistence of changes triggered by an external source (eg: changing interval frequency from the Lisk Manager Client)
  overruleFile: false
  // Ignore (overrule) any existing persistent config file (where applicable)
});
```

## Usage

> This plugin is meant to be used in conjunction with the `Lisk Manager Client` (coming Soon™).

- Establish a WebSocket connection to the node
- Monitor published messages on the following channels:
  - `manager:statsUpdate`
  - `manager:queueUpdate`
  - `manager:toggleForging`
- Invocate actions using the following keywords:
  - `manager:updateInterval`
  - `manager:toggleForging`

Example `manager:updateInterval` payload:

```ts
{
  ms: 3000;
}
```

Example `manager:toggleForging` payload:

```ts
{
  address: "9cabee3d27426676b852ce6b804cb2fdff7cd0b5",
  password: "elephant tree paris dragon chair galaxy",
  forging: true,
  height: 0,
  maxHeightPreviouslyForged: 0,
  maxHeightPrevoted: 0,
}
```

```ts
{
  address: "9cabee3d27426676b852ce6b804cb2fdff7cd0b5",
  password: "elephant tree paris dragon chair galaxy",
  forging: false,
}
```
