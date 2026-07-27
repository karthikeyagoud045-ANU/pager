import { getConfig, TermViewConfig } from '../config';
import fs from 'fs';
import path from 'path';

// Mock fs module
jest.mock('fs');

declare global {
  // eslint-disable-next-line no-var
  var importMock: any;
}

describe('Config Module', () => {
  const mockCwd = '/mock/cwd';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getConfig', () => {
    it('should return default config when no config file or CLI options provided', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await getConfig('termview.config.js', {});

      expect(result).toEqual({
        rootDir: '.',
        port: 3000,
        host: 'localhost',
        showQR: true,
        ignore: [],
      });
    });

    it('should merge CLI options over defaults', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await getConfig('termview.config.js', {
        port: 8080,
        rootDir: './src',
        host: '0.0.0.0',
      });

      expect(result.port).toBe(8080);
      expect(result.rootDir).toBe('./src');
      expect(result.host).toBe('0.0.0.0');
      expect(result.showQR).toBe(true); // default
    });

    it('should load config from file when it exists', async () => {
      const mockConfig = {
        port: 9000,
        rootDir: './app',
        showQR: false,
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);

      // Mock dynamic import using a different approach
      const originalRequire = require;
      jest.doMock(path.join(mockCwd, 'termview.config.js'), () => mockConfig, { virtual: true });

      const result = await getConfig('termview.config.js', {});

      expect(result.port).toBe(9000);
      expect(result.rootDir).toBe('./app');
      expect(result.showQR).toBe(false);

      jest.dontMock(path.join(mockCwd, 'termview.config.js'));
    });

    it('should prioritize CLI options over file config', async () => {
      const mockConfig = {
        port: 9000,
        rootDir: './app',
        showQR: false,
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await getConfig('termview.config.js', {
        port: 3001,
        showQR: true,
      });

      expect(result.port).toBe(3001); // CLI overrides file
      expect(result.rootDir).toBe('./app'); // from file
      expect(result.showQR).toBe(true); // CLI overrides file
    });

    it('should handle config file load errors gracefully', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await getConfig('termview.config.js', {});

      expect(result.port).toBe(3000); // fallback to default
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: Could not load config file')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle config file with CommonJS exports', async () => {
      const mockConfig = {
        port: 4000,
        host: '127.0.0.1',
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await getConfig('termview.config.js', {});

      expect(result.port).toBe(4000);
      expect(result.host).toBe('127.0.0.1');
    });
  });

  describe('defaultConfig', () => {
    it('should have correct default values', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await getConfig('termview.config.js', {});

      expect(result).toMatchObject({
        rootDir: '.',
        port: 3000,
        host: 'localhost',
        showQR: true,
      });

      expect(Array.isArray(result.ignore)).toBe(true);
      expect(result.ignore).toHaveLength(0);
    });
  });
});
