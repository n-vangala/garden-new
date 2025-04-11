import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './routes'

import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './query'

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
    </QueryClientProvider>
)
