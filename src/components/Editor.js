import React, { useEffect, useRef, useState } from 'react'
import Codemirror from 'codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/theme/dracula.css'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/lib/codemirror.css'
import './styles/Editor.css'
import { TfiExport } from "react-icons/tfi";
import { TfiImport } from "react-icons/tfi";
import ACTIONS from '../Action'
const Editor = ({ socketRef, roomId, onCodeChange, username }) => {
  const [editor, setEditor] = useState(null);
  const [lastChangeBy, setLastChangeBy] = useState('');
  const editorRef = useRef(null);
  useEffect(() => {
    async function init() {
      const cm = Codemirror.fromTextArea(document.getElementById('realtimeEditor'), {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      })
      editorRef.current = cm;
      setEditor(cm);

      editorRef.current.on('change', (instance, changes) => {
        console.log('changes', changes);
        const { origin } = changes
        const code = instance.getValue();

        setLastChangeBy(username);
        if (origin !== 'setValue') {

          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          })
        }
        onCodeChange(code);

      });


    }
    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code, username }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
          setLastChangeBy(username);
        }
      })
    }
  }, [socketRef.current]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const code = e.target.result;
        console.log(code);
        if (editorRef.current) {
          editorRef.current.setValue(code); // Set the file content in CodeMirror

          // Emit the code change to sync with other clients
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      };
      reader.readAsText(file); // Read the file as text
    }
  };

  const handleFileExport = () => {
    if (editor) {
      const content = editor.getValue(); // Get the content from CodeMirror
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'code.js'; // Default filename, you can customize this
      link.click();
      URL.revokeObjectURL(url); // Clean up the URL object
    }
  };

  return (
    <>
      <div className='EditorHead'>
        <label className='importLabel' htmlFor='importFile' style={{ fontSize:'17px', cursor:'pointer'}}><TfiImport /> Import Code</label>
        <input
          id='importFile'
          type="file"
          accept=".js,.txt,.json,.html,.css" // Customize accepted file types
          onChange={handleFileUpload}
          
        />
        <button id onClick={handleFileExport} style={{ backgroundColor:'white', border:'none', fontSize:'17px',cursor:'pointer',padding:'7px',borderRadius:'5px' }}>
        <TfiExport /> Export Code
        </button>
        <h3>Last changed by: {lastChangeBy}</h3>
      </div>
      <textarea id='realtimeEditor'></textarea>
    </>
  )
}

export default Editor