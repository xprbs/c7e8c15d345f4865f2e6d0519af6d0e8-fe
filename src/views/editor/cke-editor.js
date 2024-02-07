import React, { useEffect, useState } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

function Editor({ initData, onCKChange, name }) {
  let [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, []) // run on mounting

  if (loaded) {
    return (
      <CKEditor
        name={name}
        editor={ClassicEditor}
        config={{
          toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', '|', 'bulletedList', 'numberedList']
        }}
        data={initData}
        onReady={editor => {
          // You can store the "editor" and use when it is needed.
          //   console.log('Editor is ready to use!', editor)
        }}
        onChange={(event, editor) => {
          // do something when editor's content changed
          const data = editor.getData()

          onCKChange(data)

          // console.log(data)

          //   console.log({ event, editor, data })
        }}
        onBlur={(event, editor) => {
          //   console.log('Blur.', editor)
        }}
        onFocus={(event, editor) => {
          //   console.log('Focus.', editor)
        }}
      />
    )
  } else {
    return <p> Editor is loading... </p>
  }
}

export default Editor
