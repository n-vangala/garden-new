import { Outlet } from '@tanstack/react-router'
import { Login } from './Login'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/auth'

export function AuthenticationWrapper() {
    const userQuery = useQuery({ ...authApi.whoamiQueryOptions() })

    if (userQuery.isPending) {
        return null
    }

    if (userQuery.isSuccess && userQuery.data.status === 'unauthenticated') {
        return <Login />
    }

    return <Outlet />
}
