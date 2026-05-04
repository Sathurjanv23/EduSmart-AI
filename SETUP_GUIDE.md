# SMS System - Environment Setup Guide

## Frontend Environment Variables

Create `.env.local` file in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_YOUR_KEY_HERE
NEXT_PUBLIC_RAZORPAY_SECRET=YOUR_SECRET_HERE
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID_HERE

# File Upload
NEXT_PUBLIC_MAX_FILE_SIZE=10485760

# Features
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Backend Configuration

Update `application.properties` in `src/main/resources/`:

```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/
spring.application.name=SMS-System

# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/sms_system
spring.data.mongodb.auto-index-creation=true

# JWT Configuration
jwt.secret=your-secret-key-min-256-bits-long-for-security
jwt.expiration=86400000

# File Upload Configuration
file.upload.dir=/uploads/sms-system/
file.upload.max-size=10485760
file.upload.allowed-types=pdf,doc,docx,jpg,png,xlsx

# CORS Configuration
cors.allowed-origins=http://localhost:3000,http://localhost:3001
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
cors.max-age=3600

# Email Configuration (for notifications)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-specific-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Razorpay Configuration
razorpay.key.id=your_key_id
razorpay.key.secret=your_key_secret

# PayPal Configuration
paypal.mode=sandbox
paypal.client.id=your_client_id
paypal.client.secret=your_client_secret

# Logging
logging.level.root=INFO
logging.level.com.sms.backend=DEBUG
```

## Docker Compose Setup (Optional)

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: sms-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    volumes:
      - mongodb_data:/data/db

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sms-backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATA_MONGODB_URI: mongodb://admin:admin123@mongodb:27017/sms_system?authSource=admin
      JWT_SECRET: your-secret-key
    depends_on:
      - mongodb
    volumes:
      - ./backend/uploads:/uploads/sms-system

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: sms-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8080/api
    depends_on:
      - backend

volumes:
  mongodb_data:
```

## Installation Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
mvn clean install

# Run the application
mvn spring-boot:run
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local with variables above
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 3. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB
# On macOS with Homebrew:
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify connection
mongosh
```

**Option B: Docker**
```bash
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo:6.0
```

## Testing the Setup

### 1. Test Backend

```bash
# Health Check
curl http://localhost:8080/api/health

# Create test user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@123","role":"STUDENT"}'
```

### 2. Test Frontend

Open http://localhost:3000 in browser

### 3. Test Database

```bash
# Connect to MongoDB
mongosh mongodb://admin:admin123@localhost:27017/sms_system?authSource=admin

# List collections
db.getCollectionNames()

# Check attendance
db.attendance.find()
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 8080
lsof -i :8080
kill -9 <PID>

# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongosh admin -u admin -p admin123 --eval "db.adminCommand('ping')"
```

### CORS Errors

Ensure backend CORS configuration matches frontend URL in `application.properties`

### API Not Responding

1. Check backend logs: `tail -f backend/logs/sms.log`
2. Verify MongoDB connection
3. Check firewall settings

## Production Deployment

### Recommended Platforms

1. **Backend:** Heroku, AWS Elastic Beanstalk, Railway
2. **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
3. **Database:** MongoDB Atlas, AWS DocumentDB

### Environment for Production

```properties
# Production application.properties
spring.profiles.active=prod
logging.level.root=WARN
logging.level.com.sms.backend=INFO
```

## Next Steps

1. Configure Razorpay/PayPal credentials
2. Set up email service for notifications
3. Configure file storage (AWS S3 or local)
4. Set up CI/CD pipeline
5. Configure monitoring and logging

---

For more detailed setup, refer to [FEATURE_IMPLEMENTATION_GUIDE.md](./FEATURE_IMPLEMENTATION_GUIDE.md)
