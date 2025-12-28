# MongoDB Atlas Setup Guide

Since MongoDB is not installed locally, you need to use MongoDB Atlas (free cloud database).

## Step-by-Step Setup

### 1. Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" or "Sign Up"
3. Create your account (you can use Google/GitHub)

### 2. Create a Free Cluster

1. After logging in, click "Build a Database"
2. Choose **FREE** tier (M0)
3. Select your preferred cloud provider and region (choose one close to you)
4. Click "Create Cluster" (takes 1-3 minutes)

### 3. Create Database User

1. In the "Security" section, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
   - Example: username: `salesquote_user`
   - Password: Generate a strong password
5. Set "Database User Privileges" to "Read and write to any database"
6. Click "Add User"

### 4. Allow Network Access

1. Click "Network Access" in the Security section
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - This adds `0.0.0.0/0`
4. Click "Confirm"

### 5. Get Connection String

1. Go back to "Database" section
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Update .env.local

1. Open `sales-quotation-generator/.env.local`
2. Replace the MongoDB URI with your connection string
3. Replace `<username>` with your database username
4. Replace `<password>` with your database password
5. Add database name after `.net/`:

```env
MONGODB_URI=mongodb+srv://salesquote_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sales-quotation?retryWrites=true&w=majority
```

### 7. Restart the Server

After updating `.env.local`:

```bash
# Stop the current server (Ctrl+C if running)
# Then start again
cd sales-quotation-generator
npm run dev
```

## Verify Connection

1. Open http://localhost:3000
2. Try creating a client in "Clients" page
3. Try creating a product in "Products" page
4. Create a quotation using the created client and product

If successful, you'll see your data in MongoDB Atlas:
- Go to "Database" → "Browse Collections"
- You should see `clients`, `products`, and `quotations` collections

## Troubleshooting

### "MongooseServerSelectionError: connect ECONNREFUSED"
- MongoDB URI is incorrect or not updated in `.env.local`
- Restart the dev server after changing `.env.local`

### "Authentication failed"
- Username or password is incorrect in the connection string
- Make sure password doesn't have special characters that need URL encoding

### "IP not whitelisted"
- Add your IP address in Network Access
- Or use "Allow Access from Anywhere" (development only)

## Free Tier Limits

MongoDB Atlas Free Tier (M0) includes:
- 512 MB storage
- Shared RAM
- Perfect for development and small projects
- No credit card required

## Need Help?

Check MongoDB Atlas documentation: https://www.mongodb.com/docs/atlas/
