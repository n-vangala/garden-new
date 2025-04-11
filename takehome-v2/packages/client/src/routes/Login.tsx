import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '.'
import { Login } from '../components/Login'

export const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: () => <Login />
})
