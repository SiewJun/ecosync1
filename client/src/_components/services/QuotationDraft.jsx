import React, { useState, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import axios from 'axios';

const QuotationDraft = ({ quotationId }) => {
  const [quillContent, setQuillContent] = useState('');
  const quillRef = useRef(null);

  // Initialize Quill
  useEffect(() => {
    const quill = new Quill(quillRef.current, {
      theme: 'snow',
      placeholder: 'Draft the quotation...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link', 'image'],
          ['clean']
        ]
      }
    });

    quill.on('text-change', () => {
      setQuillContent(quill.root.innerHTML);
    });
  }, []);

  // Function to submit the quotation draft
  const handleSubmit = async () => {
    try {
      const response = await axios.post(`/api/quotations/draft`, {
        quotationId,
        content: quillContent
      });
      console.log('Quotation drafted successfully:', response.data);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  return (
    <div>
      <div ref={quillRef}></div>
      <button onClick={handleSubmit}>Save Draft</button>
    </div>
  );
};

export default QuotationDraft;
