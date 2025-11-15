// tests/e2e.test.js
const puppeteer = require('puppeteer');
const db = require('./db_setup');
const User = require('../models/User');
const { app, server } = require('../app'); 
const mongoose = require('mongoose'); 

const APP_URL = 'http://localhost:3000';

let browser;
let page;
let appServer; 
let mockUser = {
    name: 'E2E User',
    email: 'e2e@example.com',
    password: 'password123',
};

// --- HOOKS ---
beforeAll(async () => {
    // 1. Connect this test's Mongoose (for the server)
    // We use process.env.MONGO_URI from the preset
    await mongoose.connect(process.env.MONGO_URI);
    
    // 2. Start the app server
    appServer = server.listen(3000, () => console.log('E2E server started on 3000'));
    
    // 3. Launch the browser
    browser = await puppeteer.launch({ headless: "new" });
    page = await browser.newPage();
});

beforeEach(async () => {
    // 1. Clear DB and create admin
    await db.clearDatabase();
    
    // 2. Create the passenger user for this test
    await User.create(mockUser); 
});

afterAll(async () => {
    if (browser) await browser.close();
    if (appServer) appServer.close();
    await mongoose.disconnect(); // Disconnect this file's Mongoose
});
// --- END HOOKS ---

describe('E2E Login Flow', () => {

    it('should fail to log in with wrong credentials', async () => {
        await page.goto(`${APP_URL}/auth/login-register`);
        await page.type('form[action="/auth/login"] input[name="email"]', mockUser.email);
        await page.type('form[action="/auth/login"] input[name="password"]', 'wrongpassword');
        await page.click('form[action="/auth/login"] button[type="submit"]');

        await page.waitForSelector('form[action="/auth/login"] p'); 
        const errorText = await page.$eval('form[action="/auth/login"] p', el => el.textContent);
        
        expect(errorText).toContain('Invalid credentials.'); 
    }, 20000);

    it('should log in successfully with correct credentials', async () => {
        await page.goto(`${APP_URL}/auth/login-register`);
        await page.type('form[action="/auth/login"] input[name="email"]', mockUser.email);
        await page.type('form[action="/auth/login"] input[name="password"]', mockUser.password);
        
        await Promise.all([
            page.waitForNavigation(),
            page.click('form[action="/auth/login"] button[type="submit"]')
        ]);

        const pageTitle = await page.title();
        const logoutLink = await page.$('a[href="/logout"]');
        
        expect(pageTitle).toContain('Dashboard');
        expect(logoutLink).not.toBeNull();
    }, 20000);
});