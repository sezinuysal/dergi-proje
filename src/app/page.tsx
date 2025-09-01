import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - Minimalist */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-light text-black mb-8 tracking-tight">
            Dergi
            <span className="block font-normal text-gray-600">Rastgele</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Dijital dergi deneyimini yeniden tanımlıyoruz. 
            Sayfaları çevirerek okuyabileceğiniz, minimalist tasarım anlayışıyla hazırlanmış içerikler.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/magazines" 
              className="bg-black text-white px-12 py-4 text-lg font-light hover:bg-gray-800 transition-colors duration-300"
            >
              Dergileri Keşfet
            </Link>
            <Link 
              href="/auth/login" 
              className="border border-black text-black px-12 py-4 text-lg font-light hover:bg-black hover:text-white transition-all duration-300"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-24 h-px bg-gray-300 mx-auto mb-24"></div>

      {/* Üyelik Sistemi Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-light text-black text-center mb-16">
            Üyelik Sistemi
          </h2>
          
          {/* Roller Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {/* Owner */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">👑</span>
              </div>
              <h3 className="text-lg font-light text-black mb-2">Dergi Sahibi</h3>
              <p className="text-sm text-gray-600 mb-3">Tam yetki</p>
              <div className="w-16 h-1 bg-orange-400 mx-auto"></div>
            </div>

            {/* Admin */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">🛡️</span>
              </div>
              <h3 className="text-lg font-light text-black mb-2">Yönetici</h3>
              <p className="text-sm text-gray-600 mb-3">Sistem yönetimi</p>
              <div className="w-16 h-1 bg-red-500 mx-auto"></div>
            </div>

            {/* Editor */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">✏️</span>
              </div>
              <h3 className="text-lg font-light text-black mb-2">Editör</h3>
              <p className="text-sm text-gray-600 mb-3">İçerik yönetimi</p>
              <div className="w-16 h-1 bg-blue-600 mx-auto"></div>
            </div>

            {/* Moderator */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">🔍</span>
              </div>
              <h3 className="text-lg font-light text-black mb-2">Moderatör</h3>
              <p className="text-sm text-gray-600 mb-3">İçerik moderasyonu</p>
              <div className="w-16 h-1 bg-orange-500 mx-auto"></div>
            </div>
          </div>

          {/* Rozet Sistemi */}
          <div className="text-center mb-16">
            <h3 className="text-2xl font-light text-black mb-8">Rozet Sistemi</h3>
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
              YouTube tarzı rozet sistemi ile başarılarınızı gösterin ve yeni hedefler belirleyin
            </p>
            
            {/* Rozet Örnekleri */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h4 className="text-lg font-light text-black mb-2">İlk Dergi</h4>
                <p className="text-sm text-gray-600">İlk dergiyi okudun</p>
                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Yaygın</span>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h4 className="text-lg font-light text-black mb-2">Dergi Tutkunu</h4>
                <p className="text-sm text-gray-600">50 dergi okudun</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Efsanevi</span>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h4 className="text-lg font-light text-black mb-2">Mini Seri Ustası</h4>
                <p className="text-sm text-gray-600">5 mini seri tamamladın</p>
                <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Epik</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean Grid */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-light text-black text-center mb-16">
            Neler Sunuyoruz?
          </h2>
          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-gray-600">01</span>
              </div>
              <h3 className="text-xl font-light text-black mb-4">Dijital Dergiler</h3>
              <p className="text-gray-600 leading-relaxed">
                60-80 sayfalık interaktif dergiler, 
                minimalist tasarım anlayışıyla hazırlanmış
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-gray-600">02</span>
              </div>
              <h3 className="text-xl font-light text-black mb-4">Mini Seriler</h3>
              <p className="text-gray-600 leading-relaxed">
                410 sayfalık detaylı kitapçıklar, 
                derinlemesine içerik analizleri
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-gray-600">03</span>
              </div>
              <h3 className="text-xl font-light text-black mb-4">Kişisel Kitaplık</h3>
              <p className="text-gray-600 leading-relaxed">
                Erişim hakkınız olan tüm yayınları 
                tek yerden yönetin
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimalist */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-light text-black mb-8">
            Dijital Okuma Deneyimine Başlayın
          </h2>
          <p className="text-gray-600 mb-12 text-lg leading-relaxed">
            Hemen üye olun ve minimalist tasarım anlayışıyla hazırlanmış 
            dijital dergi dünyasına adım atın
          </p>
          <Link 
            href="/auth/register" 
            className="inline-block bg-black text-white px-12 py-4 text-lg font-light hover:bg-gray-800 transition-colors duration-300"
          >
            Ücretsiz Üye Ol
          </Link>
        </div>
      </section>

      {/* Footer - Minimalist */}
      <footer className="py-16 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-light text-lg">D</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 Dergi Rastgele. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </main>
  )
}
