const webdriver = require('selenium-webdriver')

const browserstackOptions = {
  projectName: process.env.BROWSERSTACK_PROJECT_NAME,
  buildName: process.env.BROWSERSTACK_BUILD_NAME,
  userName: process.env.BROWSERSTACK_USERNAME,
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
  localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
  local: 'true',
  seleniumVersion: '4.8.0' // Match selenium-webdriver in package.json
}

const browsers = [
  {
    'bstack:options': {
      os: 'Windows',
      osVersion: '11',
      browserVersion: 'latest',
      ...browserstackOptions
    },
    browserName: 'Chrome'
  },
  {
    'bstack:options': {
      os: 'OS X',
      osVersion: 'Ventura',
      browserVersion: '16.0',
      ...browserstackOptions
    },
    browserName: 'Safari'
  },
  {
    'bstack:options': {
      os: 'Windows',
      osVersion: '10',
      browserVersion: '11.0',
      ...browserstackOptions
    },
    browserName: 'IE'
  }
]

async function runTest (browser) {
  const driver = new webdriver.Builder()
    .usingServer('http://hub.browserstack.com/wd/hub')
    .withCapabilities({ ...browser })
    .build()

  let fail
  try {
    await driver.get('http://127.0.0.1:9998/test/index.html')
    await driver.sleep(10000)
    const runEnd = await driver.executeScript('return window.__runEnd__')
    console.log(`Passed: ${runEnd.passed}`)
    console.log(`Failed: ${runEnd.failed}`)
    console.log(`Total: ${runEnd.total}`)
    if (runEnd.failed > 0) {
      throw new Error('Test suite run fail')
    }
    await driver.executeScript(
      'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status": "passed", "reason": "QUnit test suite passed"}}'
    )
  } catch (e) {
    console.error(`Test suite failed to run in ${browser.browserName}`, e)
    fail = true
    await driver.executeScript(
      'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status": "failed", "reason": "QUnit test suite has failing tests"}}'
    )
  }

  await driver.quit()
  process.exit(fail ? 1 : 0)
}

;(async () => {
  for (const browser of browsers) {
    console.log(`Running QUnit test suite in ${browser.browserName}`)
    await runTest(browser)
  }
})()
