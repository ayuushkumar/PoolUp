// tests/carpool.test.js
const request = require('supertest');
const { app } = require('../app');
const db = require('./db_setup');
const User = require('../models/User');
const Carpool = require('../models/Carpool');
const jwt = require('jsonwebtoken'); // We need this to sign tokens

// --- Mock Data ---
let mockUser;
let userToken;

// --- Test Hooks (Same as before) ---
beforeAll(async () => {
    await db.connect();
    
    // Create a mock user in the test DB
    mockUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
    });

    // --- Test Authentication ---
    // We log in this user by creating a token, just like our app does
    userToken = jwt.sign(
        { id: mockUser._id, name: mockUser.name, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
});

afterEach(async () => {
    // We need to clear carpools AND users (except our mock user)
    // A simpler way for this file is to just clear carpools
    // but a full clear is safer.
    await db.clearDatabase();

    // Re-create the mock user after each clear
    mockUser = await User.create({
        _id: mockUser._id, // Keep the same ID
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
    });
});

afterAll(async () => await db.closeDatabase());

// --- Test Suite for Carpool Routes ---
describe('Carpool Routes', () => {

    /**
     * Test 1: GET /carpools/new (The "Create Offer" page)
     */
    it('should block unauthenticated users from seeing the create page', async () => {
        const response = await request(app)
            .get('/carpools/new');
        
        expect(response.statusCode).toBe(302);
        // FIX 1: Changed redirect path to match your app's actual redirect
        expect(response.headers.location).toBe('/login'); 
    });

    it('should allow authenticated users to see the create page', async () => {
        const response = await request(app)
            .get('/carpools/new')
            .set('Cookie', `token=${userToken}`); // <-- This is how we log in

        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Create Offer');
    });

    /**
     * Test 2: POST /carpools (Creating a new offer)
     */
    it('should allow an authenticated user to create a new carpool offer', async () => {
        const mockCarpool = {
            carName: 'Test Car',
            location: 'Test Location',
            time: '2025-12-01T10:00:00.000Z',
            price: 100,
            // FIX 2: Changed to a valid enum value. 
            // Change 'Male' if your schema uses 'female', 'other', etc.
            gender: 'male', 
            totalSeats: 3
        };

        const response = await request(app)
            .post('/carpools')
            .set('Cookie', `token=${userToken}`) // Log in the user
            .send(mockCarpool);

        // It should redirect to the homepage on success
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/');

        // Check the database to confirm creation
        const carpool = await Carpool.findOne({ carName: 'Test Car' });
        expect(carpool).not.toBeNull();
        expect(carpool.location).toBe('Test Location');
        expect(carpool.userId.toString()).toBe(mockUser._id.toString());
    });

});