// source/hooks/useFeatureState.ts

import { useState } from "react";

interface Feature {
  value: string;
}

export const useFeatureState = () => {
  const [feature, setFeature] = useState<Feature | null>(null);

  return { feature, setFeature };
};