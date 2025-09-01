'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface PurchaseRequest {
  id: number
  publicationId: number
  status: 'pending' | 'approved' | 'rejected'
  paymentMethod?: string
  amount?: number
  notes?: string
  createdAt: string
  publication: {
    id: number
    title: string
    type: string
    coverImage?: string
  }
}

interface DigitalToken {
  id: number
  publicationId: number
  token: string
  accessType: string
  expiresAt?: string
  createdAt: string
  publication: {
    id: number
    title: string
    type: string
    coverImage?: string
  }
}

export default function MyPurchasesPage() {
  const { data: session, status } = useSession()
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([])
  const [digitalTokens, setDigitalTokens] = useState<DigitalToken[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'requests' | 'tokens'>('requests')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      redirect('/auth/login')
    }

    fetchData()
  }, [session, status])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [requestsRes, tokensRes] = await Promise.all([
        fetch('/api/user/purchase-requests'),
        fetch('/api/user/digital-tokens')
      ])
      
      if (requestsRes.ok) {
        const requests = await requestsRes.json()
        setPurchaseRequests(requests)
      }
      
      if (tokensRes.ok) {
        const tokens = await tokensRes.json()
        setDigitalTokens(tokens)
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error)
    }
    setLoading(false)
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor'
      case 'approved': return 'Onaylandı'
      case 'rejected': return 'Reddedildi'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-light text-gray-800 mb-8">Satın Alma İşlemlerim</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'requests' 
                ? 'bg-black text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Satın Alma İstekleri
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tokens' 
                ? 'bg-black text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dijital Erişim Token'ları
          </button>
        </div>

        {/* Satın Alma İstekleri Tab */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-light text-gray-800">Satın Alma İsteklerim</h2>
            </div>
            <div className="p-6">
              {purchaseRequests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Henüz satın alma isteğiniz bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {purchaseRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{request.publication.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Dergi Türü:</span> {request.publication.type}
                        </div>
                        <div>
                          <span className="font-medium">Tarih:</span> {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                        {request.paymentMethod && (
                          <div>
                            <span className="font-medium">Ödeme Yöntemi:</span> {request.paymentMethod}
                          </div>
                        )}
                        {request.amount && (
                          <div>
                            <span className="font-medium">Tutar:</span> {request.amount} TL
                          </div>
                        )}
                      </div>
                      
                      {request.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <span className="font-medium text-sm text-gray-700">Notlar:</span>
                          <p className="text-sm text-gray-600 mt-1">{request.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dijital Token'lar Tab */}
        {activeTab === 'tokens' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-light text-gray-800">Dijital Erişim Token'larım</h2>
            </div>
            <div className="p-6">
              {digitalTokens.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Henüz dijital erişim token'ınız bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {digitalTokens.map((token) => (
                    <div key={token.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{token.publication.title}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Aktif
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Dergi Türü:</span> {token.publication.type}
                        </div>
                        <div>
                          <span className="font-medium">Erişim Türü:</span> {token.accessType}
                        </div>
                        <div>
                          <span className="font-medium">Oluşturulma Tarihi:</span> {new Date(token.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                        {token.expiresAt && (
                          <div>
                            <span className="font-medium">Geçerlilik:</span> {new Date(token.expiresAt).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md">
                        <span className="font-medium text-sm text-gray-700">Token:</span>
                        <div className="mt-1 font-mono text-sm text-gray-600 break-all">
                          {token.token.substring(0, 20)}...
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 