import path from 'path'
import { load } from 'ts-dotenv'

const schema = {
    ENV: ['local' as const, 'remote' as const],
    VM_IP_ADDRESS: String
}

export const env = load(schema, {
    path: path.join(__dirname, '../../../.env')
})
