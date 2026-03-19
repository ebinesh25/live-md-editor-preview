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
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '6px 10px',
          fontSize: '12px',
          backgroundColor: 'rgba(139, 233, 253, 0.1)',
          border: '1px solid rgba(139, 233, 253, 0.3)',
          borderRadius: '4px',
          color: '#8be9fd',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 233, 253, 0.2)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 233, 253, 0.1)'}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre style={{ margin: 0 }}>
        <code {...props}>{children}</code>
      </pre>
    </div>
  );
}

function Blockquote({ children, ...props }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = String(children).replace(/\n$/, '');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '6px 10px',
          fontSize: '12px',
          backgroundColor: 'rgba(189, 147, 249, 0.1)',
          border: '1px solid rgba(189, 147, 249, 0.3)',
          borderRadius: '4px',
          color: '#bd93f9',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(189, 147, 249, 0.2)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(189, 147, 249, 0.1)'}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <blockquote {...props}>{children}</blockquote>
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
          },
          blockquote({ children, ...props }) {
            return <Blockquote {...props}>{children}</Blockquote>;
          }
        }}
      >
        {content || '*No content yet*'}
      </ReactMarkdown>
    </div>
  );
}

export default Preview;
