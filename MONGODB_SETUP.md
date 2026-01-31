# MongoDB Database Setup Checklist

## Step 1: Choose MongoDB Option

### Option A: Local MongoDB
- [ ] Install MongoDB Community Server
- [ ] Start MongoDB service
- [ ] Verify connection at mongodb://localhost:27017

### Option B: MongoDB Atlas (Cloud)
- [ ] Create account at https://cloud.mongodb.com
- [ ] Create new cluster (free tier available)
- [ ] Create database user with password
- [ ] Add IP address (0.0.0.0 for development)
- [ ] Get connection string

## Step 2: Update Environment Variables

- [ ] Copy .env.example to .env.local
- [ ] Update MONGODB_URI with your connection string
- [ ] Update JWT_SECRET with secure random string
- [ ] Set NODE_ENV=development

## Step 3: Verify Connection

- [ ] Start development server: npm run dev
- [ ] Navigate to http://localhost:3000/register
- [ ] Create test account
- [ ] Verify successful registration
- [ ] Check MongoDB Compass/Atlas for data

## Step 4: Test Complete Flow

- [ ] Login with test account
- [ ] Add a customer
- [ ] Add a supplier
- [ ] Verify data appears in database
- [ ] Test logout functionality

## Step 5: Production Preparation

- [ ] Change JWT_SECRET to production value
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas for production
- [ ] Enable database backups
- [ ] Monitor connection usage
