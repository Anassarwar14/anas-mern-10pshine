import { generateText } from '@tiptap/core';
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"


const extensions = [
  StarterKit.configure({
    horizontalRule: false,
    link: {
      openOnClick: false,
      enableClickSelection: true,
    },
  }),
  HorizontalRule,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Highlight.configure({ multicolor: true }),
  Image,
  Typography,
  Superscript,
  Subscript,
  Selection,
]

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

export function isValidTiptapContent(json: any): boolean {
  return json && typeof json === 'object' && json.type === 'doc' && Array.isArray(json.content);
}


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