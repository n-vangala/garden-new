declare namespace Express {
    export interface Request {
        auth?: {
            username: string
            sessionToken: string
        }
    }
}
