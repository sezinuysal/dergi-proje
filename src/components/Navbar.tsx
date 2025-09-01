'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userRoles, setUserRoles] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    // Session cookie'den kullanıcı durumunu kontrol et
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const user = await response.json()
          setIsLoggedIn(true)
          setUserName(user.name)
          // Kullanıcı rollerini al
          if (user.roles) {
            setUserRoles(user.roles.map((r: any) => r.role.name.toLowerCase()))
          }
        }
      } catch (error) {
        setIsLoggedIn(false)
      }
    }
    
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsLoggedIn(false)
      setUserName('')
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-light text-xl">D</span>
            </div>
            <span className="text-2xl font-light text-black">Dergi Rastgele</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            <Link href="/magazines" className="text-gray-700 hover:text-black transition-colors duration-300 font-light">
              Dergiler
            </Link>
            <Link href="/mini-series" className="text-gray-700 hover:text-black transition-colors duration-300 font-light">
              Mini Seriler
            </Link>
            {isLoggedIn && (
              <>
                <Link href="/library" className="text-gray-700 hover:text-black transition-colors duration-300 font-light">
                  Kitaplığım
                </Link>
                <Link href="/my-purchases" className="text-gray-700 hover:text-black transition-colors duration-300 font-light">
                  Satın Alma İşlemlerim
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <div className="flex items-center space-x-6">
                <span className="text-gray-700 font-light">Merhaba, {userName}</span>
                {(userRoles.includes('admin') || userRoles.includes('owner') || userRoles.includes('moderator')) && (
                  <Link 
                    href="/admin" 
                    className="text-gray-700 hover:text-black transition-colors duration-300 font-light"
                  >
                    Admin Paneli
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="border border-gray-300 text-gray-700 px-6 py-2 hover:border-black hover:text-black transition-all duration-300 font-light"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="text-gray-700 hover:text-black transition-colors duration-300 font-light"
                >
                  Giriş
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors duration-300 font-light"
                >
                  Üye Ol
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-black focus:outline-none focus:text-black transition-colors duration-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              <Link 
                href="/magazines" 
                className="block px-3 py-2 text-gray-700 hover:text-black transition-colors duration-300 font-light"
                onClick={() => setIsMenuOpen(false)}
              >
                Dergiler
              </Link>
              <Link 
                href="/mini-series" 
                className="block px-3 py-2 text-gray-700 hover:text-black transition-colors duration-300 font-light"
                onClick={() => setIsMenuOpen(false)}
              >
                Mini Seriler
              </Link>
              {isLoggedIn && (
                <>
                  <Link 
                    href="/library" 
                    className="block px-3 py-2 text-gray-700 hover:text-black transition-colors duration-300 font-light"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Kitaplığım
                  </Link>
                  <Link 
                    href="/my-purchases" 
                    className="block px-3 py-2 text-gray-700 hover:text-black transition-colors duration-300 font-light"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Satın Alma İşlemlerim
                  </Link>
                </>
              )}
              {isLoggedIn ? (
                <div className="px-3 py-2">
                  <span className="text-gray-700 font-light">Merhaba, {userName}</span>
                  {(userRoles.includes('admin') || userRoles.includes('owner') || userRoles.includes('moderator')) && (
                    <Link 
                      href="/admin" 
                      className="block px-3 py-2 text-gray-700 hover:text-black transition-colors duration-300 font-light"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Paneli
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full mt-2 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:border-black hover:text-black transition-all duration-300 font-light"
                  >
                    Çıkış
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link 
                    href="/auth/login" 
                    className="block px-3 py-2 text-gray-700 hover:text-black transition-colors duration-300 font-light"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giriş
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="block mx-3 bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors duration-300 font-light text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Üye Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
