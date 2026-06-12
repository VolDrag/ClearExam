import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";

interface Props {
  children: string;
  className?: string;
  inline?: boolean;
}

/**
 * Renders text/markdown with KaTeX math typesetting.
 * Supports inline math with $...$ and block math with $$...$$.
 * Pass inline to render a single line without block wrappers.
 */
export function MathMarkdown({ children, className, inline = false }: Props) {
  const content = children ?? "";
  if (inline) {
    return (
      <span className={`math-inline-wrap ${className ?? ""}`}>
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({ children }) => <span>{children}</span>,
          }}
        >
          {content}
        </ReactMarkdown>
      </span>
    );
  }
  return (
    <div className={`math-content ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
