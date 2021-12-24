/* eslint-disable no-param-reassign */
import express from 'express'
import puppeteer from 'puppeteer'
import cron from 'node-cron'
import {
    MongoClient
} from 'mongodb';
import fs from 'fs'
cron.schedule('1 * * * *', () => {
    console.log('hola hola hola')
})
// Init app
const app = express()
const url = 'mongodb+srv://doadmin:3UAzS8db4ci65701@db-mongodb-nyc3-07265-dd6a67db.mongo.ondigitalocean.com/admin?authSource=admin&replicaSet=db-mongodb-nyc3-07265&tls=true&tlsCAFile=ca-certificate.crt';
const client = new MongoClient(url);
const dbName = 'admin';

async function DbConnect(data) {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('clientPst');
    const insertResult = await collection.insertOne(data);
    console.log('Inserted documents =>', insertResult);
    return 'done.';
}

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
    await page.evaluate(() => window.scrollBy(0, 1000))
    await page.setDefaultNavigationTimeout(0)
    await page.setViewport({
        width: 2080,
        height: 1000
    })
    await page.goto('https://network.ceroc.com/', {
        waitUntil: 'networkidle2'
    })
    await page.waitForSelector('#usernameinput')
    await page.type('#usernameinput', 'stuwil02')
    await page.type('#passwordinput', 'Agenda01!')
    await page.screenshot({
        path: 'buddy-screenshot.png'
    })
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
    await page.screenshot({
        path: 'example.png'
    })
    await page.waitForSelector('#transactionsList > tbody > tr');
    const urls = await page.$$eval('#transactionsList > tbody > tr', links => {
        // Extract the links from the data
        links = links.filter(
            link => link.querySelector('td > a') !== null || undefined || ''
        )
        links = links.map(el => el.querySelector('td > a').href)
        return links
    })
    console.log(urls, 'HERE')
    let data = []
    const pagePromise = link => new Promise(async (resolve, reject) => {
        let dataCosMod = {};
        let Contents = {};
        let UserDetails = {};
        let Shipping = {};
        let Billing = {};
        const newPage = await browser.newPage();
        await newPage.goto(link);
        // newPage.waitForNavigation({ waitUntil: 'networkidle2' }),
        newPage.waitForSelector('body > div > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(2)'),
        dataCosMod['CosMod'] = await newPage.$eval('body > div > table:nth-child(3) > tbody > tr.header1 > th', text => text.textContent.replace(/\D/gi, '').substring(0, 3));
        dataCosMod['Status'] = await newPage.$eval('body > div > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(2)', text => text.textContent);
        dataCosMod['Status'] = await newPage.$eval('body > div > table:nth-child(3) > tbody > tr:nth-child(2) > td:nth-child(2)', text => text.textContent);
        dataCosMod['Created'] = await newPage.$eval('body > div > table:nth-child(3) > tbody > tr:nth-child(3) > td:nth-child(2)', text => text.textContent);
        dataCosMod['Modified'] = await newPage.$eval('body > div > table:nth-child(3) > tbody > tr:nth-child(4) > td:nth-child(2)', text => text.textContent);
        dataCosMod['User'] = await newPage.$eval('body > div > table:nth-child(3) > tbody > tr:nth-child(5) > td:nth-child(2)', text => text.textContent);
        dataCosMod['BMSAccount'] = await newPage.$eval('body > div > table:nth-child(3) > tbody > tr:nth-child(6) > td:nth-child(2)', text => text.textContent);
        dataCosMod['PaymentModule'] = await newPage.$eval('body > div > table:nth-child(3) > tbody > tr:nth-child(7) > td:nth-child(2)', text => text.textContent);
        dataCosMod['PaymentType'] = await newPage.$eval('body > div > table:nth-child(3) > tbody > tr:nth-child(8) > td:nth-child(2)', text => text.textContent);
        // --- Contents---
        // const Product = 'body > div > table:nth-child(5) > tbody > tr.dark > td.productName'
        // Contents['Product'] = await newPage.$eval( !Product ? '' : Product, text => text.textContent);
        // Contents['Option'] = await newPage.$eval('body > div > table:nth-child(5) > tbody > tr.dark > td:nth-child(2)', text => text.textContent);
        // Contents['Price'] = await newPage.$eval('body > div > table:nth-child(5) > tbody > tr.dark > td:nth-child(3)', text => text.textContent);
        // Contents['Qty'] = await newPage.$eval('body > div > table:nth-child(5) > tbody > tr.dark > td:nth-child(4)', text => text.textContent);
        // Contents['Subtotal'] = await newPage.$eval('body > div > table:nth-child(5) > tbody > tr.dark > td:nth-child(5)', text => text.textContent);
        // ----Query selector NetTotal
        // const NetTotal = 'body > div > table:nth-child(5) > tbody > tr:nth-child(4) > td'
        // const NetTotal2 = 'body > div > table:nth-child(5) > tbody > tr:nth-child(4) > th'
        // Contents['NetTotal'] = await newPage.$eval(NetTotal ? NetTotal : NetTotal2, text => text ? text.textContent.trim() : '');

        const GranTotal = 'body > div > table:nth-child(5) > tbody > tr:nth-last-child(1) > th'
        const GranTotal2 = 'body > div > table:nth-child(5) > tbody > tr:nth-last-child(1) > th'
        Contents['GrandTotal'] = await newPage.$eval(GranTotal ? GranTotal : GranTotal2, text => text.textContent);
        // --- UserDetails---
        UserDetails['FirstName'] = await newPage.$eval('body > div > table:nth-child(7) > tbody > tr:nth-child(2) > td:nth-child(2)', text => text.textContent);
        UserDetails['LastName'] = await newPage.$eval('body > div > table:nth-child(7) > tbody > tr:nth-child(3) > td:nth-child(2)', text => text.textContent);
        UserDetails['Email'] = await newPage.$eval('body > div > table:nth-child(7) > tbody > tr:nth-child(4) > td:nth-child(2)', text => text.textContent);
        UserDetails['Mobile'] = await newPage.$eval('body > div > table:nth-child(7) > tbody > tr:nth-child(5) > td:nth-child(2)', text => text.textContent);
        UserDetails['TermsAndConditionsAccepted'] = await newPage.$eval('body > div > table:nth-child(7) > tbody > tr:nth-child(6) > td:nth-child(2)', text => text.textContent);
        UserDetails['IsOfflineOrder'] = await newPage.$eval('body > div > table:nth-child(7) > tbody > tr:nth-last-child(1) > td:nth-child(2)', text => text.textContent);
        // --- Shipping---
        Shipping['Address1'] = await newPage.$eval('body > div > table:nth-child(9) > tbody > tr:nth-child(2) > td:nth-child(2)', text => text.textContent);
        Shipping['City'] = await newPage.$eval('body > div > table:nth-child(9) > tbody > tr:nth-child(3) > td:nth-child(2)', text => text.textContent);
        Shipping['PostCode'] = await newPage.$eval('body > div > table:nth-child(9) > tbody > tr:nth-child(4) > td:nth-child(2)', text => text.textContent);
        Shipping['Country'] = await newPage.$eval('body > div > table:nth-child(9) > tbody > tr:nth-child(5) > td:nth-child(2)', text => text.textContent);
        // --- Billing---
        Billing['AddressIsCardholderAddress'] = await newPage.$eval('body > div > table:nth-child(11) > tbody > tr:nth-child(2) > td:nth-child(2)', text => text.textContent);
        Billing['Address1'] = await newPage.$eval('body > div > table:nth-child(11) > tbody > tr:nth-child(3) > td:nth-child(2)', text => text.textContent);
        Billing['City'] = await newPage.$eval('body > div > table:nth-child(11) > tbody > tr:nth-child(4) > td:nth-child(2)', text => text.textContent);
        Billing['PostCode'] = await newPage.$eval('body > div > table:nth-child(11) > tbody > tr:nth-child(5) > td:nth-child(2)', text => text.textContent);
        Billing['Country'] = await newPage.$eval('body > div > table:nth-child(11) > tbody > tr:nth-child(6) > td:nth-child(2)', text => text.textContent);
        // console.log(Contents)
        // console.log(Billing)
        // console.log(dataCosMod)
        data = [
            dataCosMod = {
                dataCosMod
            },
            Contents = {
                Contents
            },
            UserDetails = {
                UserDetails
            },
            Shipping = {
                Shipping
            },
            Billing = {
                Billing
            }
        ]
        console.log(data)

        resolve(dataCosMod);
        // await newPage.goBack([5000, { waitUntil: 'domcontentloaded' }]);
        await newPage.close([5000, {
            waitUntil: 'domcontentloaded'
        }]);
        return data 
    })
    for (let i = 0, totalUrls = urls.length; i < totalUrls; i++) {
        const array = await pagePromise(urls[i])
        // console.log(array, 'oooooooooooooooooooooooo')
        DbConnect(array)
        .then(console.log)
        .catch(console.error)
        // .finally(() => client.close());
    }
    const html = await page.content()
    console.log('Dimensions:', dimensions)
    fs.writeFile('page.html', html, function (err) {
        if (err) throw err
        console.log('Html Saved')
    })
    
}
doWebScraping()
    .then(x => {
        console.log('articles: ', x)
    })
    .catch(err => {
        console.log(err)
        if (err instanceof puppeteer.errors.TimeoutError) {
            console.log(err, 'error de tiempo de espera')
            // Do something if this is a timeout.
        }
    })
    // console.log(data)

app.get('/', (req, res) => {
    res.send('Server online')
})
app.listen(3000)
console.log('Estas en el puerto 3000')