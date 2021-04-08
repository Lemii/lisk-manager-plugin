import * as disk from 'diskusage';
import * as si from 'systeminformation';
import * as appRoot from 'app-root-path';

export const getSystemData = async () => {
  const { total: totalDisk, free: freeDisk } = await disk.check('/');
  const { total: totalMemory, free: freeMemory } = await si.mem();
  const { currentload: load } = await si.currentLoad();
  const { platform, distro, release } = await si.osInfo();
  const { uptime } = si.time();
  const cpuTemps = await si.cpuTemperature();

  return {
    os: { platform, distro, release },
    uptime,
    memory: { total: totalMemory, free: freeMemory },
    disk: { total: totalDisk, free: freeDisk },
    cpu: { temps: cpuTemps, load }
  };
};

export const getFullPath = (filename: string) => {
  return `${appRoot}/${filename}`;
};
