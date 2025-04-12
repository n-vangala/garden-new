import path from 'path'
import { load } from 'ts-dotenv'

const schema = {
    ENV: ['local' as const, 'remote' as const],
    VM_IP_ADDRESS: String,
    MONGODB_URI: { type: String, optional: true }
}

export const env = load(schema, {
    path: path.join(__dirname, '../../../.env')
})

// Set default MongoDB URI if not provided
if (!env.MONGODB_URI) {
    (env as any).MONGODB_URI = 'mongodb://localhost:27017/file-uploads'
}
