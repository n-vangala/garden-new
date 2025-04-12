import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { AuthenticationWrapper } from '../components/AuthenticationWrapper'
import { dashboardRoute } from './Dashboard'
import { loginRoute } from './Login'
import { uploadsRoute } from './Uploads'

export const rootRoute = createRootRoute()
export const authenticatedRoute = createRoute({
    id: 'authenticated',
    getParentRoute: () => rootRoute,
    component: () => <AuthenticationWrapper />
})
const catchAllRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '*',
    beforeLoad: () => {
        throw redirect({ to: '/dashboard' })
    }
})

export const router = createRouter({
    routeTree: rootRoute.addChildren([
        loginRoute,
        authenticatedRoute.addChildren([
            dashboardRoute,
            uploadsRoute
        ]),
        catchAllRoute
    ])
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
