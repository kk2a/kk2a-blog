"use client";

import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        relative p-2 rounded-lg border border-theme-border bg-theme-background
      `}
      aria-label={`テーマを${
        theme === "light" ? "ダーク" : "ライト"
      }モードに切り替え`}
      title={`現在: ${theme === "light" ? "ライト" : "ダーク"}モード`}
    >
      <div className="relative w-6 h-6 wiggle-on-hover">
        {/* 太陽アイコン (ライトモード) */}
        <svg
          className={`
            absolute inset-0 w-6 h-6 text-yellow-500
            ${
              theme === "light"
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 rotate-180 scale-50"
            }
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx={12} cy={12} r={5} />
          <line x1={12} y1={1} x2={12} y2={3} />
          <line x1={12} y1={21} x2={12} y2={23} />
          <line x1={4.22} y1={4.22} x2={5.64} y2={5.64} />
          <line x1={18.36} y1={18.36} x2={19.78} y2={19.78} />
          <line x1={1} y1={12} x2={3} y2={12} />
          <line x1={21} y1={12} x2={23} y2={12} />
          <line x1={4.22} y1={19.78} x2={5.64} y2={18.36} />
          <line x1={18.36} y1={5.64} x2={19.78} y2={4.22} />
        </svg>

        {/* 月アイコン (ダークモード) */}
        <svg
          className={`
            absolute inset-0 w-6 h-6 text-blue-400 
            ${
              theme === "dark"
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 rotate-180 scale-50"
            }
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>
    </button>
  );
}
