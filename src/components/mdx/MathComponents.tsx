"use client";

import React, { useRef } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";

// 数学コンテンツのカウンターを管理するコンテキスト
const MathContext = React.createContext<{
  getNextNumber: (group?: string) => number;
  resetCounters: (group?: string) => void;
  // ラベル管理
  registerLabel: (
    labelId: string,
    targetId: string,
    number: number,
    type: string,
    component?: React.ReactNode,
    title?: string | React.ReactNode
  ) => void;
  getLabel: (labelId: string) =>
    | {
        targetId: string;
        number: number;
        type: string;
        title?: string | React.ReactNode;
      }
    | undefined;
  // 非同期ラベル取得
  getLabelAsync: (labelId: string) => Promise<{
    targetId: string;
    number: number;
    type: string;
    title?: string | React.ReactNode;
  } | null>;
  // ラベルコンポーネント取得
  getLabelComponent: (labelId: string) => React.ReactNode | null;
}>({
  getNextNumber: () => 0,
  resetCounters: () => {},
  registerLabel: () => {},
  getLabel: () => undefined,
  getLabelAsync: async () => null,
  getLabelComponent: () => null,
});

// 数学コンテンツプロバイダー
export const MathProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const countersRef = useRef<Record<string, number>>({});

  const getNextNumber = (group = "default"): number => {
    countersRef.current[group] = (countersRef.current[group] || 0) + 1;
    return countersRef.current[group];
  };

  const resetCounters = (group?: string) => {
    if (group) {
      countersRef.current[group] = 0;
    } else {
      countersRef.current = {};
    }
  };

  // ラベルマップ: labelId -> { targetId, number, type, component? }
  const labelsRef = useRef<
    Record<
      string,
      {
        targetId: string;
        number: number;
        type: string;
        component?: React.ReactNode;
        title?: string | React.ReactNode;
      }
    >
  >({});

  const registerLabel = (
    labelId: string,
    targetId: string,
    number: number,
    type: string,
    component?: React.ReactNode,
    title?: string | React.ReactNode
  ) => {
    labelsRef.current[labelId] = { targetId, number, type, component, title };
  };

  const getLabel = (labelId: string) => {
    return labelsRef.current[labelId];
  };

  const getLabelAsync = async (
    labelId: string
  ): Promise<{ targetId: string; number: number; type: string } | null> => {
    // 即座にチェック
    const immediateLabel = labelsRef.current[labelId];
    if (immediateLabel) {
      return immediateLabel;
    }

    // 非同期で待機
    for (let attempt = 0; attempt < 50; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 50));

      const foundLabel = labelsRef.current[labelId];
      if (foundLabel) return foundLabel;
    }

    return null;
  };

  const getLabelComponent = (labelId: string): React.ReactNode | null => {
    const label = labelsRef.current[labelId];
    if (!label) return null;

    // 登録されたコンポーネントがあればそれを返す
    return label.component || null;
  };

  return (
    <MathContext.Provider
      value={{
        getNextNumber,
        resetCounters,
        registerLabel,
        getLabel,
        getLabelAsync,
        getLabelComponent,
      }}
    >
      {children}
    </MathContext.Provider>
  );
};

// 基本的な数学ボックスコンポーネント
const MathBox: React.FC<{
  type: string;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  numbered?: boolean;
  id?: string;
  endMark?: React.ReactNode;
  headerAction?: React.ReactNode;
  headerOpen?: boolean;
  headerToggle?: () => void;
}> = ({
  type,
  title,
  children,
  color,
  bgColor,
  borderColor,
  numbered = true,
  id,
  endMark,
  headerAction,
  headerOpen = true,
  headerToggle,
}) => {
  const { getNextNumber } = React.useContext(MathContext);
  const numberRef = useRef<number | null>(null);

  // 初期化時に一度だけ番号を取得
  if (numbered && numberRef.current === null) {
    numberRef.current = getNextNumber();
  }

  const number = numbered ? numberRef.current : 0;
  const boxId = id || `${type.toLowerCase()}-${number}`;

  // コンテキストから登録関数を取得
  const { registerLabel } = React.useContext(MathContext);

  // id prop が与えられていれば、その id をラベルとして登録する
  React.useEffect(() => {
    if (id) {
      // コンテンツをコンポーネントとして保存
      const componentContent = (
        <div className="text-theme-2 leading-relaxed text-sm tooltip-content-wrapper">
          {children}
        </div>
      );
      registerLabel(
        id,
        boxId,
        number || 0,
        type,
        componentContent,
        title || undefined
      );
    }
  }, [id, boxId, number, registerLabel, type, children, title]);

  const onContainerClick = headerToggle ? headerToggle : undefined;

  return (
    <div
      id={boxId}
      className={`math-box relative my-6 p-4 rounded-lg border-l-4 ${bgColor} ${borderColor}`}
    >
      <div
        className={`${
          headerOpen ? "mb-3" : ""
        } ${color} font-semibold text-xl flex justify-between items-center`}
        onClick={onContainerClick}
      >
        <div>
          <span>
            {type}
            {numbered ? ` ${number}` : ""}
            {title ? (
              typeof title === "string" ? (
                ` (${title})`
              ) : (
                <> {title}</>
              )
            ) : (
              ""
            )}
          </span>
        </div>
        {headerAction ? (
          // mark headerAction node as interactive so our closest checks won't toggle when it's clicked
          <div className="ml-4" data-header-action>
            {headerAction}
          </div>
        ) : null}
      </div>
      <div className="text-theme-2 leading-relaxed">{children}</div>

      {endMark ? (
        // 右下に配置（コンテンツを押し上げないよう absolute 配置）
        <div className="absolute right-4 bottom-4 flex-shrink-0" aria-hidden>
          {endMark}
        </div>
      ) : null}
    </div>
  );
};

// Labelコンポーネント: <Label id="eq:1" /> のように使用し、親のMathBoxに登録される
// LabelRefコンポーネント: 登録されたラベルを参照して番号やリンクを表示
export const LabelRef: React.FC<{ id: string; showType?: boolean }> = ({
  id,
  showType = true,
}) => {
  const { getLabelAsync, getLabelComponent } = React.useContext(MathContext);
  const [label, setLabel] = React.useState<{
    targetId: string;
    number: number;
    type: string;
    title?: string | React.ReactNode;
  } | null>(null);

  React.useEffect(() => {
    let isCancelled = false;

    const findLabel = async (): Promise<void> => {
      try {
        const foundLabel = await getLabelAsync(id);
        if (!isCancelled) {
          setLabel(foundLabel);
        }
      } catch {
        if (!isCancelled) {
          setLabel(null);
        }
      }
    };

    findLabel();

    return () => {
      isCancelled = true;
    };
  }, [id, getLabelAsync]);

  if (!label) {
    // ラベル未定義の場合はプレースホルダを表示
    return <span className="text-theme-3">(未定義の参照: {id})</span>;
  }

  const tooltipComponent = getLabelComponent(id);

  // display: optionally include the title (title can be string or ReactNode)
  const displayContent = (
    <>
      {showType ? (
        <>
          <span className="whitespace-nowrap">
            {label.type} {label.number}
          </span>
        </>
      ) : (
        <span className="whitespace-nowrap">{label.number}</span>
      )}
    </>
  );

  return (
    <HoverCard.Root openDelay={10} closeDelay={10}>
      <HoverCard.Trigger asChild>
        <a
          href={`#${label.targetId}`}
          className="text-url-1 hover:text-url-2 underline decoration-dotted underline-offset-2"
        >
          {displayContent}
        </a>
      </HoverCard.Trigger>
      {tooltipComponent && (
        <HoverCard.Portal>
          <HoverCard.Content
            className="label-ref-tooltip z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            side="top"
            align="start"
            sideOffset={8}
            collisionPadding={16}
          >
            <div className="label-ref-tooltip-header">
              {label.type} {label.number}
              {label.title ? (
                <span className="text-sm text-theme-3"> {label.title}</span>
              ) : null}
            </div>
            <div className="label-ref-tooltip-content">{tooltipComponent}</div>
            <HoverCard.Arrow
              className="fill-[var(--tooltip-border)]"
              width={12}
              height={8}
            />
          </HoverCard.Content>
        </HoverCard.Portal>
      )}
    </HoverCard.Root>
  );
};

// 定理コンポーネント
export const Theorem: React.FC<{
  title?: string;
  children: React.ReactNode;
  id?: string;
}> = ({ title, children, id }) => (
  <MathBox
    type="定理"
    title={title}
    color="math-theorem-text"
    bgColor="math-theorem-bg"
    borderColor="border-math-theorem"
    id={id}
  >
    {children}
  </MathBox>
);

// 命題コンポーネント
export const Proposition: React.FC<{
  title?: string;
  children: React.ReactNode;
  id?: string;
}> = ({ title, children, id }) => (
  <MathBox
    type="命題"
    title={title}
    color="math-proposition-text"
    bgColor="math-proposition-bg"
    borderColor="border-math-proposition"
    id={id}
  >
    {children}
  </MathBox>
);

// 補題コンポーネント
export const Lemma: React.FC<{
  title?: string;
  children: React.ReactNode;
  id?: string;
}> = ({ title, children, id }) => (
  <MathBox
    type="補題"
    title={title}
    color="math-lemma-text"
    bgColor="math-lemma-bg"
    borderColor="border-math-lemma"
    id={id}
  >
    {children}
  </MathBox>
);

// 系コンポーネント
export const Corollary: React.FC<{
  title?: string;
  children: React.ReactNode;
  id?: string;
}> = ({ title, children, id }) => (
  <MathBox
    type="系"
    title={title}
    color="math-corollary-text"
    bgColor="math-corollary-bg"
    borderColor="border-math-corollary"
    id={id}
  >
    {children}
  </MathBox>
);

// 定義コンポーネント
export const Definition: React.FC<{
  title?: string;
  children: React.ReactNode;
  id?: string;
}> = ({ title, children, id }) => (
  <MathBox
    type="定義"
    title={title}
    color="math-definition-text"
    bgColor="math-definition-bg"
    borderColor="border-math-definition"
    id={id}
  >
    {children}
  </MathBox>
);

// 例コンポーネント
export const Example: React.FC<{
  title?: string;
  children: React.ReactNode;
  id?: string;
}> = ({ title, children, id }) => (
  <MathBox
    type="例"
    title={title}
    color="math-example-text"
    bgColor="math-example-bg"
    borderColor="border-math-example"
    id={id}
  >
    {children}
  </MathBox>
);

// 数式（式）コンポーネント
export const Equation: React.FC<{
  children: React.ReactNode;
  id?: string;
}> = ({ children, id }) => {
  const { getNextNumber, registerLabel } = React.useContext(MathContext);
  const numberRef = useRef<number | null>(null);

  if (numberRef.current === null) {
    // use separate counter group for equations
    numberRef.current = getNextNumber("equation");
  }

  const number = numberRef.current as number;
  const targetId = id || `equation-${number}`;

  React.useEffect(() => {
    if (id) {
      registerLabel(id, targetId, number, "式");
    }
  }, [id, targetId, number, registerLabel]);

  return (
    <div id={targetId} className="equation my-4 w-full flex items-center">
      <div className="flex-1 text-center">{children}</div>
      <div className="katex">({number})</div>
    </div>
  );
};

// 証明コンポーネント
export const Proof: React.FC<{
  children: React.ReactNode;
  id?: string;
}> = ({ children, id }) => {
  const [open, setOpen] = React.useState(true);

  const toggle = () => setOpen((v) => !v);

  const endMark = (
    <svg
      className="math-proof-text opacity-70"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-label="証明終了"
    >
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="1"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
      />
    </svg>
  );

  const headerAction = (
    <button
      aria-expanded={open}
      aria-controls={id}
      className="text-theme-2 hover:text-theme-1 focus:outline-none px-1 py-1 rounded"
      title={open ? "折り畳む" : "展開する"}
    >
      <span className="text-lg leading-none select-none">
        {open ? "▼" : "▲"}
      </span>
    </button>
  );

  return (
    <MathBox
      type="証明"
      color="math-proof-text"
      bgColor="math-proof-bg"
      borderColor="border-math-proof"
      numbered={false}
      id={id}
      headerAction={headerAction}
      headerOpen={open}
      headerToggle={toggle}
      endMark={open ? endMark : null}
    >
      <div id={id} style={{ display: open ? undefined : "none" }}>
        {children}
      </div>
    </MathBox>
  );
};

// 注意・注釈コンポーネント
export const Remark: React.FC<{
  title?: string;
  children: React.ReactNode;
  id?: string;
}> = ({ title, children, id }) => (
  <MathBox
    type="注意"
    title={title}
    color="math-remark-text"
    bgColor="math-remark-bg"
    borderColor="border-math-remark"
    id={id}
  >
    {children}
  </MathBox>
);

// 問題コンポーネント
export const Problem: React.FC<{
  title?: string;
  children: React.ReactNode;
  id?: string;
}> = ({ title, children, id }) => (
  <MathBox
    type="問題"
    title={title}
    color="math-problem-text"
    bgColor="math-problem-bg"
    borderColor="border-math-problem"
    id={id}
  >
    {children}
  </MathBox>
);

// 解答コンポーネント
export const Solution: React.FC<{
  children: React.ReactNode;
  id?: string;
}> = ({ children, id }) => (
  <MathBox
    type="解答"
    color="math-solution-text"
    bgColor="math-solution-bg"
    borderColor="border-math-solution"
    numbered={false}
    id={id}
  >
    {children}
  </MathBox>
);
