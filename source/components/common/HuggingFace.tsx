// // source/components/common/HuggingFace.tsx


import React, { useState, useEffect } from "react";
import { Text, Box } from "ink";
import { pipeline } from "@huggingface/transformers";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";
import {
  Spinner,
  ConfirmInput,
  Alert,
  StatusMessage,
  UnorderedList,
} from "@inkjs/ui";

dotenv.config();
const execPromise = util.promisify(exec);

type HuggingFaceProps = {
  query: string;
  onComplete: (output: string) => void;
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const DANGEROUS_PATTERNS = [
  /\brm\b/,
  /\brmdir\b/,
  /\bdd\b/,
  /\bmv\b/,
  /\bchmod\b/,
  /\bchown\b/,
  /\bsed\b.*-i/,
  /\b>>\b/,
  /\b>\b/,
];

const HuggingFace = ({ query, onComplete }: HuggingFaceProps) => {
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [scriptContent, setScriptContent] = useState("");
  const [isDangerous, setIsDangerous] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const checkForDangerousOperations = (script: string) => {
    return DANGEROUS_PATTERNS.some((pattern) => pattern.test(script));
  };

  const handleHuggingFace = async () => {
    try {
    const generator = await pipeline(
        "text-generation",
        "onnx-community/Qwen2.5-Coder-0.5B-Instruct",
        { dtype: "q4" },
      );

      const prompt = `You are a bash script generator. Respond only with a valid bash script that accomplishes the task described. 
      Do not include any explanations, comments, or markdown formatting. Start the script with #!/bin/bash. 
      Use the current directory (.) as the base directory.

      Task: ${query}`;

      console.log("Prompt:", prompt);  // Step 2: Log the prompt
      
      const result: any = await generator(prompt, {
        max_new_tokens: 150,
        do_sample: true,  
      });

      console.log("Result from GPT-2:", result);  // Step 3: Log the result
      if (result && result[0]?.generated_text) {
        const outputContent = result[0].generated_text.trim();
        console.log("Generated script content:", outputContent);  // Step 4: Log outputContent

        setScriptContent(outputContent);
        setIsDangerous(checkForDangerousOperations(outputContent));
        setWaitingForConfirmation(true);
        setIsLoading(false);
      } else {
        throw new Error("No valid response received.");
      }
    } catch (error) {
      console.error("Error:", error);  // Step 5: Log any caught errors
      if (retryCount < MAX_RETRIES) {
        setRetryCount((prevCount) => prevCount + 1);
        setOutput(
          `Attempt ${retryCount + 1} failed. Retrying in ${
            RETRY_DELAY / 1000
          } seconds...`
        );
        await delay(RETRY_DELAY);
        handleHuggingFace();  // Retry on failure
      } else {
        const errorMessage = `Error: ${
          error instanceof Error ? error.message : String(error)
        }\nMax retries reached. Please try again later.`;
        setOutput(errorMessage);
        setIsLoading(false);
        onComplete(errorMessage);
      }
    }
  };


  const executeScript = async () => {
    try {
      console.log("Executing script...");  // Step 1: Log this line
      const filename = `script_${Date.now()}.sh`;
      const executionDir = process.env["PWD"] || process.cwd();
      const outputPath = path.join(executionDir, "clai_history", filename);

      console.log("Output path:", outputPath);  // Step 2: Log the output path

      await fs.mkdir(path.join(executionDir, "clai_history"), {
        recursive: true,
      });
      await fs.writeFile(outputPath, scriptContent, "utf8");
      await fs.chmod(outputPath, "755");

      console.log("Script written to:", outputPath);  // Step 3: Log script write confirmation

      const { stdout, stderr } = await execPromise(`bash ${outputPath}`, {
        cwd: executionDir,
      });

      const successMessage = `Bash script saved to: ${outputPath}\n\nOutput:\n${stdout}\n${
        stderr ? `Errors:\n${stderr}` : ""
      }`;
      console.log("Script execution output:", successMessage);  // Step 4: Log execution result

      setOutput(successMessage);
      onComplete(successMessage);
    } catch (err) {
      console.error("Failed to execute script:", err);  // Step 5: Log any errors during script execution
      const errorMessage = `Failed to execute script: ${
        err instanceof Error ? err.message : String(err)
      }`;
      setOutput(errorMessage);
      onComplete(errorMessage);
    }
  };


  useEffect(() => {
    if (query) {
      handleHuggingFace();
    }
  }, [query]);

  if (isLoading) {
    return <Text>Generating bash script... ⏳</Text>
  }

  if (waitingForConfirmation) {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
        <StatusMessage variant="info">Generated Script:</StatusMessage>
        <Box marginY={1} paddingX={1} borderStyle="single" borderColor="gray">
          <Text>{scriptContent}</Text>
        </Box>
        {isDangerous ? (
          <Alert variant="warning">
            This script contains potentially dangerous operations. Review carefully!
          </Alert>
        ) : null}
        <Text>Do you want to execute this script?</Text>
        <ConfirmInput
          onConfirm={executeScript}
          onCancel={() => {
            setOutput("Script execution cancelled by user.");
            onComplete("Script execution cancelled by user.");
            setWaitingForConfirmation(false);
          }}
        />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <StatusMessage variant="success">Execution Result:</StatusMessage>
      <UnorderedList>
        {output.split("\n").map((line, index) => (
          <UnorderedList.Item key={index}>
            <Text>{line}</Text>
          </UnorderedList.Item>
        ))}
      </UnorderedList>
    </Box>
  );
};

export default HuggingFace;
