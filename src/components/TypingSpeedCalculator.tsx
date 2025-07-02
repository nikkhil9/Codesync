import React, { useEffect, useState } from 'react';
import { diffChars } from 'diff';

interface TypingSpeedCalculatorProps {
  typedText: string;
  originalText: string;
  onReset?: () => void;
}

const TypingSpeedCalculator: React.FC<TypingSpeedCalculatorProps> = ({
  typedText,
  originalText,
  onReset,
}) => {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Start timer on first keystroke
  useEffect(() => {
    if (typedText.length > 0 && startTime === null) {
      setStartTime(performance.now());
    }
  }, [typedText]);

  // Stop timer when length matches
  useEffect(() => {
    if (
      typedText.length === originalText.length &&
      startTime !== null &&
      endTime === null
    ) {
      setEndTime(performance.now());
    }
  }, [typedText, originalText, startTime, endTime]);

  // Update metrics every 500ms
  useEffect(() => {
    if (startTime === null || typedText.length === 0 || endTime) return;

    const interval = setInterval(() => {
      const now = performance.now();
      const seconds = (now - startTime) / 1000;
      setElapsedTime(seconds);

      const charsTyped = typedText.length;
      const cpm = (charsTyped / seconds) * 60;
      setSpeed(parseFloat(cpm.toFixed(2)));

      const diffs = diffChars(originalText, typedText);
      let correct = 0;
      diffs.forEach((part) => {
        if (!part.added && !part.removed) {
          correct += part.count || 0;
        }
      });

      const total = originalText.length;
      const acc = (correct / total) * 100;
      setAccuracy(parseFloat(acc.toFixed(2)));
    }, 500);

    return () => clearInterval(interval);
  }, [typedText, startTime, originalText, endTime]);

  // Final metrics update when finished
  useEffect(() => {
    if (startTime && endTime) {
      const seconds = (endTime - startTime) / 1000;
      setElapsedTime(seconds);

      const charsTyped = typedText.length;
      const cpm = (charsTyped / seconds) * 60;
      setSpeed(parseFloat(cpm.toFixed(2)));

      const diffs = diffChars(originalText, typedText);
      let correct = 0;
      diffs.forEach((part) => {
        if (!part.added && !part.removed) {
          correct += part.count || 0;
        }
      });

      const total = originalText.length;
      const acc = (correct / total) * 100;
      setAccuracy(parseFloat(acc.toFixed(2)));
    }
  }, [endTime]);

  const handleReset = () => {
    setStartTime(null);
    setEndTime(null);
    setSpeed(0);
    setAccuracy(0);
    setElapsedTime(0);
    if (onReset) onReset();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-6">
        <p className="text-sm">
          ⏱ <strong>Time:</strong> {elapsedTime.toFixed(1)} sec
        </p>
        <p className="text-sm">
          🚀 <strong>Speed:</strong> {speed} chars/min
        </p>
        <p className="text-sm">
          🎯 <strong>Accuracy:</strong> {accuracy}%
        </p>
      </div>
      <button
        onClick={handleReset}
        className="mt-2 w-fit px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
      >
        Reset
      </button>
    </div>
  );
};

export default TypingSpeedCalculator;
