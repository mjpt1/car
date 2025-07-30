'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote } from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const menuItems = [
    { action: () => editor.chain().focus().toggleBold().run(), icon: Bold, isActive: editor.isActive('bold') },
    { action: () => editor.chain().focus().toggleItalic().run(), icon: Italic, isActive: editor.isActive('italic') },
    { action: () => editor.chain().focus().toggleStrike().run(), icon: Strikethrough, isActive: editor.isActive('strike') },
    { action: () => editor.chain().focus().toggleCode().run(), icon: Code, isActive: editor.isActive('code') },
    { action: () => editor.chain().focus().toggleBulletList().run(), icon: List, isActive: editor.isActive('bulletList') },
    { action: () => editor.chain().focus().toggleOrderedList().run(), icon: ListOrdered, isActive: editor.isActive('orderedList') },
    { action: () => editor.chain().focus().toggleBlockquote().run(), icon: Quote, isActive: editor.isActive('blockquote') },
  ];

  return (
    <div className="border border-b-0 rounded-t-lg p-2 flex items-center flex-wrap gap-2 bg-gray-50">
      {menuItems.map((item, index) => (
        <button
          key={index}
          type="button"
          onClick={item.action}
          className={`p-2 rounded hover:bg-gray-200 ${item.isActive ? 'bg-gray-300' : ''}`}
        >
          <item.icon size={16} />
        </button>
      ))}
    </div>
  );
};

const RichTextEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none p-4 min-h-[250px] border rounded-b-lg',
      },
    },
  });

  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
