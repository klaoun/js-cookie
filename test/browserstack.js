const webdriver = require('selenium-webdriver')

const browsers = [
  {
    'bstack:options': {
      os: 'Windows',
      osVersion: '10',
      browserVersion: '11.0',
      projectName: process.env.BROWSERSTACK_PROJECT_NAME,
      buildName: process.env.BROWSERSTACK_BUILD_NAME,
      userName: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
      // sessionName: 'Test',
      local: 'true',
      seleniumVersion: '4.8.0' // Match selenium-webdriver in package.json
    },
    browserName: 'IE'
  }
]

async function runTest (browser) {
  const driver = new webdriver.Builder()
    .usingServer('http://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities({ ...browser })
    .build()

  try {
    await driver.get('http://127.0.0.1/test/index.html')
    await driver.wait(webdriver.until.titleMatches(/foo/i), 5000) // driver.sleep(5000)?
    await driver.executeScript(
      'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status": "passed", "reason": "QUnit test suite passed"}}'
    )
  } catch (e) {
    await driver.executeScript(
      'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status": "failed", "reason": "QUnit test suite has failing tests"}}'
    )
  }

  await driver.quit()
}

for (const browser of browsers) {
  runTest(browser)
}
