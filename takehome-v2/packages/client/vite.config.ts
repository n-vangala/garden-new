import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import { load } from 'ts-dotenv'

const schema = {
    ENV: ['local' as const, 'remote' as const],
    VM_IP_ADDRESS: String
}

const env = load(schema, {
    path: path.join(__dirname, '../../.env')
})

export default defineConfig(() => ({
    root: __dirname,
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 3001
    },
    define: {
        ENV: JSON.stringify(env.ENV),
        VM_IP_ADDRESS: JSON.stringify(env.VM_IP_ADDRESS)
    }
}))
