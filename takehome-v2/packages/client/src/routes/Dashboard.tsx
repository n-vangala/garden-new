import { createRoute, useNavigate } from '@tanstack/react-router'
import { authenticatedRoute } from '.'
import { authApi } from '../api/auth'
import { motion } from 'framer-motion'

export const dashboardRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/dashboard',
    component: () => <Dashboard />
})

function Dashboard() {
    const logout = authApi.useLogout()
    const navigate = useNavigate()

    return (
        <div className='w-screen h-screen bg-baby-powder flex items-center justify-center'>
            <motion.button
                className='font-nunitoSans text-white text-md font-semibold flex flex-row px-8 items-center justify-center rounded-full py-4 hover:cursor-pointer'
                initial={{ backgroundColor: 'var(--color-primary-100)' }}
                animate={{ backgroundColor: 'var(--color-primary-100)' }}
                whileHover={{ backgroundColor: 'var(--color-primary-120)' }}
                transition={{ duration: 0.1 }}
                onClick={() => {
                    logout.mutate(undefined, {
                        onSuccess: () => {
                            navigate({ to: '/login' })
                        }
                    })
                }}
                disabled={logout.isPending}
            >
                Log out
            </motion.button>
        </div>
    )
}
