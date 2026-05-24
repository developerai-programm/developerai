import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface FormatterProps {
  text: string;
}

export const MessageFormatter: React.FC<FormatterProps> = ({ text }) => {
  // 1. Remove quadrupled asterisks "****" which may show up as slop
  let cleaned = text.replace(/\*\*\*\*/g, '');
  
  // 2. Split by block code fences
  const parts = cleaned.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 font-sans text-sm md:text-base leading-relaxed break-words w-full">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Identify language and code body
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = (match ? match[1] : 'code') || 'code';
          const codeContent = match ? match[2] : part.slice(3, -3);

          return (
            <CodeBlock 
              key={index} 
              code={codeContent.trim()} 
              lang={lang} 
            />
          );
        } else {
          // Plain markdown content formatting inline double/triple bold highlights nicely
          return (
            <p 
              key={index} 
              className="whitespace-pre-line text-[15px] text-gray-800 leading-relaxed font-sans font-normal"
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(part) }} 
            />
          );
        }
      })}
    </div>
  );
};

// Markdown transformer handles converting bullet indicators and asterisks into tags
function formatInlineMarkdown(text: string): string {
  let html = text;

  // Escape any direct HTML to prevent script injection but keep our formatting tags safe
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Re-enable targeted bullet points
  html = html.replace(/^\s*\*\s+(.*)$/gm, '• $1');
  html = html.replace(/^\s*-\s+(.*)$/gm, '• $1');

  // Convert ***bold italic***
  html = html.replace(/\*\*\*([\s\S]*?)\*\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
  
  // Convert **bold** highlights dynamically formatted
  html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong class="font-bold text-black border-b border-gray-100 pb-0.5">$1</strong>');

  // Inline `code` snippet styling inside standard texts
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-50 border border-gray-200/50 px-1.5 py-0.5 rounded font-mono text-xs text-rose-500">$1</code>');

  return html;
}

const CodeBlock: React.FC<{ code: string; lang: string }> = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Nusxalashda xatolik:', err);
    }
  };

  return (
    <div className="my-4 rounded-xl border border-gray-100 overflow-hidden bg-[#0d0e11] text-gray-100 shadow-md font-mono text-xs md:text-sm max-w-full">
      {/* Code Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#16181d] border-b border-gray-800 text-[10px] font-bold text-gray-400 tracking-wider uppercase select-none">
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-gray-500 animate-pulse" />
          <span>{lang}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2 rounded-md hover:bg-gray-800 active:scale-95 text-[10px] font-bold"
          title="Nusxalash"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400 animate-in zoom-in-50" />
              <span className="text-emerald-400">Nusxalandi!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Kodni ko'chirish</span>
            </>
          )}
        </button>
      </div>

      {/* Code Text pre body */}
      <div className="p-4 overflow-x-auto max-w-full select-text">
        <pre className="m-0 leading-[1.6]">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
