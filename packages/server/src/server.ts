import express from 'express'
import { authRouter } from './routers/auth'
import { uploadsRouter } from './routers/uploads'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './env'
import { connectDB } from './db/mongo'

// Initialize Express app
const app = express()

const corsOrigin = env.ENV === 'local' ? 'http://localhost:3001' : `http://${env.VM_IP_ADDRESS}:3001`
app.use(
    cors({
        origin: corsOrigin,
        credentials: true
    })
)
app.use(cookieParser())
app.use(express.json())

// Mount routes
app.use('/auth', authRouter)
app.use('/api/uploads', uploadsRouter)

// Connect to MongoDB and start server
connectDB()
    .then(() => {
        app.listen(3000, () => {
            console.log(`Server is running on port 3000 (${env.ENV}) and accepting traffic with origin ${corsOrigin}`)
        })
    })
    .catch(error => {
        console.error('Failed to connect to MongoDB:', error)
        process.exit(1)
    })
