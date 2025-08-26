const { createServer } = require('http')
const { parse } = require('url')
const path = require('path')
const fs = require('fs')

// Check if standalone build exists
const standalonePath = path.join(__dirname, '.next', 'standalone', 'server.js')
const hasStandalone = fs.existsSync(standalonePath)

if (hasStandalone) {
  console.log('Running standalone build')
  // Change working directory to standalone
  process.chdir(path.join(__dirname, '.next', 'standalone'))
  require(standalonePath)
} else {
  console.log('Running regular Next.js build')
  const next = require('next')
  
  const dev = false // Always production on server
  const hostname = process.env.HOSTNAME || '0.0.0.0'
  const port = parseInt(process.env.PORT) || 3000
  
  const app = next({ dev, hostname, port })
  const handle = app.getRequestHandler()
  
  app.prepare().then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err)
        res.statusCode = 500
        res.end('internal server error')
      }
    })
      .once('error', (err) => {
        console.error(err)
        process.exit(1)
      })
      .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
      })
  }).catch((ex) => {
    console.error('Failed to start server:', ex)
    process.exit(1)
  })
}