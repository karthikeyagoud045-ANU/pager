#!/usr/bin/env node

import { Command } from 'commander';
import { startServer } from './server';
import { version } from '../package.json';

const program = new Command();

program
  .name('termview')
  .description('CLI Virtual Phone Preview Tool - Real-time mobile previews in your terminal')
  .version(version)
  .argument('[dir]', 'Directory to serve', '.')
  .option('-p, --port <number>', 'Port to run the server on', '3000')
  .option('--no-qr', 'Disable QR code generation')
  .option('--host <address>', 'Host to bind to', 'localhost')
  .option('-c, --config <path>', 'Path to config file', 'termview.config.js')
  .action((dir, options) => {
    startServer({
      rootDir: dir,
      port: parseInt(options.port, 10),
      showQR: options.qr,
      host: options.host,
      configFile: options.config,
    });
  });

program.parse();
