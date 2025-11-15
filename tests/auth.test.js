// tests/auth.test.js
const request = require('supertest');
const { app } = require('../app');
const db = require('./db_setup');
const User = require('../models/User');

const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
};

// --- HOOKS ---
beforeAll(async () => await db.connect());
beforeEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());
// --- END HOOKS ---

describe('Authentication Routes', () => {

    it('should register a new user and render login page with success message', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send(mockUser);
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Registration successful. Please log in.');
    });

    it('should fail to register a duplicate email and render error', async () => {
        await User.create(mockUser); // User exists
        const response = await request(app)
            .post('/auth/register')
            .send(mockUser);
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('User already exists.');
    });

    it('should log in a valid user and redirect to dashboard', async () => {
        await User.create(mockUser);
        const response = await request(app)
            .post('/auth/login')
            .send({ email: mockUser.email, password: mockUser.password });
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/');
    });

    it('should fail to log in with a wrong password and render error', async () => {
        await User.create(mockUser);
        const response = await request(app)
            .post('/auth/login')
            .send({ email: mockUser.email, password: 'wrongpassword' });
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Invalid credentials.');
    });
});