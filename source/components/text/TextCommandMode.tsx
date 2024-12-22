// source/components/text/TextCommandMode.tsx

import React from "react";
import SearchQuery from "./SearchQuery.js";

const TextCommandMode: React.FC = () => {
  return (
    <SearchQuery
      onSubmit={(query: string) => {
        console.log("User query:", query);
      }}
    />
  );
};

export default TextCommandMode;