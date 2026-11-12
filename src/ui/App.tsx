import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';

interface AppProps {
  serverUrl?: string;
  networkUrl?: string;
  deviceCount?: number;
  watchedDir?: string;
}

export const App: React.FC<AppProps> = ({
  serverUrl = 'http://localhost:3000',
  networkUrl = 'http://192.168.1.10:3000',
  deviceCount = 0,
  watchedDir = './',
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text bold color="green">
          ⚡ TermView
        </Text>
        <Text dimColor> v1.0.0</Text>
      </Box>

      <Box height={1} />

      {/* Server Info */}
      <Box flexDirection="column" paddingX={1}>
        <Text>
          <Text color="cyan">🚀 Server Running on </Text>
          <Text underline>{serverUrl}</Text>
        </Text>
        <Text>
          <Text color="cyan">🌐 Network:   </Text>
          <Text underline>{networkUrl}</Text>
        </Text>
      </Box>

      <Box height={1} />

      {/* Virtual Phone Frame */}
      <Box flexDirection="column" paddingX={1}>
        <Text color="magenta">📱 Virtual Phone Preview:</Text>
        <Box borderStyle="single" borderColor="gray">
          <Box width={40} flexDirection="column">
            {/* Status Bar */}
            <Box justifyContent="space-between">
              <Text dimColor>12:00 PM</Text>
              <Text dimColor>100%</Text>
            </Box>
            
            <Box height={1} />
            
            {/* Content Area */}
            <Text>  Hello World!</Text>
            <Text dimColor>  (Live Preview Active)</Text>
            
            <Box height={3} />
          </Box>
        </Box>
      </Box>

      <Box height={1} />

      {/* Stats */}
      <Box flexDirection="column" paddingX={1}>
        <Text>
          <Text color="magenta">📂 Watching: </Text>
          <Text>{watchedDir}</Text>
          <Text color="blue">  |  👥 Devices: {deviceCount}</Text>
        </Text>
      </Box>

      <Box height={1} />

      {/* Keyboard Shortcuts */}
      <Box borderStyle="round" borderColor="gray" paddingX={1}>
        <Text dimColor>[q] Quit  [r] Reload  [o] Open Browser  [h] Help</Text>
      </Box>
    </Box>
  );
};

export default App;
