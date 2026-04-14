import axios from 'axios'
import dotenv from 'dotenv'
import { chromium } from 'playwright'

dotenv.config()

const urls = [
  'https://www.lemonde.fr/chaleur-humaine/article/2025/01/30/mesurez-votre-impact-environnement-avec-le-calculateur-d-empreinte-carbone-et-eau_6523433_6125299.html',
  'https://geneve.nosgestesclimat.ch/fr',
]

const iframeId = 'iframeNGC'

async function checkConnection(url) {
  try {
    const response = await axios.get(url, { timeout: 30000 })
    return response.status === 200
  } catch (error) {
    console.log(`Connection check failed for ${url}:`, error.message)
    return false
  }
}

async function healthcheck() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-application-cache',
      '--disable-cache',
      '--disable-offline-load-stale-cache',
      '--disk-cache-size=0',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  })

  let urlContext

  try {
    const errors = []

    for (const url of urls) {
      console.log(`\nChecking URL: ${url}`)

      if (!(await checkConnection(url))) {
        console.log(`Cannot connect to ${url}, skipping...`)
        errors.push(url)
        continue
      }

      // Create a new context for each URL to avoid persistence
      urlContext = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        // Clear cache and cookies on each run
        ignoreHTTPSErrors: true,
        bypassCSP: true,
        // Disable cache
        extraHTTPHeaders: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      })

      // Explicitly clear cache and cookies
      await urlContext.clearCookies()

      const page = await urlContext.newPage()

      // Disable cache on page side
      await page.setExtraHTTPHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      })

      try {
        await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 120000,
        })

        try {
          // Retry mechanism for iframe loading and validation
          let retryCount = 0
          const maxRetries = 3
          let iframeValid = false

          while (retryCount < maxRetries && !iframeValid) {
            try {
              console.log(
                `Attempt ${retryCount + 1}/${maxRetries} for iframe validation`
              )

              // Wait for iframe loading
              await page.waitForSelector(`#${iframeId}`, { timeout: 30000 })

              // Wait for the iframe content to be loaded and stable
              const frame = page.frameLocator(`#${iframeId}`)

              // Wait for content to be loaded with retry mechanism
              let contentLoaded = false
              let attempts = 0
              const maxContentAttempts = 10 // 10 attempts × 2 seconds = 20 seconds max

              while (!contentLoaded && attempts < maxContentAttempts) {
                try {
                  // Wait a bit for any redirects or dynamic content to load
                  await page.waitForTimeout(2000)

                  const pageContent = await frame.locator('body').innerText()

                  // Debug: Log what we actually see in the iframe
                  console.log(
                    `\n--- Iframe content (attempt ${attempts + 1}) ---`
                  )
                  console.log('Content length:', pageContent.length)
                  console.log(
                    'First 500 characters:',
                    pageContent.substring(0, 500)
                  )
                  if (pageContent.length > 500) {
                    console.log('... (truncated)')
                  }
                  console.log('--- End iframe content ---\n')

                  // Check if the expected content is present
                  const validPatterns = [
                    'Avant de commencer',
                    'Passer la question',
                  ]
                  const isValid = validPatterns.some((pattern) => {
                    const found = pageContent
                      .toLowerCase()
                      .includes(pattern.toLowerCase())
                    console.log(`Pattern "${pattern}" found:`, found)
                    return found
                  })

                  if (isValid) {
                    console.log('Expected content found, iframe is ready')
                    contentLoaded = true
                  } else {
                    console.log(
                      `Attempt ${attempts + 1}/${maxContentAttempts}: Content not ready yet, retrying...`
                    )
                    attempts++
                  }
                } catch (error) {
                  console.log(
                    `Attempt ${attempts + 1}/${maxContentAttempts}: Error reading iframe content:`,
                    error.message
                  )
                  attempts++
                }
              }

              if (!contentLoaded) {
                console.log(
                  'Content not loaded within timeout, proceeding with validation anyway...'
                )
              }

              // Get final content for validation
              const pageContent = await frame.locator('body').innerText()

              const errorPatterns = ['404', 'erreur', 'error']
              const hasError = errorPatterns.some((pattern) => {
                console.log(
                  pattern,
                  pageContent.toLowerCase().includes(pattern.toLowerCase())
                )
                return pageContent.toLowerCase().includes(pattern.toLowerCase())
              })

              if (hasError) {
                console.log(
                  `Content of iframe ${iframeId} contains an error (attempt ${retryCount + 1})`
                )
                if (retryCount === maxRetries - 1) {
                  errors.push(url)
                }
              } else if (!contentLoaded) {
                console.log(
                  `Content of iframe ${iframeId} not fully loaded (attempt ${retryCount + 1})`
                )
                if (retryCount === maxRetries - 1) {
                  errors.push(url)
                }
              } else {
                console.log(`Content of iframe ${iframeId} is valid`)
                iframeValid = true
              }
            } catch (error) {
              console.log(
                `Iframe validation attempt ${retryCount + 1} failed:`,
                error.message
              )
              if (retryCount === maxRetries - 1) {
                console.log(
                  `Iframe ${iframeId} not found or not accessible after ${maxRetries} attempts:`,
                  error.message
                )
                errors.push(url)
              } else {
                console.log(`Retrying in 5 seconds...`)
                await page.waitForTimeout(5000)
              }
            }
            retryCount++
          }
        } catch (error) {
          console.log(
            `Iframe ${iframeId} not found or not accessible:`,
            error.message
          )
          errors.push(url)
          continue
        }
      } catch (error) {
        console.log(`Navigation error details:`, {
          message: error.message,
          name: error.name,
          stack: error.stack,
        })
        errors.push(url)
        continue
      }

      await urlContext.close()
    }

    if (errors.length) {
      console.log('Errors found:', errors)
      const webhookUrl = process.env.MATTERMOST_WEBHOOK_URL
      console.log('Webhook URL:', webhookUrl ? 'is set' : 'is not set')

      if (webhookUrl) {
        try {
          console.log('Attempting to send notification to Mattermost...')
          const withSOrNot = errors.length > 1 ? 's' : ''
          const response = await axios.post(webhookUrl, {
            text: `🚨 Iframes cassées détectées sur le${withSOrNot} site${withSOrNot} suivant${withSOrNot} :\n\n${errors.map((url) => `• ${url}`).join('\n')}`,
          })
          console.log('Mattermost response status:', response.status)
          console.log('Mattermost response data:', response.data)
        } catch (error) {
          console.log('Failed to send to Mattermost:', error.message)
          if (error.response) {
            console.log('Response status:', error.response.status)
            console.log('Response data:', error.response.data)
          }
        }
      } else {
        console.log('Mattermost webhook URL not configured')
        console.log('Iframes are broken on the following sites:')
        errors.forEach((error) => console.log(error))
      }
    }
  } catch (error) {
    console.log(`Healthcheck error: ${error.message}`)
  } finally {
    await browser.close()
  }
}

// TODO : uncomment when Tutorial Deletion AB test is completed
// healthcheck()
