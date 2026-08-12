import { useState } from 'react'
import { Users, Plus } from 'lucide-react'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { useToast } from '../../../components/ui/Toast'
import useAfricaStore from '../../store'

export default function Senders() {
  const senders = useAfricaStore((s) => s.senders)
  const addSender = useAfricaStore((s) => s.addSender)
  const toast = useToast()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')

  const handleAdd = () => {
    if (!name) return
    addSender({ name, country: country || 'Nigeria' })
    toast?.(`${name} added as a sender`)
    setName('')
    setCountry('')
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Senders</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} className="mr-1" /> Add sender
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 mb-6 flex flex-col gap-3">
          <Input label="Sender name" placeholder="e.g. Abuja Traders Ltd" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Country" placeholder="Nigeria" value={country} onChange={(e) => setCountry(e.target.value)} />
          <Button onClick={handleAdd} disabled={!name}>Save sender</Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {senders.map((s) => (
          <div key={s.id} className="bg-white border border-[#e5e7eb] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-[#1a56db]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">{s.name}</p>
              <p className="text-xs text-[#9ca3af]">{s.country}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
