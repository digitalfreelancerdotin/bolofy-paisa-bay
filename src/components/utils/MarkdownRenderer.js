import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown
      className="prose prose-invert max-w-none"
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              className="rounded-lg !bg-gray-900"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-gray-800 rounded-md px-1.5 py-0.5" {...props}>
              {children}
            </code>
          );
        },
        h1: ({ node, children, ...props }) => (
          children && children.length ? (
            <h1 className="text-2xl font-bold mt-6 mb-4 text-amber-100" {...props}>{children}</h1>
          ) : null
        ),
        h2: ({ node, children, ...props }) => (
          children && children.length ? (
            <h2 className="text-xl font-bold mt-5 mb-3 text-amber-100" {...props}>{children}</h2>
          ) : null
        ),
        h3: ({ node, children, ...props }) => (
          children && children.length ? (
            <h3 className="text-lg font-bold mt-4 mb-2 text-amber-100" {...props}>{children}</h3>
          ) : null
        ),
        p: ({ node, ...props }) => <p className="mb-4 text-amber-100/90" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-1 text-amber-100/90" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-1 text-amber-100/90" {...props} />,
        li: ({ node, ...props }) => <li className="ml-4" {...props} />,
        a: ({ node, ...props }) => (
          <a 
            className="text-cyan-400 hover:text-cyan-300 underline transition-colors" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label={props.children ? props.children.toString() : 'link'} 
            {...props} 
          >
            {props.children}
          </a>
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote 
            className="border-l-4 border-amber-500/30 pl-4 my-4 text-amber-100/70 italic" 
            {...props} 
          />
        ),
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full divide-y divide-amber-500/20" {...props} />
          </div>
        ),
        th: ({ node, ...props }) => (
          <th 
            className="px-4 py-2 bg-amber-900/30 text-amber-100 font-semibold text-left" 
            {...props} 
          />
        ),
        td: ({ node, ...props }) => (
          <td 
            className="px-4 py-2 border-t border-amber-500/20 text-amber-100/90" 
            {...props} 
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;