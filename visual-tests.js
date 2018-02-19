const fs = require('fs')
const argv = require('yargs').argv
const clc = require('cli-color')
const looksSame = require('looks-same')
const puppeteer = require('puppeteer')

const screensPath = `screens/`

let code = 0

async function run (page, testCase) {
  switch (testCase) {
    case 'modal-type-success':
      await page.click('.showcase.sweet button')
      break
    case 'modal-type-question':
      await page.click('.title-text button')
      break
    case 'modal-type-error':
      await page.click('.error button')
      break
    case 'long-text':
      await page.click('#long-text button')
      await page.waitFor(2000)
      break
    case 'input-type-text':
      await page.click('#input-text button')
      await page.type('.swal2-input', 'Hola!')
      await page.focus('.swal2-confirm')
      break
    case 'input-type-email-invalid':
      await page.click('#input-email button')
      await page.type('.swal2-input', 'invalid email')
      await page.click('.swal2-confirm')
      await page.focus('.swal2-confirm')
      break
    case 'input-type-email-valid':
      await page.click('#input-email button')
      await page.type('.swal2-input', 'email@example.com')
      await page.click('.swal2-confirm')
      break
    case 'input-type-url-invalid':
      await page.click('#input-url button')
      await page.type('.swal2-input', 'invalid URL')
      await page.click('.swal2-confirm')
      await page.focus('.swal2-confirm')
      break
    case 'input-type-url-valid':
      await page.click('#input-url button')
      await page.type('.swal2-input', 'https://www.youtube.com/watch?v=PWgvGjAhvIw')
      await page.click('.swal2-confirm')
      break
    case 'input-type-password':
      await page.click('#input-password button')
      await page.type('.swal2-input', 'passw0rd')
      await page.focus('.swal2-confirm')
      break
    case 'input-type-textarea':
      await page.click('#input-textarea button')
      await page.focus('.swal2-confirm')
      break
    case 'input-type-select':
      await page.click('#input-select button')
      break
    case 'input-type-select-invalid':
      await page.click('#input-select button')
      await page.click('.swal2-confirm')
      break
    case 'input-type-select-valid':
      await page.click('#input-select button')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await page.click('.swal2-confirm')
      break
    case 'input-type-radio':
      await page.click('#input-radio button')
      await page.waitFor(2000)
      break
    case 'input-type-radio-invalid':
      await page.click('#input-radio button')
      await page.waitFor(2000)
      await page.click('.swal2-confirm')
      break
    case 'input-type-radio-valid':
      await page.click('#input-radio button')
      await page.waitFor(2000)
      await page.keyboard.press('ArrowRight')
      await page.click('.swal2-confirm')
      break
    case 'input-type-checkbox':
      await page.click('#input-checkbox button')
      break
    case 'input-type-checkbox-invalid':
      await page.click('#input-checkbox button')
      await page.keyboard.press(' ')
      await page.click('.swal2-confirm')
      break
    case 'input-type-checkbox-valid':
      await page.click('#input-checkbox button')
      await page.click('.swal2-confirm')
      break
    case 'input-type-range':
      await page.click('#input-range button')
      await page.keyboard.press('ArrowRight')
      break
    case 'loading-state':
      await page.click('.timer button')
      await page.$eval('.swal2-confirm', el => {
        el.style.animation = 'none'
        el.style.WebKitAnimation = 'none'
      })
      break
    case 'bootstrap-buttons':
      await page.click('.bootstrap-buttons button')
      break
    case 'ajax-request-reject':
      await page.click('#ajax-request button')
      await page.type('.swal2-input', 'taken@example.com')
      await page.click('.swal2-confirm')
      await page.waitFor(2100)
      await page.focus('.swal2-confirm')
      break
    case 'ajax-request-success':
      await page.click('#ajax-request button')
      await page.type('.swal2-input', 'email@example.com')
      await page.click('.swal2-confirm')
      await page.waitFor(2000)
      break
    case 'chaining-modals-step1':
      await page.click('#chaining-modals button')
      await page.type('.swal2-input', '1')
      await page.focus('.swal2-confirm')
      break
    case 'chaining-modals-step2':
      await page.click('#chaining-modals button')
      await page.click('.swal2-confirm')
      await page.type('.swal2-input', '2')
      await page.focus('.swal2-confirm')
      break
    case 'chaining-modals-step3':
      await page.click('#chaining-modals button')
      await page.click('.swal2-confirm')
      await page.click('.swal2-confirm')
      await page.type('.swal2-input', '3')
      await page.focus('.swal2-confirm')
      break
    case 'chaining-modals-success':
      await page.click('#chaining-modals button')
      await page.type('.swal2-input', '1')
      await page.click('.swal2-confirm')
      await page.type('.swal2-input', '2')
      await page.click('.swal2-confirm')
      await page.type('.swal2-input', '3')
      await page.click('.swal2-confirm')
      break
  }

  await page.mouse.move(0, 0)
  await page.waitFor(1000)

  // Remove Carbon Ads
  await page.$eval('.swal2-footer', el => {
    if (el.firstChild && el.firstChild.className === 'bsa-cpc') {
      return el.remove()
    }
  })

  const swalContainerHandle = await page.$('.swal2-container')
  await page.evaluate((swalContainer) => {
    swalContainer.style.padding = 0
  }, swalContainerHandle)

  const swalModalHandle = await page.$('.swal2-modal')
  const swalModalSize = await page.evaluate((swalModal) => {
    swalModal.style.borderRadius = 0
    return {
      width: swalModal.clientWidth,
      height: swalModal.clientHeight
    }
  }, swalModalHandle)

  await page.setViewport(swalModalSize)

  const screenName = `${testCase}`
  await page.screenshot({
    path: `${screensPath}${screenName}${argv.update ? '' : '-test'}.png`
  })

  if (argv.update) {
    console.log(clc.green('✓') + ` ${testCase}`)
  } else {
    await new Promise((resolve) => {
      looksSame(`${screensPath}${screenName}.png`, `${screensPath}${screenName}-test.png`, (error, equal) => {
        error && console.log(error)
        console.log(
          (equal ? clc.green('✓') : clc.red('✖')) + ` ${testCase}`
        )
        if (!equal) {
          looksSame.createDiff({
            reference: `${screensPath}${screenName}.png`,
            current: `${screensPath}${screenName}-test.png`,
            diff: `${screensPath}${screenName}-diff.png`,
            highlightColor: '#ff0000' // color to highlight the differences
          }, (error) => {
            error && console.log(error)
          })
          code = 1
        }
        resolve()
      })
    })
  }

  await page.setViewport({
    width: 800,
    height: 600
  })
  const windowHandle = await page.evaluateHandle(() => Promise.resolve(window))
  await page.evaluate(window => {
    return window.swal.close()
  }, windowHandle)
  await page.waitFor(300)
}

async function runAll () {
  const browser = await puppeteer.launch({
    // debug mode, uncomment this to see the browser
    // headless: false
  })
  const page = await browser.newPage()
  await page.goto('https://sweetalert2.github.io/')

  await run(page, 'modal-type-success')
  await run(page, 'modal-type-error')
  await run(page, 'modal-type-question')

  await run(page, 'long-text')

  await run(page, 'input-type-text')
  await run(page, 'input-type-email-invalid')
  await run(page, 'input-type-email-valid')
  await run(page, 'input-type-url-invalid')
  await run(page, 'input-type-url-valid')
  await run(page, 'input-type-password')
  await run(page, 'input-type-textarea')
  await run(page, 'input-type-select')
  await run(page, 'input-type-select-invalid')
  await run(page, 'input-type-select-valid')
  await run(page, 'input-type-radio')
  await run(page, 'input-type-radio-invalid')
  await run(page, 'input-type-radio-valid')
  await run(page, 'input-type-checkbox')
  await run(page, 'input-type-checkbox-invalid')
  await run(page, 'input-type-checkbox-valid')
  await run(page, 'input-type-range')

  await run(page, 'loading-state')

  await run(page, 'bootstrap-buttons')

  await run(page, 'ajax-request-success')
  await run(page, 'ajax-request-reject')

  await run(page, 'chaining-modals-step1')
  await run(page, 'chaining-modals-step2')
  await run(page, 'chaining-modals-step3')
  await run(page, 'chaining-modals-success')

  await browser.close()
}

runAll().then(() => {
  process.exit(code)
})
