import fs from 'fs';
import path from 'path';

export interface TermViewConfig {
  rootDir: string;
  port: number;
  host: string;
  showQR: boolean;
  ignore?: string[];
}

const defaultConfig: TermViewConfig = {
  rootDir: '.',
  port: 3000,
  host: 'localhost',
  showQR: true,
  ignore: [],
};

export async function getConfig(configFile: string, cliOptions: any): Promise<TermViewConfig> {
  const configPath = path.resolve(process.cwd(), configFile);
  let fileConfig: Partial<TermViewConfig> = {};

  // Try to load config file
  if (fs.existsSync(configPath)) {
    try {
      const configModule = await import(configPath);
      fileConfig = configModule.default || configModule;
    } catch (error) {
      console.warn(`Warning: Could not load config file ${configFile}`);
    }
  }

  // Merge configs: CLI options > file config > defaults
  return {
    ...defaultConfig,
    ...fileConfig,
    rootDir: cliOptions.rootDir || fileConfig.rootDir || defaultConfig.rootDir,
    port: cliOptions.port || fileConfig.port || defaultConfig.port,
    host: cliOptions.host || fileConfig.host || defaultConfig.host,
    showQR: cliOptions.showQR !== undefined ? cliOptions.showQR : (fileConfig.showQR ?? defaultConfig.showQR),
  };
}
