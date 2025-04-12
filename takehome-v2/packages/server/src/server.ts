import express from 'express'
import { authRouter } from './routers/auth'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './env'

const xss = express()

const corsOrigin = env.ENV === 'local' ? 'http://localhost:3001' : `http://${env.VM_IP_ADDRESS}:3001`
xss.use(
    cors({
        origin: corsOrigin,
        credentials: true
    })
)
xss.use(cookieParser())
xss.use(express.json())

xss.use('/auth', authRouter)

xss.listen(3000, () => {
    console.log(`Server is running on port 3000 (${env.ENV}) and accepting traffic with origin ${corsOrigin}`)
})
