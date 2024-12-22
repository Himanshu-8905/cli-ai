// source/app.tsx
import React, { useState } from "react";
import { Box } from "ink";
import MainMenu from "./components/common/MainMenu.js";
import { useFeatureState } from "./components/hooks/useFeatureState.js";
import HelpMode from "./components/common/HelpPanel.js";
import TextCommandMode from "./components/text/TextCommandMode.js";

const App = () => {
  const { feature, setFeature } = useFeatureState();
  switch (feature?.value) {
    case "text-command":
      return <TextCommandMode />;
    case "voice-command":
    case "help":
      return <HelpMode onBack={() => setFeature(null)} />;
    default:
      return (
        <Box flexDirection="column" padding={1}>
          <MainMenu onSelect={setFeature} />
        </Box>
      );
    }
};

export default App;