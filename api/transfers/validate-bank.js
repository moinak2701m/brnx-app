import { validateBankAccount } from '../_lib/credible.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { account_number, ifsc, account_holder_name, currency = 'inr' } = req.body ?? {}
  if (!account_number || !ifsc || !account_holder_name) {
    return res.status(400).json({ error: 'account_number, ifsc and account_holder_name are required' })
  }

  try {
    const result = await validateBankAccount({ currency, account_number, ifsc, account_holder_name })
    const d = result?.data ?? result
    return res.status(200).json({
      status:                    d.status,
      account_holder_name_from_bank: d.account_holder_name_from_bank,
      transaction_reference_no:  d.transaction_reference_no,
      is_nre_account:            d.is_nre_account ?? false,
    })
  } catch (err) {
    console.error('[validate-bank]', err.message)
    return res.status(502).json({ error: err.message })
  }
}
