import { type NextFunction, Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import crypto from 'node:crypto'
import { env } from '../env'

export const authRouter = Router()

const users = [
    {
        username: 'garden',
        password: 'cHg9LmF7WVBdbTcCaw'
    }
]

const userSessions: {
    [token: string]: {
        username: string
        expiresAt: Date
    }
} = {}

setInterval(() => {
    for (const [token, session] of Object.entries(userSessions)) {
        if (session.expiresAt <= new Date()) {
            delete userSessions[token]
        }
    }
}, 60 * 1000)

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000
const cookieName = 'takehome-auth'

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies[cookieName] as unknown
        if (typeof token !== 'string') {
            res.sendStatus(StatusCodes.UNAUTHORIZED)
            return
        }

        const session = userSessions[token]
        if (session === undefined) {
            res.sendStatus(StatusCodes.UNAUTHORIZED)
            return
        }
        if (session.expiresAt <= new Date()) {
            delete userSessions[token]
            res.sendStatus(StatusCodes.UNAUTHORIZED)
            return
        }

        req.auth = {
            username: session.username,
            sessionToken: token
        }
        next()
    } catch (_) {
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

authRouter.post('/login', (req, res) => {
    const result = z
        .object({
            username: z.string(),
            password: z.string()
        })
        .safeParse(req.body)
    if (!result.success) {
        res.sendStatus(StatusCodes.BAD_REQUEST)
        return
    }
    const { username, password } = result.data

    const user = users.find((user) => user.username === username && user.password === password)
    if (user === undefined) {
        res.sendStatus(StatusCodes.UNAUTHORIZED)
        return
    }

    const token = crypto.randomBytes(32).toString('hex')
    userSessions[token] = { username, expiresAt: new Date(Date.now() + FIVE_DAYS_MS) }

    res.cookie(cookieName, token, {
        domain: env.ENV === 'local' ? 'localhost' : env.VM_IP_ADDRESS,
        secure: false,
        httpOnly: true,
        path: '/',
        sameSite: 'lax'
    })
    res.json({ username })
    return
})

authRouter.post('/logout', authMiddleware, (req, res) => {
    if (req.auth === undefined) {
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
        return
    }
    delete userSessions[req.auth.sessionToken]

    res.clearCookie(cookieName, {
        domain: env.ENV === 'local' ? 'localhost' : env.VM_IP_ADDRESS,
        secure: false,
        httpOnly: true,
        path: '/',
        sameSite: 'lax'
    })
    res.sendStatus(StatusCodes.OK)
})

authRouter.get('/whoami', authMiddleware, (req, res) => {
    if (req.auth === undefined) {
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
        return
    }

    res.json({ username: req.auth.username })
    return
})
