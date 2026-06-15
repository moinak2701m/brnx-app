import { useState, useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'

export default function FileUpload({ label, hint, accept = 'image/*,.pdf', onChange }) {
  const [file, setFile] = useState(null)
  const ref = useRef()

  const handle = (f) => {
    if (!f) return
    setFile(f)
    onChange?.(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    handle(e.dataTransfer.files[0])
  }

  const remove = () => {
    setFile(null)
    onChange?.(null)
    if (ref.current) ref.current.value = ''
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#111827]">{label}</label>}
      {file ? (
        <div className="flex items-center gap-3 border border-[#e5e7eb] rounded-xl p-3 bg-[#f9fafb]">
          <FileText size={20} className="text-[#1a56db] flex-shrink-0" />
          <span className="text-sm text-[#111827] flex-1 truncate">{file.name}</span>
          <button type="button" onClick={remove} className="text-[#9ca3af] hover:text-[#dc2626]">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => ref.current?.click()}
          className="border-2 border-dashed border-[#e5e7eb] rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:border-[#1a56db] hover:bg-[#eff6ff] transition-colors"
        >
          <Upload size={20} className="text-[#9ca3af]" />
          <p className="text-sm text-[#6b7280] text-center">
            Tap to upload or drag & drop
          </p>
          {hint && <p className="text-xs text-[#9ca3af]">{hint}</p>}
        </div>
      )}
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => handle(e.target.files[0])} />
    </div>
  )
}
