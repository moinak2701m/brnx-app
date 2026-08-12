import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Input from '../../../components/ui/Input'
import Dropdown from '../../../components/ui/Dropdown'
import FileUpload from '../../../components/ui/FileUpload'
import Button from '../../../components/ui/Button'
import { useToast } from '../../../components/ui/Toast'
import useAfricaStore from '../../store'

export default function InvoiceNew() {
  const navigate = useNavigate()
  const toast = useToast()
  const senders = useAfricaStore((s) => s.senders)
  const createInvoice = useAfricaStore((s) => s.createInvoice)

  const [senderId, setSenderId] = useState('')
  const [description, setDescription] = useState('')
  const [amountUSD, setAmountUSD] = useState('')
  const [file, setFile] = useState(null)

  const parsedAmount = parseFloat(amountUSD) || 0
  const canSubmit = senderId && description && parsedAmount > 0

  const handleSubmit = () => {
    const invoice = createInvoice({
      senderId,
      description,
      amountUSD: parsedAmount,
      fileName: file?.name,
    })
    toast?.(`${invoice.invoiceNumber} created`)
    navigate('/africa/receiver/invoices')
  }

  if (senders.length === 0) {
    return (
      <div className="max-w-md mx-auto pt-16 text-center">
        <p className="text-[#6b7280] mb-4">Add a sender before creating an invoice.</p>
        <Button onClick={() => navigate('/africa/receiver/senders')}>Add a sender</Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate('/africa/receiver/invoices')}
        className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#111827] mb-6"
      >
        <ArrowLeft size={14} /> Back to invoices
      </button>

      <h1 className="text-2xl font-bold text-[#111827] mb-6">Create invoice</h1>

      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col gap-4">
        <Dropdown
          label="Bill to (sender)"
          placeholder="Select a sender"
          value={senderId}
          onChange={setSenderId}
          options={senders.map((s) => ({ value: s.id, label: `${s.name} · ${s.country}` }))}
        />
        <Input label="Description" placeholder="e.g. Q3 packaging materials" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input
          label="Amount (USD)"
          type="number"
          placeholder="e.g. 420"
          value={amountUSD}
          onChange={(e) => setAmountUSD(e.target.value)}
        />
        <FileUpload label="Attach invoice (optional)" hint="PDF or image" onChange={setFile} />
        <Button variant="primary" fullWidth disabled={!canSubmit} onClick={handleSubmit} className="mt-2">
          Create invoice
        </Button>
      </div>
    </div>
  )
}
