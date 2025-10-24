import { generateText } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const extensions = [StarterKit];

// Convert TipTap JSON to plain text (for search)
export function tiptapToText(json: any): string {
  try {
    return generateText(json, extensions);
  } catch (error) {
    console.error('Error converting to text:', error);
    return '';
  }
}

// Extract title from first heading or paragraph
export function extractTitle(json: any, maxLength: number = 100): string {
  if (!json?.content || json.content.length === 0) {
    return 'Untitled';
  }

  const heading = json.content.find((node: any) => node.type === 'heading');
  if (heading?.content?.[0]?.text) {
    return heading.content[0].text.slice(0, maxLength);
  }

  const paragraph = json.content.find((node: any) => node.type === 'paragraph');
  if (paragraph?.content?.[0]?.text) {
    return paragraph.content[0].text.slice(0, maxLength);
  }

  return 'Untitled';
}

// Validate TipTap JSON structure
export function isValidTiptapContent(json: any): boolean {
  return json && typeof json === 'object' && json.type === 'doc' && Array.isArray(json.content);
}

// Get empty TipTap content
export function getEmptyContent() {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph"
      }
    ]
  };
}