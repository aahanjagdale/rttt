# LoveQuestGame - Relationship & Habit Tracker

A romantic relationship tracker with points system, games, and couple activities built with React and Netlify serverless functions.

## Features

- 🔐 Secure login system for couples
- ✅ Task management system
- 🎮 Truth or Dare game
- 🎁 Love coupons with inventory system
- 📝 Shared bucket list
- ❤️ "Why I Find You Hot" appreciation board

## Tech Stack

- Frontend: React + Vite
- Backend: Netlify Serverless Functions
- Storage: In-memory (with data persistence coming soon)
- Authentication: JWT-based
- UI Components: shadcn/ui + Tailwind CSS

## Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd lovequestgame
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with:
```env
NETLIFY_JWT_SECRET=your_jwt_secret_here # Used for JWT token signing
VITE_API_URL=/.netlify/functions # API endpoint prefix
```

4. Install Netlify CLI (if not already installed):
```bash
npm install -g netlify-cli
```

5. Start the development server:
```bash
netlify dev
```

This will start both the Vite dev server for the frontend and the Netlify Functions local server.
The app will be running at `http://localhost:8888`

## Deployment

### Netlify Deployment

1. Connect your repository to Netlify:
   - Log in to [Netlify](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Choose your GitHub repository

2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. Add environment variables:
   In your Netlify site dashboard, go to Site settings > Environment variables and add:
   - `NETLIFY_JWT_SECRET`: A secure random string for JWT signing
   - `NODE_VERSION`: 18

4. Deploy:
   - Netlify will automatically deploy your site
   - Your app will be available at `https://your-site-name.netlify.app`

## Project Structure

```
├── client/src/           # Frontend React application
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   └── pages/           # Page components
├── netlify/functions/    # Serverless API functions
│   ├── api.ts           # Main API handler
│   ├── auth.ts          # Authentication endpoints
│   ├── tasks.ts         # Tasks endpoints
│   └── ...              # Other API endpoints
└── shared/              # Shared types and schemas
    └── schema.ts        # Data validation schemas
```

## API Endpoints

All API routes are prefixed with `/.netlify/functions/`:

### Authentication
- POST `/auth/register` - Register new user
- POST `/auth/login` - Login user
- GET `/api/user` - Get current user

### Tasks
- GET `/tasks` - List tasks
- POST `/tasks` - Create task
- PATCH `/tasks/:id/complete` - Complete task
- DELETE `/tasks/:id` - Delete task

### Coupons
- GET `/coupons` - List available coupons
- GET `/coupons/inventory` - List received coupons
- POST `/coupons` - Create coupon
- POST `/coupons/:id/send` - Send coupon to partner
- DELETE `/coupons/:id` - Delete coupon

### Bucket List
- GET `/bucket-list` - List bucket items
- POST `/bucket-list` - Create bucket item
- DELETE `/bucket-list/:id` - Delete bucket item

### Hot Reasons
- GET `/hot-reasons` - List hot reasons
- POST `/hot-reasons` - Create hot reason

## Development Guidelines

1. Running the app locally:
   - Always use `netlify dev` to run the app locally
   - This ensures both the frontend and serverless functions work together
   - The app will be accessible at `http://localhost:8888`

2. Environment variables:
   - Local development uses `.env` file
   - Netlify deployment uses Environment variables in site settings
   - Never commit the `.env` file to version control

3. Testing API endpoints:
   - Use the health check endpoint to verify the setup:
     `GET /.netlify/functions/api/health`
   - All endpoints require authentication except register and login
   - Use the provided JWT token in the Authorization header

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT