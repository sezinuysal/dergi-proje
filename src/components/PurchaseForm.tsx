'use client'

import { useState } from 'react'

interface PurchaseFormProps {
  publicationId: number
  publicationTitle: string
  onSuccess: () => void
}

export default function PurchaseForm({ publicationId, publicationTitle, onSuccess }: PurchaseFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    paymentMethod: 'credit_card',
    amount: '29.99',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/purchase/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          publicationId,
          ...formData
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        onSuccess()
        setFormData({
          paymentMethod: 'credit_card',
          amount: '29.99',
          notes: ''
        })
      } else {
        const error = await response.json()
        alert(`Hata: ${error.error}`)
      }
    } catch (error) {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {publicationTitle} - Satın Alma İsteği
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ödeme Yöntemi
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            required
          >
            <option value="credit_card">Kredi Kartı</option>
            <option value="bank_transfer">Banka Transferi</option>
            <option value="cash">Nakit</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tutar (TL)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="29.99"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notlar (Opsiyonel)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Özel istekleriniz veya notlarınız..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Gönderiliyor...' : 'Satın Alma İsteği Gönder'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          💡 <strong>Bilgi:</strong> Satın alma isteğiniz admin tarafından onaylandıktan sonra 
          dijital erişim token'ınız otomatik olarak oluşturulacak ve dergiye erişim sağlayabileceksiniz.
        </p>
      </div>
    </div>
  )
} 