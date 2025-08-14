import { useState } from "react";

function useFunnel(defaultStep: string) {
  const [step, setStep] = useState<string>(defaultStep);

  return { step, setStep };
}

export default useFunnel;
