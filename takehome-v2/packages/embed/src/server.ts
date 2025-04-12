import express from 'express'
import cors from 'cors'
import z from 'zod'
import { StatusCodes } from 'http-status-codes'

const xss = express()

xss.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true
    })
)
xss.use(express.json())

xss.post('/embed', async (req, res) => {
    const result = z
        .object({
            text: z.string()
        })
        .safeParse(req.body)
    if (!result.success) {
        res.sendStatus(StatusCodes.BAD_REQUEST)
        return
    }
    const { text: _text } = result.data

    await new Promise((resolve) => {
        setTimeout(resolve, Math.random() * 5000 + 2000)
    })

    if (Math.random() < 0.01) {
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
        return
    }

    const embedding = Array.from({ length: 1024 }, () => Math.random() * 2 - 1)
    res.json({ embedding })
})

xss.listen(4000, () => {
    console.log('Embedding service is running on port 4000')
})
