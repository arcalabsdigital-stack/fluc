import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Sidebar />
      <div className="flex flex-col min-h-screen md:pl-[280px]">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
