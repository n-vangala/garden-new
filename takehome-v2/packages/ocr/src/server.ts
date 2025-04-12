import express from 'express'
import cors from 'cors'
import { StatusCodes } from 'http-status-codes'
import { LoremIpsum } from 'lorem-ipsum'

const xss = express()

xss.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true
    })
)

xss.post('/ocr', express.raw({ type: 'image/jpeg', limit: '10mb' }), async (req, res) => {
    if (!(req.body instanceof Buffer) || !(req.body.buffer instanceof ArrayBuffer)) {
        res.sendStatus(StatusCodes.BAD_REQUEST)
        return
    }

    if (req.body.length < 3 || req.body[0] !== 0xff || req.body[1] !== 0xd8 || req.body[2] !== 0xff) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid JPEG format' })
        return
    }

    await new Promise((resolve) => {
        setTimeout(resolve, Math.random() * 3000 + 2000) // 2-5 second delay
    })

    if (Math.random() < 0.03) {
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
        return
    }

    // Random between 10-20 paragraphs
    const ocrResult = new LoremIpsum({
        sentencesPerParagraph: {
            max: 16,
            min: 8
        },
        wordsPerSentence: {
            max: 32,
            min: 16
        }
    }).generateParagraphs(Math.floor(Math.random() * 11) + 10)

    res.json({ text: ocrResult })
    return
})

xss.listen(4001, () => {
    console.log('OCR service is running on port 4001')
})
