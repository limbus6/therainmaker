import fs from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function reviewCapturePlugin() {
  const fixesFile = path.resolve(__dirname, 'Fixes.md')

  return {
    name: 'review-capture',
    configureServer(server: { middlewares: { use: (path: string, handler: (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, next: () => void) => void) => void } }) {
      server.middlewares.use('/api/reviews', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }

        const chunks: Uint8Array[] = []
        req.on('data', (chunk) => chunks.push(chunk))
        req.on('end', async () => {
          try {
            const raw = Buffer.concat(chunks).toString('utf8')
            const payload = JSON.parse(raw) as {
              phase?: number
              phaseLabel?: string
              checkpointId?: string
              checkpointLabel?: string
              checkpointDescription?: string
              route?: string
              review?: string
            }

            const review = payload.review?.trim()
            if (!review) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Review text is required.' }))
              return
            }

            const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', ' UTC')
            const entry = [
              '',
              `## ${timestamp}`,
              `- Phase: P${payload.phase ?? '?'} — ${payload.phaseLabel ?? 'Unknown phase'}`,
              `- Checkpoint: ${payload.checkpointLabel ?? payload.checkpointId ?? 'Unknown checkpoint'}`,
              `- Route: ${payload.route ?? 'n/a'}`,
              payload.checkpointDescription ? `- Context: ${payload.checkpointDescription}` : null,
              '',
              review,
              '',
            ].filter(Boolean).join('\n')

            try {
              await fs.access(fixesFile)
            } catch {
              await fs.writeFile(fixesFile, '# Gameplay Fixes\n', 'utf8')
            }

            await fs.appendFile(fixesFile, entry, 'utf8')

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Could not persist review.' }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  base: '/therainmaker/',
  plugins: [react(), tailwindcss(), reviewCapturePlugin()],
})
