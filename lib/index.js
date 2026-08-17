import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

export const name = 'parakeet-voice-input'

const READY_URL = 'http://127.0.0.1:8080/ready'
const START_ROUTE = '/plugins/parakeet/start'
const STOP_ROUTE = '/plugins/parakeet/stop'

export function apply(ctx) {
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const executable = resolve(packageRoot, 'runtime', process.platform === 'win32' ? 'nemo-speech.exe' : 'nemo-speech')
  const dshHome = process.env.DSH_HOME || resolve(homedir(), '.dsh')
  const model = process.env.DSH_PARAKEET_MODEL || resolve(dshHome, 'models', 'parakeet-tdt-0.6b-v3', 'parakeet-tdt-0.6b-v3.q8_0.gguf')
  let processHandle
  let starting

  const ready = async () => {
    try {
      const response = await fetch(READY_URL, { signal: AbortSignal.timeout(1500) })
      if (!response.ok) return false
      const body = await response.json()
      return body?.ready === true && Array.isArray(body.capabilities) && body.capabilities.includes('asr')
    } catch { return false }
  }

  const start = async () => {
    if (!existsSync(executable) || !existsSync(model)) return false
    if (await ready()) return true
    if (starting !== undefined) return starting
    starting = new Promise((resolveStart) => {
      const child = spawn(executable, ['serve', '--asr-model', model, '--host', '127.0.0.1', '--port', '8080', '--cors-origin', '*', '--no-ui'], {
        cwd: packageRoot,
        windowsHide: true,
        stdio: 'ignore',
      })
      processHandle = child
      child.once('exit', () => { if (processHandle === child) processHandle = undefined })
      const deadline = Date.now() + 10_000
      const poll = async () => {
        if (await ready()) { resolveStart(true); return }
        if (Date.now() >= deadline || processHandle !== child) { resolveStart(false); return }
        setTimeout(() => { void poll() }, 250)
      }
      void poll()
    }).finally(() => { starting = undefined })
    return starting
  }

  const stop = () => {
    processHandle?.kill()
    processHandle = undefined
  }

  ctx.inject(['webServer'], (webCtx) => {
    const startRoute = webCtx.webServer.register({ kind: 'exact', path: START_ROUTE, handler: async (_req, res) => {
      const ok = await start()
      res.writeHead(ok ? 204 : 503)
      res.end()
    } })
    const stopRoute = webCtx.webServer.register({ kind: 'exact', path: STOP_ROUTE, handler: (_req, res) => {
      stop()
      res.writeHead(204)
      res.end()
    } })
    webCtx.effect(() => () => { startRoute(); stopRoute(); stop() }, 'Parakeet runtime on demand')
  })
}
