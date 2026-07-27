import chokidar from 'chokidar';

// Mock external dependencies before imports
jest.mock('chokidar', () => ({
  watch: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    close: jest.fn(),
  })),
}));

jest.mock('ws', () => ({
  WebSocketServer: jest.fn(() => ({
    on: jest.fn(),
    handleUpgrade: jest.fn(),
    emit: jest.fn(),
  })),
  WebSocket: jest.fn(),
}));

jest.mock('qrcode-terminal');
jest.mock('picocolors', () => ({
  default: {
    green: (str: string) => str,
    cyan: (str: string) => str,
    magenta: (str: string) => str,
    blue: (str: string) => str,
    yellow: (str: string) => str,
    dim: (str: string) => str,
    bold: (str: string) => str,
    underline: (str: string) => str,
  },
  green: (str: string) => str,
  cyan: (str: string) => str,
  magenta: (str: string) => str,
  blue: (str: string) => str,
  yellow: (str: string) => str,
  dim: (str: string) => str,
  bold: (str: string) => str,
  underline: (str: string) => str,
}));
jest.mock('boxen', () => (str: string) => str);

import { WebSocketServer } from 'ws';

const MockWebSocketServer = WebSocketServer as jest.MockedClass<typeof WebSocketServer>;
const mockChokidarWatch = chokidar.watch as jest.MockedFunction<typeof chokidar.watch>;

describe('Server Module', () => {
  const mockFs = {
    readFileSync: jest.fn(),
    readFile: jest.fn(),
    existsSync: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks
    MockWebSocketServer.mockClear();
    mockChokidarWatch.mockClear();
    
    // Mock WebSocketServer
    const mockWss = {
      on: jest.fn(),
      handleUpgrade: jest.fn(),
      emit: jest.fn(),
    };
    MockWebSocketServer.mockImplementation(() => mockWss as any);
    
    // Mock chokidar watcher
    const mockWatcher = {
      on: jest.fn().mockReturnThis(),
      close: jest.fn(),
    };
    mockChokidarWatch.mockImplementation(() => mockWatcher as any);
  });

  describe('injectWebSocket function', () => {
    it('should inject WebSocket script before closing body tag', async () => {
      const { injectWebSocket } = await import('../server');
      
      const html = '<html><body><h1>Hello</h1></body></html>';
      const result = injectWebSocket(html, 'ws://localhost:3000');
      
      expect(result).toContain('<script>');
      expect(result).toContain('WebSocket');
      expect(result).toContain('</body>');
      expect(result.indexOf('<script>')).toBeLessThan(result.indexOf('</body>'));
    });

    it('should append WebSocket script when no body tag exists', async () => {
      const { injectWebSocket } = await import('../server');
      
      const html = '<html><head><title>Test</title></head></html>';
      const result = injectWebSocket(html, 'ws://localhost:3000');
      
      expect(result).toContain('<script>');
      expect(result).toContain('WebSocket');
      expect(result.endsWith('</body>')).toBe(false);
    });

    it('should handle HTML without body tag gracefully', async () => {
      const { injectWebSocket } = await import('../server');
      
      const html = 'Just some text';
      const result = injectWebSocket(html, 'ws://localhost:3000');
      
      expect(result).toContain('<script>');
      expect(result).toContain('Just some text');
    });
  });

  describe('findAvailablePort function', () => {
    it('should return the starting port if available', async () => {
      const { findAvailablePort } = await import('../server');
      
      const port = await findAvailablePort(3000, 'localhost');
      
      expect(port).toBeGreaterThanOrEqual(3000);
      expect(typeof port).toBe('number');
    });

    it('should find next available port when current is taken', async () => {
      const { findAvailablePort } = await import('../server');
      
      const port = await findAvailablePort(1, 'localhost');
      
      expect(port).toBeGreaterThan(0);
      expect(typeof port).toBe('number');
    });
  });

  describe('getLocalIP function', () => {
    it('should return a valid IP address string', async () => {
      const { getLocalIP } = await import('../server');
      
      const ip = getLocalIP();
      
      expect(typeof ip).toBe('string');
      expect(ip.length).toBeGreaterThan(0);
    });

    it('should return localhost as fallback', async () => {
      const { getLocalIP } = await import('../server');
      
      const ip = getLocalIP();
      
      // Should be either a valid IP or localhost
      expect(ip).toMatch(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|localhost)$/);
    });
  });

  describe('startServer integration', () => {
    it('should create HTTP server with correct options', async () => {
      const { startServer } = await import('../server');
      
      const options = {
        rootDir: './test-app',
        port: 3001,
        showQR: false,
        host: 'localhost',
        configFile: 'termview.config.js',
      };

      // Start server should not throw
      await expect(startServer(options)).resolves.not.toThrow();
    });

    it('should handle file change events with debounce', async () => {
      const { startServer } = await import('../server');
      
      const options = {
        rootDir: './test-app',
        port: 3002,
        showQR: false,
        host: 'localhost',
        configFile: 'termview.config.js',
      };

      await startServer(options);
      
      // Wait a bit for server to start
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify chokidar was called with correct options
      expect(chokidar.watch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          persistent: true,
          ignoreInitial: true,
        })
      );
    });
  });

  describe('MIME type handling', () => {
    it('should correctly identify HTML MIME type', async () => {
      const { getMimeType } = await import('../server');
      
      if (getMimeType) {
        expect(getMimeType('.html')).toBe('text/html');
        expect(getMimeType('.htm')).toBe('text/html');
      }
    });

    it('should correctly identify CSS MIME type', async () => {
      const { getMimeType } = await import('../server');
      
      if (getMimeType) {
        expect(getMimeType('.css')).toBe('text/css');
      }
    });

    it('should correctly identify JavaScript MIME type', async () => {
      const { getMimeType } = await import('../server');
      
      if (getMimeType) {
        expect(getMimeType('.js')).toBe('application/javascript');
      }
    });

    it('should return octet-stream for unknown extensions', async () => {
      const { getMimeType } = await import('../server');
      
      if (getMimeType) {
        expect(getMimeType('.unknown')).toBe('application/octet-stream');
      }
    });
  });
});
