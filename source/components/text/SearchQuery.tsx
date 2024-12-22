// source/components/text/SearchQuery.tsx

import React, { useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { Select, ConfirmInput, Alert, StatusMessage, Spinner } from '@inkjs/ui';
import HuggingFace from "../common/HuggingFace.js";
import { useApp } from 'ink';

type SearchQueryProps = {
  onSubmit: (query: string) => void;
};

const SearchQuery = ({ onSubmit }: SearchQueryProps) => {
  const { exit } = useApp();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [continuationChoice, setContinuationChoice] = useState<string | null>(null);
  const [outputMessage, setOutputMessage] = useState("");

  const handleSubmit = () => {
    if (query.trim()) {
      onSubmit(query);
      setSubmittedQuery(query);
      setQuery("");
      setIsGenerating(true);
      setIsComplete(false);
      setContinuationChoice(null);
      setOutputMessage("");
    }
  };

  const handleGenerationComplete = (output: string) => {
    setIsGenerating(false);
    setIsComplete(true);
    setOutputMessage(output);
  };

  const handleContinuationChoice = (confirmed: boolean) => {
    if (confirmed) {
      setIsComplete(false);
      setOutputMessage("");
    } else {
      exit();
    }
  };

  if (isGenerating) {
    return <HuggingFace query={submittedQuery} onComplete={handleGenerationComplete} />;
  }

  if (isComplete) {
    return (
      <Box flexDirection="column" padding={1}>
        <StatusMessage variant="success">
          Generation Complete
        </StatusMessage>
        <Box marginBottom={1} padding={1} borderStyle="single">
          <Text>{outputMessage}</Text>
        </Box>
        <Alert variant="info">
          Would you like to continue?
        </Alert>
        <ConfirmInput onConfirm={() => handleContinuationChoice(true)} onCancel={() => handleContinuationChoice(false)} />
      </Box>
    );
  }

  if (continuationChoice === 'no') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text>{outputMessage}</Text>
        <StatusMessage variant="info">
          Thank you for using the CLI app. Goodbye!
        </StatusMessage>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <StatusMessage variant="info">
        Enter your query:
      </StatusMessage>
      <Box marginBottom={1}>
        <TextInput value={query} onChange={setQuery} onSubmit={handleSubmit} />
      </Box>
      <Text dimColor>Press Enter to submit your query</Text>
    </Box>
  );
};

export default SearchQuery;