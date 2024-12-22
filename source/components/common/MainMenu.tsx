// source/components/common/MainMenu.tsx

import React from "react";
import { Box, Text } from "ink";
import Select from "ink-select-input";
import { Alert } from "@inkjs/ui";

interface Feature {
  value: string;
}
interface MainMenuProps {
  onSelect: (feature: Feature) => void;
}

const MainMenu:React.FC<MainMenuProps> = ({onSelect}) => {
  return (
    <>
      <Box marginBottom={1} justifyContent="center">
        <Text color="cyan" bold>
          {`
░█████╗░██╗░░░░░░█████╗░██╗
██╔══██╗██║░░░░░██╔══██╗██║
██║░░╚═╝██║░░░░░███████║██║
██║░░██╗██║░░░░░██╔══██║██║
╚█████╔╝███████╗██║░░██║██║
░╚════╝░╚══════╝╚═╝░░╚═╝╚═╝
          `}
        </Text>
      </Box>
      <Box marginBottom={1} justifyContent="center">
        <Text>
          Welcome to CLAI - Your Command Line AI Assistant
        </Text>
      </Box>


      <Alert variant="info">
        Choose an option to get started
      </Alert>

      <Box marginBottom={1}>
        <Text bold>Available options:</Text>
      </Box>

      <Select
        items={[
          { label: "Text Mode", value: "text-command" },
          { label: "Help", value: "help" },
          { label: "Exit", value: "exit" },
        ]}
        onSelect={(item) => {
          onSelect(item);
          if (item.value === "exit") {
            process.exit();
          }
        }}
      />
    </>
  );
};
export default MainMenu;