// tests/auth.test.js
const request = require('supertest');
const { app } = require('../app'); // Import the 'app' from our new app.js
const db = require('./db_setup'); // Import our database setup helper
const User = require('../models/User'); // Import the User model to check the DB

// Mock data for our tests
const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
};

// --- Test Hooks ---
// Connect to the test DB before any tests run
beforeAll(async () => await db.connect());

// Clear the test DB after each test so they don't interfere
afterEach(async () => await db.clearDatabase());

// Disconnect from the test DB after all tests are done
afterAll(async () => await db.closeDatabase());


// --- Test Suite for Authentication Routes ---
describe('Authentication Routes', () => {

    /**
     * Test 1: POST /auth/register (Success)
     */
    it('should register a new user and render login page with success message', async () => {
        // Send a POST request to the register route
        const response = await request(app)
            .post('/auth/register')
            .send(mockUser);

        // Check that the server responds with 200 OK (it renders a page)
        expect(response.statusCode).toBe(200);

        // Check that the rendered HTML contains the success message
        expect(response.text).toContain('Registration successful. Please log in.');

        // Check the database directly to confirm the user was created
        const dbUser = await User.findOne({ email: mockUser.email });
        expect(dbUser).not.toBeNull();
        expect(dbUser.name).toBe(mockUser.name);

        // Check that the password was hashed
        expect(dbUser.password).not.toBe(mockUser.password);
    });

    /**
     * Test 2: POST /auth/register (Failure - duplicate email)
     */
    it('should fail to register a duplicate email and render error', async () => {
        // 1. First, create the user manually in the test DB
        await User.create(mockUser);

        // 2. Then, try to register with the SAME email
        const response = await request(app)
            .post('/auth/register')
            .send(mockUser);

        // 3. Check for the error response
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('User already exists.');
    });

    /**
     * Test 3: POST /auth/login (Success)
     */
    it('should log in a valid user and redirect to dashboard', async () => {
        // 1. First, create the user so they exist to be logged in
        await User.create(mockUser);

        // 2. Then, try to log in
        const response = await request(app)
            .post('/auth/login')
            .send({ email: mockUser.email, password: mockUser.password });

        // 3. Check for the redirect
        expect(response.statusCode).toBe(302); // 302 = Found (Redirect)
        expect(response.headers.location).toBe('/'); // Redirects to home

        // 4. Check that a 'token' cookie was set
        expect(response.headers['set-cookie']).toBeDefined();
        expect(response.headers['set-cookie'][0]).toContain('token=');
    });

    /**
     * Test 4: POST /auth/login (Failure - wrong password)
     */
    it('should fail to log in with a wrong password and render error', async () => {
        // 1. Create the user
        await User.create(mockUser);

        // 2. Try to log in with a bad password
        const response = await request(app)
            .post('/auth/login')
            .send({ email: mockUser.email, password: 'wrongpassword' });

        // 3. Check for the error
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Invalid credentials.');
    });

});