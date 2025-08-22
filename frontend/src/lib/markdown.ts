import { marked } from 'marked';

// Configure marked options for better output
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false,
});

// Custom renderer to add classes for styling
const renderer = new marked.Renderer();

// Customize heading rendering
renderer.heading = (text, level) => {
  const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
  const headingClasses = {
    1: 'text-4xl font-bold text-gray-900 mb-6 mt-8',
    2: 'text-3xl font-bold text-gray-900 mb-5 mt-7',
    3: 'text-2xl font-semibold text-gray-900 mb-4 mt-6',
    4: 'text-xl font-semibold text-gray-900 mb-3 mt-5',
    5: 'text-lg font-semibold text-gray-900 mb-2 mt-4',
    6: 'text-base font-semibold text-gray-900 mb-2 mt-4'
  };
  
  return `<h${level} class="${headingClasses[level as keyof typeof headingClasses]}" id="${escapedText}">${text}</h${level}>`;
};

// Customize paragraph rendering
renderer.paragraph = (text) => {
  return `<p class="text-gray-800 leading-relaxed mb-6 text-lg">${text}</p>`;
};

// Customize list rendering
renderer.list = (body, ordered) => {
  const listType = ordered ? 'ol' : 'ul';
  const listClass = ordered 
    ? 'list-decimal list-inside space-y-2 mb-6 text-gray-800 leading-relaxed text-lg'
    : 'list-disc list-inside space-y-2 mb-6 text-gray-800 leading-relaxed text-lg';
  
  return `<${listType} class="${listClass}">${body}</${listType}>`;
};

// Customize list item rendering
renderer.listitem = (text) => {
  return `<li class="mb-1">${text}</li>`;
};

// Customize strong rendering
renderer.strong = (text) => {
  return `<strong class="font-semibold text-gray-900">${text}</strong>`;
};

// Customize emphasis rendering
renderer.em = (text) => {
  return `<em class="italic text-gray-800">${text}</em>`;
};

// Customize link rendering
renderer.link = (href, title, text) => {
  return `<a href="${href}" title="${title || ''}" class="text-blue-600 hover:text-blue-800 underline transition-colors duration-200">${text}</a>`;
};

// Customize blockquote rendering
renderer.blockquote = (quote) => {
  return `<blockquote class="border-l-4 border-gray-300 pl-6 py-2 mb-6 italic text-gray-700 bg-gray-50 rounded-r-lg">${quote}</blockquote>`;
};

// Customize code rendering
renderer.code = (code, language) => {
  return `<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">${code}</code>`;
};

// Customize code block rendering
renderer.code = (code, language) => {
  return `<pre class="bg-gray-100 text-gray-800 p-4 rounded-lg mb-6 overflow-x-auto"><code class="text-sm font-mono">${code}</code></pre>`;
};

// Set the custom renderer
marked.use({ renderer });

export function processMarkdown(content: string): string {
  try {
    // Clean up any extra whitespace and normalize line breaks
    const cleanedContent = content
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');
    
    // Convert markdown to HTML
    const html = marked(cleanedContent);
    
    return html;
  } catch (error) {
    console.error('Error processing markdown:', error);
    // Fallback: return content wrapped in paragraphs
    return `<p class="text-gray-800 leading-relaxed mb-6 text-lg">${content}</p>`;
  }
}

export function extractExcerpt(content: string, maxLength: number = 200): string {
  // Remove markdown formatting for excerpt
  const plainText = content
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
