import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const client = await readFile(resolve(root, packageJson.exports['./client']), 'utf8')

const expected = `id: "${packageJson.name}"`
if (!client.includes(expected)) {
  throw new Error(`client bundle must register ${packageJson.name}`)
}
if (!client.includes('window.__ModuleLoader__.load')) {
  throw new Error('client bundle is missing the DSH module-loader handoff')
}
console.log(`verified ${packageJson.name} ${packageJson.version}`)
