'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Publication {
  id: number
  title: string
  description: string | null
  type: string
  issue: string | null
  pageCount: number
  coverImage: string | null
  publishedAt: string | null
}

export default function MagazinesPage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'magazine' | 'mini_series'>('all')

  useEffect(() => {
    fetchPublications()
  }, [])

  const fetchPublications = async () => {
    try {
      const response = await fetch('/api/publications')
      if (response.ok) {
        const data = await response.json()
        setPublications(data.publications)
      }
    } catch (error) {
      console.error('Error fetching publications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPublications = publications.filter(pub => {
    if (filter === 'all') return true
    return pub.type === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 font-light">Dergiler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h1 className="text-5xl font-light text-black mb-6">Dijital Dergiler</h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Sayfaları çevirerek okuyabileceğiniz, minimalist tasarım anlayışıyla hazırlanmış dijital dergiler
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-4 mb-16">
          <button
            onClick={() => setFilter('all')}
            className={`px-8 py-3 font-light transition-all duration-300 ${
              filter === 'all'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-black hover:text-black'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter('magazine')}
            className={`px-8 py-3 font-light transition-all duration-300 ${
              filter === 'magazine'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-black hover:text-black'
            }`}
          >
            Dergiler
          </button>
          <button
            onClick={() => setFilter('mini_series')}
            className={`px-8 py-3 font-light transition-all duration-300 ${
              filter === 'mini_series'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-black hover:text-black'
            }`}
          >
            Mini Seriler
          </button>
        </div>

        {/* Publications Grid */}
        {filteredPublications.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl text-gray-400 font-light">01</span>
            </div>
            <h3 className="text-2xl font-light text-black mb-4">Henüz dergi yok</h3>
            <p className="text-gray-600 font-light">Yakında yeni dergiler eklenecek</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredPublications.map((publication) => (
              <div key={publication.id} className="group">
                {/* Cover Image */}
                <div className="aspect-[3/4] bg-gray-100 mb-6 overflow-hidden">
                  {publication.coverImage ? (
                    <img
                      src={publication.coverImage}
                      alt={publication.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl text-gray-300 font-light">01</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 text-xs font-light ${
                      publication.type === 'magazine' 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {publication.type === 'magazine' ? 'Dergi' : 'Mini Seri'}
                    </span>
                    {publication.issue && (
                      <span className="text-sm text-gray-500 font-light">{publication.issue}</span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-light text-black mb-4 leading-tight">{publication.title}</h3>
                  
                  {publication.description && (
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed font-light">{publication.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-light">{publication.pageCount} sayfa</span>
                    <Link
                      href={`/publication/${publication.id}`}
                      className="bg-black text-white px-6 py-2 text-sm font-light hover:bg-gray-800 transition-colors duration-300"
                    >
                      Oku
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 