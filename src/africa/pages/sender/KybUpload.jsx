import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../../components/ui/Input'
import Dropdown from '../../../components/ui/Dropdown'
import FileUpload from '../../../components/ui/FileUpload'
import Button from '../../../components/ui/Button'
import useAfricaStore from '../../store'

const BUSINESS_TYPES = [
  { value: 'importer', label: 'Importer' },
  { value: 'exporter', label: 'Exporter' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'trading', label: 'Trading Company' },
  { value: 'services', label: 'Services' },
]

export default function KybUpload() {
  const navigate = useNavigate()
  const submitKyb = useAfricaStore((s) => s.submitKyb)
  const [businessName, setBusinessName] = useState('Lagos Foods Ltd')
  const [businessType, setBusinessType] = useState('importer')
  const [regNumber, setRegNumber] = useState('')
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = businessName && businessType && regNumber

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    submitKyb()
    setLoading(false)
    navigate('/africa/sender/kyb/pending')
  }

  return (
    <div className="max-w-md mx-auto pt-6">
      <h1 className="text-2xl font-bold text-[#111827]">Complete your business verification</h1>
      <p className="text-[#6b7280] mt-1 mb-8 text-sm">
        A one-time basic KYB check before you can pay invoices on Dragonfly.
      </p>

      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] p-6 flex flex-col gap-4">
        <Input label="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        <Dropdown label="Business type" value={businessType} onChange={setBusinessType} options={BUSINESS_TYPES} />
        <Input
          label="CAC / registration number"
          placeholder="e.g. RC1234567"
          value={regNumber}
          onChange={(e) => setRegNumber(e.target.value)}
        />
        <FileUpload
          label="Certificate of incorporation (optional)"
          hint="PDF or image"
          onChange={setDoc}
        />
        <Button variant="primary" fullWidth onClick={handleSubmit} loading={loading} disabled={!canSubmit} className="mt-2">
          Submit for verification
        </Button>
      </div>
    </div>
  )
}
