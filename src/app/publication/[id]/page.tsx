'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface PublicationAccess {
  success: boolean
  access: boolean
  accessType: string
  publication: {
    id: number
    title: string
    type: string
    fileKey: string | null
    token: string | null
  }
  userRoles: string[]
}

export default function PublicationViewerPage() {
  const params = useParams()
  const router = useRouter()
  const [access, setAccess] = useState<PublicationAccess | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    try {
      const response = await fetch(`/api/publications/${params.id}/access`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setAccess(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erişim hatası')
      }
    } catch (error) {
      setError('Sunucu hatası')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 font-light">Erişim kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  if (error || !access) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-2xl font-light text-black mb-4">Erişim Reddedildi</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {error || 'Bu yayına erişim yetkiniz bulunmamaktadır. Sadece yöneticiler ve yetkili kullanıcılar erişebilir.'}
          </p>
          <div className="space-y-4">
            <Link 
              href="/auth/login" 
              className="block w-full bg-black text-white px-6 py-3 text-center font-light hover:bg-gray-800 transition-colors duration-300"
            >
              Giriş Yap
            </Link>
            <Link 
              href="/magazines" 
              className="block w-full border border-black text-black px-6 py-3 text-center font-light hover:bg-black hover:text-white transition-all duration-300"
            >
              Dergilere Dön
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!access.access) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-2xl font-light text-black mb-4">Erişim Gerekli</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Bu yayını görüntülemek için uygun yetkiye sahip olmanız gerekmektedir. 
            Lütfen yöneticinizle iletişime geçin.
          </p>
          <div className="space-y-4">
            <Link 
              href="/magazines" 
              className="block w-full bg-black text-white px-6 py-3 text-center font-light hover:bg-gray-800 transition-colors duration-300"
            >
              Dergilere Dön
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Erişim var - Flipbook göster
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/magazines" 
                className="text-gray-600 hover:text-black transition-colors duration-300 font-light"
              >
                ← Dergilere Dön
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-light text-black">{access.publication.title}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-gray-500 font-light">
                    {access.publication.type === 'magazine' ? 'Dergi' : 'Mini Seri'}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-sm text-gray-500 font-light">
                    Erişim: {access.accessType}
                  </span>
                  {access.userRoles.includes('admin') && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Yönetici
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Token Bilgisi - Sadece yöneticiler için */}
            {access.accessType === 'admin' && access.publication.token && (
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Erişim Token:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                  {access.publication.token}
                </code>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flipbook Viewer */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {access.accessType === 'admin' ? (
          <div className="text-center">
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">📖</span>
            </div>
            <h2 className="text-3xl font-light text-black mb-6">
              Flipbook Viewer
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Yönetici yetkisine sahipsiniz. Bu dergiyi tam olarak görüntüleyebilir, 
              sayfaları çevirebilir ve tüm özelliklere erişebilirsiniz.
            </p>
            
            {/* Flipbook Placeholder */}
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 mb-8">
              <div className="text-center">
                <span className="text-6xl text-gray-400 mb-4 block">📚</span>
                <h3 className="text-xl font-light text-gray-600 mb-2">
                  {access.publication.title}
                </h3>
                <p className="text-gray-500 font-light">
                  Flipbook viewer burada yüklenecek
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                  <button className="px-6 py-2 bg-black text-white font-light hover:bg-gray-800 transition-colors duration-300">
                    Önceki Sayfa
                  </button>
                  <span className="px-6 py-2 bg-white text-gray-600 font-light border border-gray-300">
                    Sayfa 1 / 64
                  </span>
                  <button className="px-6 py-2 bg-black text-white font-light hover:bg-gray-800 transition-colors duration-300">
                    Sonraki Sayfa
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Bilgileri */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h4 className="text-lg font-light text-blue-900 mb-4">Yönetici Bilgileri</h4>
              <div className="text-left space-y-2 text-sm">
                <p><strong>Dosya:</strong> {access.publication.fileKey}</p>
                <p><strong>Token:</strong> {access.publication.token}</p>
                <p><strong>Yetkiler:</strong> Okuma, İndirme, Yönetim</p>
                <p><strong>Roller:</strong> {access.userRoles.join(', ')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">📖</span>
            </div>
            <h2 className="text-3xl font-light text-black mb-6">
              Sınırlı Erişim
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Bu yayına {access.accessType} yetkisiyle erişiyorsunuz. 
              Tam flipbook görüntüleme için yönetici yetkisi gereklidir.
            </p>
            
            <Link 
              href="/magazines" 
              className="inline-block bg-black text-white px-8 py-3 font-light hover:bg-gray-800 transition-colors duration-300"
            >
              Dergilere Dön
            </Link>
          </div>
        )}
      </div>
    </div>
  )
} 