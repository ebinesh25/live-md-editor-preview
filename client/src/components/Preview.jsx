import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

function CodeBlock({ children, ...props }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = String(children).replace(/\n$/, '');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '6px 10px',
          fontSize: '12px',
          backgroundColor: 'rgba(193, 193, 255, 0.1)',
          border: '1px solid rgba(193, 193, 255, 0.3)',
          borderRadius: '6px',
          color: '#c1c1ff',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          zIndex: 10
        }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre>
        <code {...props}>{children}</code>
      </pre>
    </div>
  );
}

function Preview({ content }) {
  return (
    <div className="markdown-preview">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            
            if (!inline && match) {
              return <CodeBlock>{children}</CodeBlock>;
            }
            
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content || '*No content yet. Start typing to see the preview...*'}
      </ReactMarkdown>
    </div>
  );
}

export default Preview;
