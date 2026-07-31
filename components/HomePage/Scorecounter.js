"use client";

import { useEffect, useState } from "react";

export default function ScoreCounter({
  value,
  duration = 2200,
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);

    // Update roughly every 16ms (≈60 FPS)
    const frameTime = 16;

    const totalSteps = Math.max(1, Math.round(duration / frameTime));

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;

      const progress = currentStep / totalSteps;

      const currentValue = Math.round(progress * value);

      setCount(currentValue);

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setCount(value);
      }
    }, frameTime);

    return () => clearInterval(interval);
  }, [value, duration]);

  return <>{count}%</>;
}