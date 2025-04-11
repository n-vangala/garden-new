import { dirname as getDirname, join } from 'path'
import { fileURLToPath } from 'url'

const dirname = getDirname(fileURLToPath(import.meta.url))

export default {
    plugins: {
        '@tailwindcss/postcss': {
            config: join(dirname, './tailwind.config.ts')
        },
        autoprefixer: {}
    }
}
