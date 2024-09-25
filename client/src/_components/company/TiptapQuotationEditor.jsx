import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Save,
  FileDown,
  Undo,
  Redo,
  Bold,
  Italic,
  List,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Toaster } from '@/components/ui/toaster';

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.getAttribute('data-background-color'),
        renderHTML: attributes => ({
          'data-background-color': attributes.backgroundColor,
          style: `background-color: ${attributes.backgroundColor}`,
        }),
      },
    };
  },
});

const editorStyles = `
  .ProseMirror table {
    border-collapse: collapse;
    margin: 0;
    overflow: hidden;
    table-layout: fixed;
    width: 100%;
  }
  .ProseMirror table td,
  .ProseMirror table th {
    border: 2px solid #ced4da;
    box-sizing: border-box;
    min-width: 1em;
    padding: 3px 5px;
    position: relative;
    vertical-align: top;
  }
  .ProseMirror table th {
    background-color: #f1f3f5;
    font-weight: bold;
    text-align: left;
  }
  .ProseMirror table .selectedCell:after {
    background: rgba(200, 200, 255, 0.4);
    content: "";
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
    position: absolute;
    z-index: 2;
  }
`;

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="flex flex-wrap items-center space-x-1 space-y-1 mb-4 p-2 rounded-md bg-gray-100">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Paragraph <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => editor.chain().focus().setParagraph().run()}>
            Paragraph
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            Heading 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-gray-200' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-gray-200' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={addTable}
      >
        <TableIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()}
      >
        Delete Table
      </Button>
      {/* Extended Table Features */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        disabled={!editor.can().addColumnBefore()}
      >
        Add Column Before
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        disabled={!editor.can().addColumnAfter()}
      >
        Add Column After
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().deleteColumn().run()}
        disabled={!editor.can().deleteColumn()}
      >
        Delete Column
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().addRowBefore().run()}
        disabled={!editor.can().addRowBefore()}
      >
        Add Row Before
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().addRowAfter().run()}
        disabled={!editor.can().addRowAfter()}
      >
        Add Row After
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().deleteRow().run()}
        disabled={!editor.can().deleteRow()}
      >
        Delete Row
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().mergeCells().run()}
        disabled={!editor.can().mergeCells()}
      >
        Merge Cells
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().splitCell().run()}
        disabled={!editor.can().splitCell()}
      >
        Split Cell
      </Button>
    </div>
  );
};

const EditForm = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [formName, setFormName] = useState(''); // Default to empty string instead of undefined

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Write something ...',
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      CustomTableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      localStorage.setItem('content', content); // Save content to localStorage on every update
    },
  });

  useEffect(() => {
    const savedContent = localStorage.getItem('content');
    if (savedContent) {
      editor?.commands.setContent(savedContent);
    }
  }, [editor]);

  const handleSave = async () => {
    const content = editor?.getHTML();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/quotation/draft/${id}`,
        {
          quotationId: id,
          content: content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast({
        title: 'Success!',
        description: 'Form saved successfully.',
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to save the form.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleDownload = async () => {
    const content = editor?.getHTML();
    const doc = new jsPDF();
    const canvas = await html2canvas(document.querySelector('.ProseMirror'));
    const imageData = canvas.toDataURL('image/png');

    doc.addImage(imageData, 'PNG', 10, 10, 180, 0);
    doc.save('document.pdf');
  };

  return (
    <>
      <Card className="mt-4">
        <CardContent>
          <Tabs defaultValue="form">
            <TabsList>
              <TabsTrigger value="form">Form</TabsTrigger>
              <TabsTrigger value="setting">Setting</TabsTrigger>
            </TabsList>

            <TabsContent value="form">
              <MenuBar editor={editor} />
              <EditorContent className="ProseMirror" editor={editor} />
              <Toaster />
              <style>{editorStyles}</style>
            </TabsContent>

            <TabsContent value="setting">
              <div className="space-y-2">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Form name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-between">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button onClick={handleDownload} variant="secondary">
          <FileDown className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </>
  );
};

export default EditForm;