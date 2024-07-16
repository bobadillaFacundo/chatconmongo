// import path from "path"
// import { fileURLToPath } from "url"

const path = require('path')
const { fileURLToPath } = require('url')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default __dirname