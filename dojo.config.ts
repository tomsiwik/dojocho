import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

interface DojoConfig {
  basePath: string
  katasPath: string
}

function defineConfig(config: Partial<DojoConfig> = {}): DojoConfig {
  const basePath = resolve(__dirname, config.basePath ?? ".")
  return {
    basePath,
    katasPath: config.katasPath ?? resolve(basePath, "katas"),
  }
}

export default defineConfig()
