import { type ReactNode } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyButton } from "./CopyButton";
import { getCodeText } from "./code-content";

interface CodeBlockProps {
  children: ReactNode;
  language?: string;
  title?: string;
}

function processCode(code: string): string {
  return code.replace(/^\n+/, "").replace(/\n+$/, "");
}

export function CodeBlock({ children, language, title }: CodeBlockProps) {
  const codeString = processCode(getCodeText(children));

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
          <CopyButton
            code={codeString}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200"
          />
        </div>
      )}

      <div className="relative bg-code">
        {language ? (
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: "1rem",
              background: "transparent",
              fontSize: "0.875rem",
            }}
            codeTagProps={{
              style: {
                fontFamily: "monospace",
              },
            }}
          >
            {codeString}
          </SyntaxHighlighter>
        ) : (
          <pre className="p-4 overflow-x-auto text-sm font-mono custom-scrollbar">
            <code className="text-code">{codeString}</code>
          </pre>
        )}

        {!title && !language && (
          <CopyButton
            code={codeString}
            className="absolute top-2 right-2 p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200"
          />
        )}
      </div>
    </div>
  );
}
