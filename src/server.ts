import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import chokidar from 'chokidar';
import qrCode from 'qrcode-terminal';
import chalk from 'picocolors';
import boxen from 'boxen';
import { getConfig, TermViewConfig } from './config';

const INJECT_SCRIPT = `
<script>
(function() {
  var ws = new WebSocket('ws://' + location.host + '/ws');
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);
    if (data.type === 'reload') {
      console.log('[TermView] Reloading...');
      window.location.reload();
    }
  };
})();
<\/script>
`;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

export function getMimeType(ext: string): string {
  return MIME_TYPES[ext] || 'application/octet-stream';
}

export function findAvailablePort(startPort: number, host: string): Promise<number> {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(startPort, host, () => {
      server.close(() => resolve(startPort));
    });
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1, host));
    });
  });
}

export function getLocalIP(): string {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const ifaceList = interfaces[name];
    if (!ifaceList) continue;
    for (const iface of ifaceList) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

export function injectWebSocket(html: string, wsUrl: string): string {
  if (!html.includes('</body>')) {
    return html + INJECT_SCRIPT;
  }
  return html.replace('</body>', INJECT_SCRIPT + '</body>');
}

export interface ServerOptions {
  rootDir: string;
  port: number;
  showQR: boolean;
  host: string;
  configFile: string;
}

export async function startServer(options: ServerOptions): Promise<void> {
  const config: TermViewConfig = await getConfig(options.configFile, options);
  
  const rootDir = path.resolve(process.cwd(), config.rootDir);
  let port = config.port;
  const host = config.host;

  // Find available port if the specified one is taken
  if (host !== 'localhost') {
    port = await findAvailablePort(port, host);
  }

  // Create HTTP server
  const server = http.createServer((req, res) => {
    const urlPath = req.url === '/' ? '/index.html' : (req.url || '/');
    const filePath = path.join(rootDir, urlPath);

    // Check if file exists and serve it
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = getMimeType(ext);
      
      let content = data;
      if (ext === '.html') {
        content = Buffer.from(injectWebSocket(data.toString(), `ws://${host}:${port}`));
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });

  // Create WebSocket server
  const wss = new WebSocketServer({ noServer: true });
  const clients = new Set<WebSocket>();

  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url;
    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(chalk.green('📱 Device connected'));

    ws.on('close', () => {
      clients.delete(ws);
      console.log(chalk.yellow('📱 Device disconnected'));
    });
  });

  // Start server
  server.listen(port, host, () => {
    const localUrl = `http://${host}:${port}`;
    const networkIp = getLocalIP();
    const networkUrl = `http://${networkIp}:${port}`;

    console.clear();
    
    const message = boxen(
      `${chalk.bold(chalk.green('⚡ TermView'))} ${chalk.dim('v1.0.0')}\n\n` +
      `${chalk.cyan('🚀 Server Running on')} ${chalk.underline(localUrl)}\n` +
      `${chalk.cyan('🌐 Network:')}   ${chalk.underline(networkUrl)}\n\n` +
      `${chalk.magenta('📂 Watching:')} ${rootDir}\n` +
      `${chalk.blue('👥 Devices:')} 0`,
      {
        padding: 1,
        borderColor: 'cyan',
        borderStyle: 'round',
      }
    );

    console.log(message);

    // Generate QR code if enabled
    if (config.showQR) {
      console.log(chalk.cyan('\n📱 Scan QR for Real Device:'));
      qrCode.generate(networkUrl, { small: true }, (qr: string) => {
        console.log(qr);
      });
    }

    console.log(chalk.dim('\n[q] Quit  [r] Reload  [o] Open Browser  [h] Help\n'));
  });

  // File watching with debounce
  const ignored = ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', ...(config.ignore || [])];
  
  const watcher = chokidar.watch(rootDir, {
    ignored,
    persistent: true,
    ignoreInitial: true,
  });

  let reloadTimeout: NodeJS.Timeout | null = null;

  const triggerReload = (filePath: string) => {
    if (reloadTimeout) {
      clearTimeout(reloadTimeout);
    }

    reloadTimeout = setTimeout(() => {
      const relativePath = path.relative(rootDir, filePath);
      console.log(chalk.green(`[${new Date().toLocaleTimeString()}] ${relativePath} updated. Reloading ${clients.size} devices.`));
      
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'reload', path: relativePath }));
        }
      });
    }, 100); // 100ms debounce
  };

  watcher
    .on('change', (filePath) => triggerReload(filePath))
    .on('add', (filePath) => {
      const relativePath = path.relative(rootDir, filePath);
      console.log(chalk.green(`[${new Date().toLocaleTimeString()}] ${relativePath} added`));
      triggerReload(filePath);
    })
    .on('unlink', (filePath) => {
      const relativePath = path.relative(rootDir, filePath);
      console.log(chalk.yellow(`[${new Date().toLocaleTimeString()}] ${relativePath} removed`));
      triggerReload(filePath);
    });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\nShutting down TermView...'));
    watcher.close();
    clients.forEach((client) => client.close());
    server.close(() => {
      console.log(chalk.green('Server closed'));
      process.exit(0);
    });
  });
}
