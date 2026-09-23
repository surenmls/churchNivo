import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const TOOLBAR = [
  [{ header: [2, 3, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
  ['clean'],
];

export default function RichTextEditor({ label, value, onChange, placeholder, minHeight = 140 }) {
  const modules = useMemo(
    () => ({
      toolbar: TOOLBAR,
      clipboard: { matchVisual: false },
    }),
    []
  );

  const formats = ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link'];

  return (
    <div className="rich-text-editor">
      {label && <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>}
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ minHeight }}
      />
      <p className="mt-1 text-xs text-gray-400">Bold, headings, lists, and links are supported.</p>
    </div>
  );
}
