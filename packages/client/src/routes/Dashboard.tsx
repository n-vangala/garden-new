import { createRoute, useNavigate } from '@tanstack/react-router'
import { authenticatedRoute } from '.'
import { authApi } from '../api/auth'
import { NavigationBar } from '../components/NavigationBar'
import UploadSection from '../components/UploadSection'
import PastUploads from '../components/PastUploadsPreview'

export const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  component: () => <Dashboard />,
})

function Dashboard() {
  const logout = authApi.useLogout()
  const navigate = useNavigate()

  return (
    <div className="w-screen h-screen bg-baby-powder font-nunitoSans">
      <NavigationBar
        userName="garden" // later replace with dynamic auth value
        onLogout={() =>
          logout.mutate(undefined, {
            onSuccess: () => navigate({ to: '/login' }),
          })
        }
        isLoggingOut={logout.isPending}
      />

      <div className="px-8 py-6">
        {/* Default vertical stack on small screens, horizontal row on large screens */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <UploadSection />
          </div>
          <div className="flex-1">
            <PastUploads />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
