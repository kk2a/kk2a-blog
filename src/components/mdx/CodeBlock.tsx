"use client";

import { Copy, Check } from "lucide-react";
import { ReactNode, useState } from "react";

interface CodeBlockProps {
  children: ReactNode;
  language?: string;
  title?: string;
}

export function CodeBlock({ children, language, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // コードの正規化処理（インデントは保持）
  const processCode = (code: string) => {
    return code.replace(/^\n+/, "").replace(/\n+$/, "");
  };

  // 表示・コピー用のコード取得
  const getCode = () => {
    const code =
      typeof children === "string"
        ? children
        : (children as { props?: { children?: string } })?.props?.children ||
          "";
    return processCode(code);
  };

  const handleCopy = async () => {
    const processedCode = getCode();

    try {
      await navigator.clipboard.writeText(processedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="my-6 rounded-lg border border-gray-700 overflow-hidden">
      {(title || language) && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            {title && (
              <span className="text-sm font-medium text-gray-100">{title}</span>
            )}
            {language && (
              <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-100">
                {language}
              </span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
            title={copied ? "Copied!" : "Copy code"}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      <div className="relative bg-[#1f1f1f]">
        <pre className="p-4 overflow-x-auto text-sm font-mono">
          <code className="text-gray-100">{getCode()}</code>
        </pre>

        {!title && !language && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
            title={copied ? "Copied!" : "Copy code"}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
