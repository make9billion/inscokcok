import Image from '@tiptap/extension-image';
import { Extension, Mark, mergeAttributes } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { AlignCenter, AlignLeft, AlignRight, Bold, ImagePlus, Italic } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const MAX_IMAGE_SIZE_MB = 10;
const FONT_SIZE_OPTIONS = ['14px', '16px', '18px', '20px', '24px', '28px'];

const FontSize = Mark.create({
    name: 'fontSize',

    addAttributes() {
        return {
            size: {
                default: null,
                parseHTML: (element) => element.style.fontSize || null,
                renderHTML: (attributes) => {
                    if (!attributes.size) {
                        return {};
                    }

                    return {
                        style: `font-size: ${attributes.size}`,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[style*="font-size"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setFontSize:
                (size) =>
                ({ commands }) =>
                    commands.setMark(this.name, { size }),
        };
    },
});

const TextAlign = Extension.create({
    name: 'textAlign',

    addGlobalAttributes() {
        return [
            {
                types: ['paragraph'],
                attributes: {
                    textAlign: {
                        default: null,
                        parseHTML: (element) => element.style.textAlign || null,
                        renderHTML: (attributes) => {
                            if (!attributes.textAlign) {
                                return {};
                            }

                            return {
                                style: `text-align: ${attributes.textAlign}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setTextAlign:
                (textAlign) =>
                ({ commands }) =>
                    commands.updateAttributes('paragraph', { textAlign }),
        };
    },
});

function ToolbarButton({ active = false, disabled = false, icon: Icon, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md border text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                active ? 'border-toss-blue bg-toss-blueLight text-toss-blue' : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
        >
            <Icon className="size-4" />
        </button>
    );
}

async function uploadEditorImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(route('admin.point-mall.products.description-images.store'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
        },
        body: formData,
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = data.message || Object.values(data.errors ?? {}).flat()[0];

        throw new Error(message || `이미지 업로드에 실패했습니다. ${MAX_IMAGE_SIZE_MB}MB 이하의 JPG, PNG, WebP 이미지를 사용해주세요.`);
    }

    return response.json();
}

export default function ProductDescriptionEditor({ value, onChange }) {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                blockquote: false,
                bulletList: false,
                code: false,
                codeBlock: false,
                heading: false,
                horizontalRule: false,
                listItem: false,
                orderedList: false,
                strike: false,
            }),
            FontSize,
            TextAlign,
            Image.configure({
                HTMLAttributes: {
                    class: 'block mx-auto max-w-full rounded-lg',
                },
            }),
        ],
        content: value || '',
        editorProps: {
            attributes: {
                class: 'prose max-w-none min-h-64 rounded-b-lg border-x border-b border-gray-300 bg-white px-4 py-3 text-sm leading-7 focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor || editor.getHTML() === (value || '')) {
            return;
        }

        editor.commands.setContent(value || '', false);
    }, [editor, value]);

    const uploadImage = async (file) => {
        if (!file || !editor) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드할 수 있습니다.');
            return;
        }

        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            setError(`${MAX_IMAGE_SIZE_MB}MB 이하의 이미지만 업로드할 수 있습니다.`);
            return;
        }

        setUploading(true);
        setError('');

        try {
            const data = await uploadEditorImage(file);
            editor.chain().focus().setImage({ src: data.url }).run();
        } catch (uploadError) {
            setError(uploadError.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (!editor) {
        return (
            <div className="rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-500">
                상세설명 편집기를 불러오는 중입니다.
            </div>
        );
    }

    return (
        <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold text-gray-600">상세설명</span>
                <span className="text-xs text-gray-500">이미지는 {MAX_IMAGE_SIZE_MB}MB 이하로 업로드할 수 있습니다.</span>
            </div>

            <div>
                <div className="flex flex-wrap gap-1 rounded-t-lg border border-gray-300 bg-gray-50 p-2">
                    <label className="flex h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-700">
                        글씨 크기
                        <select
                            value={editor.getAttributes('fontSize').size || '16px'}
                            onChange={(event) => editor.chain().focus().setFontSize(event.target.value).run()}
                            className="h-7 rounded border-0 bg-transparent py-0 pl-1 pr-7 text-xs font-semibold text-gray-700 focus:ring-0"
                            aria-label="글씨 크기"
                        >
                            {FONT_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>
                                    {size.replace('px', '')}
                                </option>
                            ))}
                        </select>
                    </label>
                    <ToolbarButton icon={Bold} label="굵게" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
                    <ToolbarButton icon={Italic} label="기울기" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
                    <ToolbarButton icon={AlignLeft} label="왼쪽 정렬" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
                    <ToolbarButton icon={AlignCenter} label="가운데 정렬" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
                    <ToolbarButton icon={AlignRight} label="오른쪽 정렬" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} />
                    <label className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50" title="이미지 추가" aria-label="이미지 추가">
                        <ImagePlus className="size-4" />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            disabled={uploading}
                            onChange={(event) => uploadImage(event.target.files?.[0])}
                            className="sr-only"
                        />
                    </label>
                </div>
                <EditorContent editor={editor} />
            </div>

            {uploading && <p className="text-xs font-semibold text-toss-blue">이미지를 업로드하는 중입니다.</p>}
            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
        </div>
    );
}
