import { createRoute, useNavigate } from '@tanstack/react-router'
import { authenticatedRoute } from '.'
import { authApi } from '../api/auth'
import { NavigationBar } from '../components/NavigationBar'
import UploadSection from '../components/UploadSection'
import PastUploads from '../components/PastUploadsPreview'

export const dashboardRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/dashboard',
    component: () => <Dashboard />
})

function Dashboard() {
    const logout = authApi.useLogout()
    const navigate = useNavigate()
  
    return (
      <div className="w-screen h-screen bg-baby-powder font-nunitoSans">
        <NavigationBar
          userName="garden" // change to get from auth
          onLogout={() =>
            logout.mutate(undefined, {
              onSuccess: () => navigate({ to: '/login' })
            })
          }
          isLoggingOut={logout.isPending}
        />
        <div className="flex flex-col gap-8 px-8 py-6">
            {/* Section 1: Upload new file */}
            <UploadSection />

            {/* Section 2: View past uploads */}
            <PastUploads />
        </div>
      </div>
    );
  }