/* eslint-disable no-param-reassign */
import express from 'express'
import puppeteer from 'puppeteer'
import cron from 'node-cron'
cron.schedule('15 * * * *', () => {
    console.log('hola hola hola')
})
import ModelGolf from './lib/models/golfModel'
require('./lib/db')
const push = async () => {
    const newGof = new ModelGolf({ cStatus: true })
    return newGof
}
push()
const app = express()
// const iPhone = puppeteer.devices['iPhone 6']
const fs = require('fs')
// console.log(iPhone)
async function doWebScraping() {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--allow-external-pages',
            '--allow-third-party-modules',
            '--data-reduction-proxy-http-proxies',
            '--no-sandbox'
        ]
    })
    const page = await browser.newPage()
    // get dimentions
    const dimensions = await page.evaluate(() => {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            deviceScaleFactor: window.devicePixelRatio
        }
    })
    // Create a new page in a pristine context.
    // Do stuff
    // https://network.ceroc.com/
    // stuwil02
    // Agenda01!
    await page.evaluate(() => window.scrollBy(0, 1000))
    await page.setDefaultNavigationTimeout(0)
    await page.setViewport({ width: 2080, height: 1000 })
    // await page.goto('https://www.pts.cloud/', { waitUntil: 'networkidle2' })
    await page.goto('https://network.ceroc.com/', { waitUntil: 'networkidle2' })
    await page.waitForSelector('#usernameinput')
    await page.type('#usernameinput', 'stuwil02')
    // const videos = await page.$$('https://www.pts.cloud/client/ClientSearchView')
    await page.type('#passwordinput', 'Agenda01!')
    await page.screenshot({ path: 'buddy-screenshot.png' })
    // espera por 5 SEGUNDOS
    // await page.waitFor(5000) --------
    await page.click('body > center > table > tbody > tr:nth-child(2) > td:nth-child(3) > div > form > table > tbody > tr:nth-child(3) > td > input[type=submit]')
    await page.waitForSelector('#pMenu_root_20')
    await page.click('#pMenu_root_20')
    // start config filter
    await page.waitForSelector('#TransactionFilter > div > table > tbody > tr:nth-child(5) > td:nth-child(2)')
    // ---day----
    await page.select('#TransactionFilter > div > table > tbody > tr:nth-child(5) > td:nth-child(2) > select:nth-child(1)', '1')
    // ---Mes----
    await page.select('#TransactionFilter > div > table > tbody > tr:nth-child(5) > td:nth-child(2) > select:nth-child(2)', '1')
    // ---Year----
    await page.select('#TransactionFilter > div > table > tbody > tr:nth-child(5) > td:nth-child(2) > select:nth-child(3)', '2021')
    // End config filter
    // ---day----
    await page.select('#TransactionFilter > div > table > tbody > tr:nth-child(6) > td:nth-child(2) > select:nth-child(1)', '1')
    // ---Mes----
    await page.select('#TransactionFilter > div > table > tbody > tr:nth-child(6) > td:nth-child(2) > select:nth-child(2)', '12')
    // ---Year----
    await page.select('#TransactionFilter > div > table > tbody > tr:nth-child(6) > td:nth-child(2) > select:nth-child(3)', '2021')
    // ---Select input radio----
    await page.waitForSelector('#TransactionFilter > div > table > tbody > tr:nth-child(9) > td:nth-child(2) > label:nth-child(2)')
    await page.evaluate(() => {
        const radio = document.querySelector('#TransactionFilter > div > table > tbody > tr:nth-child(9) > td:nth-child(2) > label:nth-child(2)');
        radio.click();
    })
    await page.waitForSelector('#transactionsList')
    // ---Select All filter----
    await page.select('#TransactionFilter > div > table > tbody > tr:nth-child(10) > td:nth-child(2) > select', '999999')
    // ---filter----
    await page.click('#TransactionFilter > div > table > tbody > tr:nth-child(11) > td:nth-child(2) > input[type=submit]')
    await page.screenshot({ path: 'example.png' })
    await page.waitForSelector('#transactionsList > tbody > tr');
    const urls = await page.$$eval('#transactionsList > tbody > tr', links => {
        // Extract the links from the data
        links = links.filter(
            link => link.querySelector('td > a') !== null || undefined || ''
        )
        links = links.map(el => el.querySelector('td > a').href)
        return links
    })
    console.log(urls)
    const pagePromise = link => new Promise(async (resolve, reject) => {
        const newPage = await browser.newPage()
        await newPage.goto(link)
        await newPage.close()
    })
    for (let i = 0, totalUrls = urls.length; i < totalUrls; i++) {
        const currentPageData = await pagePromise(urls[i])
        console.log(currentPageData)
    }
    const html = await page.content()
    console.log('Dimensions:', dimensions)
    fs.writeFile('page.html', html, function (err) {
        if (err) throw err
        console.log('Html Saved')
    })
}
doWebScraping()
    .then(articles => {
        console.log('articles: ', articles)
    })
    .catch(err => {
        console.log(err)
        if (err instanceof puppeteer.errors.TimeoutError) {
            console.log(err, 'error de tiempo de espera')
            // Do something if this is a timeout.
        }
    })
app.get('/', (req, res) => {
    res.send('Server online')
})
app.listen(3000)
console.log('Estas en el puerto 3000')
