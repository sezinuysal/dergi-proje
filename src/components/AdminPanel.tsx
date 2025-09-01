'use client'

import { useState, useEffect } from 'react'
import { User, Role, Publication } from '@prisma/client'

interface AdminPanelProps {
  currentUser: User & {
    roles: { role: Role }[]
  }
}

interface UserWithRoles extends User {
  roles: { role: Role }[]
  publications: { publication: Publication }[]
}

interface PurchaseRequest {
  id: number
  userId: number
  publicationId: number
  user: User
  publication: Publication
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
}

export default function AdminPanel({ currentUser }: AdminPanelProps) {
  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'purchases' | 'roles'>('users')
  const [loading, setLoading] = useState(false)

  // Admin yetkisi kontrolü
  const isAdmin = currentUser.roles.some(r => 
    ['admin', 'owner', 'moderator'].includes(r.role.name.toLowerCase())
  )

  useEffect(() => {
    if (isAdmin) {
      fetchData()
    }
  }, [isAdmin])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, rolesRes, purchasesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/roles'),
        fetch('/api/admin/purchases')
      ])
      
      if (usersRes.ok) setUsers(await usersRes.json())
      if (rolesRes.ok) setRoles(await rolesRes.json())
      if (purchasesRes.ok) setPurchaseRequests(await purchasesRes.json())
    } catch (error) {
      console.error('Veri yüklenirken hata:', error)
    }
    setLoading(false)
  }

  const assignRole = async (userId: number, roleId: number) => {
    try {
      const res = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId })
      })
      
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Rol atama hatası:', error)
    }
  }

  const removeRole = async (userId: number, roleId: number) => {
    try {
      const res = await fetch('/api/admin/remove-role', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId })
      })
      
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Rol kaldırma hatası:', error)
    }
  }

  const approvePurchase = async (purchaseId: number) => {
    try {
      const res = await fetch('/api/admin/approve-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId })
      })
      
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Satın alma onay hatası:', error)
    }
  }

  const rejectPurchase = async (purchaseId: number) => {
    try {
      const res = await fetch('/api/admin/reject-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId })
      })
      
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Satın alma red hatası:', error)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-800 mb-4">Erişim Reddedildi</h1>
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-light text-gray-800 mb-8">Admin Paneli</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users' 
                ? 'bg-black text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Kullanıcılar
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'purchases' 
                ? 'bg-black text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Satın Alma Onayları
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'roles' 
                ? 'bg-black text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Roller
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Kullanıcılar Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-light text-gray-800">Kullanıcı Yönetimi</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kullanıcı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Roller
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Erişim Hakkı Olan Dergiler
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-2">
                              {user.roles.map((userRole) => (
                                <span
                                  key={userRole.role.id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {userRole.role.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.publications.length} dergi
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <select
                              onChange={(e) => {
                                const roleId = parseInt(e.target.value)
                                if (roleId > 0) {
                                  assignRole(user.id, roleId)
                                }
                              }}
                              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                              defaultValue=""
                            >
                              <option value="">Rol Ekle</option>
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Satın Alma Onayları Tab */}
            {activeTab === 'purchases' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-light text-gray-800">Satın Alma Onayları</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kullanıcı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dergi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tarih
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchaseRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{request.user.name}</div>
                            <div className="text-sm text-gray-500">{request.user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{request.publication.title}</div>
                            <div className="text-sm text-gray-500">{request.publication.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status === 'pending' ? 'Bekliyor' :
                               request.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {request.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => approvePurchase(request.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Onayla
                                </button>
                                <button
                                  onClick={() => rejectPurchase(request.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reddet
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Roller Tab */}
            {activeTab === 'roles' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-light text-gray-800">Rol Yönetimi</h2>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map((role) => (
                      <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                          <div 
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: role.color || '#6B7280' }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                        <div className="text-xs text-gray-500">
                          İkon: {role.icon || 'Yok'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 