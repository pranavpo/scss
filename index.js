const express = require('express');
const axios = require('axios');
const puppeteer = require('puppeteer');
const cron = require('node-cron');
const { sequelize, Token } = require('./models');
const cors = require('cors');

const app = express();

const EMAIL = 'pranavpoudyal031@gmail.com';
const PASSWORD = 'a,QuDb,JQ5a)WB;&';

app.use(cors());

// let pageNumber = 1;
async function getStoredAuthData() {
    return await Token.findOne({ order: [['createdAt', 'DESC']] });
}

async function storeAuthData(jwt, cookies) {
    await Token.create({ jwt, cookies });
    const tokens = await Token.findAll();
    // console.log('Tokens in DB:', tokens);
}

async function runPuppeteerScraper(flag = false, pageNumber) {
    let browser;
    try {
        console.log('Starting Puppeteer Scraper...');
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

        const page = await browser.newPage();
        await page.goto('https://www.halaxy.com/a/login', { waitUntil: 'networkidle2' });
        await page.type('#form_email', EMAIL, { delay: 100 });
        await page.type('#form_password', PASSWORD, { delay: 100 });

        await Promise.all([
            page.click('#btn-login'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        const cookies = await page.cookies();
        const pageHTML = await page.content();
        const jwtRegex = /Hk\.jwt\s*=\s*'([^']+)'/;
        const jwtMatch = pageHTML.match(jwtRegex);

        if (!jwtMatch || !jwtMatch[1]) {
            console.log('JWT not found');
            return { error: 'JWT not found' };
        }

        let filteredCookies = [];
        const cookieNames = ['_hjSessionUser_1792492', 'navMode', 'PHPSESSID'];

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            if (cookieNames.includes(cookie.name)) {
                filteredCookies.push(`${cookie.name}=${cookie.value}`);
            }
        }

        const cookieHeader = filteredCookies.join('; ');
        // console.log('Cookies:', cookieHeader);
        if (flag) {
            const storedAuth = await getStoredAuthData();
            if (storedAuth) {
                await Token.update(
                    { jwt: jwtMatch[1], cookies: cookieHeader },
                    { where: { id: storedAuth.id } }
                );
                console.log('Token updated successfully');
            } else {
                console.log('No stored token found, creating a new one');
                await storeAuthData(jwtMatch[1], cookieHeader);
            }
        } else {
            await storeAuthData(jwtMatch[1], cookieHeader);
        }
        return makeRequest(jwtMatch, cookieHeader, pageNumber);
    } catch (error) {
        console.error('Error during scraping:', error);
        return { error: 'Something went wrong' };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function makeRequest(jwtMatch, cookieHeader, pageNumber) {
    const headers = {
        'Authorization': `Bearer ${jwtMatch[1]}`,
        'Cookie': cookieHeader
    };

    const payload = {
        "startRow": (pageNumber - 1) * 5,
        "endRow": ((pageNumber - 1) * 5) + 5,
        "rowGroupCols": [],
        "valueCols": [],
        "pivotCols": [],
        "pivotMode": false,
        "groupKeys": [],
        "filterModel": {},
        "sortModel": []
    };

    try {
        const response = await axios.post(
            'https://www.halaxy.com/a/pr/30628921/patient/list-data',
            payload,
            { headers }
        );

        // console.log('Response from POST request:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error during POST request:', error);
        return { error: 'Failed to make POST request' };
    }
}

async function handleScraping(pageNumber) {
    const storedAuth = await getStoredAuthData();

    if (!storedAuth) {
        console.log('No stored JWT, using Puppeteer...');
        return runPuppeteerScraper(flag = false, pageNumber);
    }

    console.log('Using stored JWT and cookies...');
    const result = await makeRequest(storedAuth.jwt, storedAuth.cookies, pageNumber);

    if (result.error || !Array.isArray(result.data?.rowData)) {
        console.log('Stored JWT failed, refreshing with Puppeteer...');
        return runPuppeteerScraper(flag = true,pageNumber);
    }

    return result;
}

app.get('/scrape-jwt/:pageNumber', async (req, res) => {
    try {
        pageNumber = parseInt(req.params.pageNumber, 10) || 1;
        const result = await handleScraping(pageNumber);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.delete('/delete-token', async (req, res) => {
    try {
        const latestToken = await Token.findOne({ order: [['createdAt', 'DESC']] });

        if (!latestToken) {
            return res.status(404).json({ error: 'No token found to delete' });
        }
        await latestToken.destroy();

        res.json({ success: true, message: 'Token deleted successfully' });
    } catch (error) {
        console.error('Error deleting token:', error);
        res.status(500).json({ error: 'Failed to delete token' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await sequelize.sync();
    console.log(`Server running on http://localhost:${PORT}`);
});
