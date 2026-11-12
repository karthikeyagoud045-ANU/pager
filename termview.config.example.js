// TermView Configuration Example
// Copy this file to termview.config.js in your project root

module.exports = {
  // Directory to serve (default: '.')
  rootDir: './dist',
  
  // Port to run the server on (default: 3000)
  port: 3000,
  
  // Host to bind to (default: 'localhost')
  // Use '0.0.0.0' to allow network access
  host: 'localhost',
  
  // Show QR code for device testing (default: true)
  showQR: true,
  
  // Additional ignore patterns for file watching
  // These are added to the default ignores:
  // - **/node_modules/**
  // - **/.git/**
  // - **/dist/**
  // - **/build/**
  ignore: [
    '**/*.test.js',
    '**/*.spec.ts',
    '**/coverage/**',
    '**/*.log'
  ]
};
