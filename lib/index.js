import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

export const name = 'parakeet-voice-input'

const READY_URL = 'http://127.0.0.1:8080/ready'
const CHECK_INTERVAL_MS = 10_000
const RESTART_DELAY_MS = 2_000

async function isReady() {
  try {
    const response = await fetch(READY_URL, { signal: AbortSignal.timeout(2_000) })
    if (!response.ok) return false
    const body = await response.json()
    return body?.ready === true && Array.isArray(body.capabilities) && body.capabilities.includes('asr')
  } catch {
    return false
  }
}

export function apply(ctx) {
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const executable = resolve(packageRoot, 'runtime', process.platform === 'win32' ? 'nemo-speech.exe' : 'nemo-speech')
  const dshHome = process.env.DSH_HOME || resolve(homedir(), '.dsh')
  const model = resolve(dshHome, 'models', 'parakeet-tdt-0.6b-v3', 'parakeet-tdt-0.6b-v3.q8_0.gguf')

  if (!existsSync(executable)) throw new Error(`Parakeet runtime is missing: ${executable}`)
  if (!existsSync(model)) throw new Error(`Parakeet model is missing: ${model}`)

  ctx.effect(() => {
    let disposed = false
    let processHandle
    let timer

    const schedule = (delay) => {
      if (disposed) return
      clearTimeout(timer)
      timer = setTimeout(() => { void ensureRunning() }, delay)
    }

    const launch = () => {
      if (disposed || processHandle) return
      const child = spawn(executable, [
        'serve',
        '--asr-model', model,
        '--host', '127.0.0.1',
        '--port', '8080',
        '--cors-origin', '*',
        '--no-ui',
      ], {
        cwd: packageRoot,
        windowsHide: true,
        stdio: 'ignore',
      })
      processHandle = child
      child.once('error', () => {
        if (processHandle === child) processHandle = undefined
        schedule(RESTART_DELAY_MS)
      })
      child.once('exit', () => {
        if (processHandle === child) processHandle = undefined
        schedule(RESTART_DELAY_MS)
      })
      schedule(CHECK_INTERVAL_MS)
    }

    const ensureRunning = async () => {
      if (disposed) return
      if (await isReady()) {
        schedule(CHECK_INTERVAL_MS)
        return
      }
      if (processHandle) {
        processHandle.kill()
        processHandle = undefined
      }
      launch()
    }

    void ensureRunning()

    return () => {
      disposed = true
      clearTimeout(timer)
      processHandle?.kill()
      processHandle = undefined
    }
  }, 'Persistent Parakeet TDT v3 runtime')
}
