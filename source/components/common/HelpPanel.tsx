// source/components/common/HelpPanel.tsx

import React from "react";
import { Box, Text } from "ink";
import Select from "ink-select-input";
import { StatusMessage } from "@inkjs/ui";
import { HELP_TEXT } from "../../constants.js";

interface HelpModeProps {
  onBack: () => void;
}

const HelpMode: React.FC<HelpModeProps> = ({ onBack }) => {
  return (
    <Box flexDirection="column" padding={1}>
      <StatusMessage variant="info">
        Help Information
      </StatusMessage>
      <Text>{HELP_TEXT}</Text>
      <Box marginTop={1}>
        <Select
          items={[{ label: "Back to Main Menu", value: "back" }]}
          onSelect={onBack}
        />
      </Box>
    </Box>
  );
};

export default HelpMode;