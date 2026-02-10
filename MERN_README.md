# SPX Miner Hub - MERN Stack Implementation

A full-stack web application for SPX token mining with user authentication, KYC verification, referral system, and admin panel.

## 🚀 Features

### User Features
- **Authentication**: Secure login/signup with JWT tokens
- **Mining Dashboard**: Real-time SPX token mining interface
- **KYC Verification**: USDT payment-based KYC system
- **Wallet Management**: Balance tracking and withdrawal requests
- **Referral System**: Earn commissions from referred users
- **Responsive Design**: Mobile-first UI with Tailwind CSS

### Admin Features
- **Dashboard**: Overview of platform statistics
- **User Management**: View and manage all users
- **KYC Management**: Review and approve/reject KYC submissions
- **Mining Controls**: Enable/disable mining globally
- **Withdrawal Processing**: Approve/reject withdrawal requests
- **Settings Management**: Configure platform parameters

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **React Query** for API state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate Limiting** for API protection

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize database:
```bash
node init-db.js
```

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
# Create .env file with:
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spx-miner
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@spxminer.com
ADMIN_PASSWORD=admin123
USDT_WALLET_ADDRESS=TYourUSDTWalletAddressHere
KYC_USDT_AMOUNT=10
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📊 Database Schema

### User Model
- Authentication (email, password, username)
- Mining data (balance, mining rate, status)
- KYC information (status, TID, submission date)
- Referral system (code, referred by, earnings)
- Withdrawal requests

### Settings Model
- Platform controls (KYC, mining, withdrawals enabled)
- Mining parameters (rates, limits)
- KYC configuration (USDT amount, wallet address)
- Referral settings (commission rates)

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Mining
- `GET /api/mining/status` - Get mining status
- `POST /api/mining/start` - Start mining
- `POST /api/mining/stop` - Stop mining and claim

### KYC
- `GET /api/kyc/status` - Get KYC status and requirements
- `POST /api/kyc/submit` - Submit KYC with TID

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/withdraw` - Request withdrawal
- `GET /api/wallet/withdrawals` - Get withdrawal history

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/kyc` - Get KYC submissions
- `PUT /api/admin/kyc/:id/review` - Review KYC submission
- `GET /api/admin/settings` - Get platform settings
- `PUT /api/admin/settings` - Update platform settings

## 🚦 User Flow

### New User Registration
1. User visits landing page
2. Clicks signup and fills registration form
3. Optional referral code entry
4. Account created and logged in
5. Redirected to dashboard

### Mining Process
1. User must complete KYC verification
2. Send USDT to provided wallet address
3. Submit transaction ID (TID)
4. Admin reviews and approves KYC
5. User can start mining SPX tokens
6. Real-time earnings accumulation
7. Claim tokens to wallet balance

### KYC Verification
1. User navigates to KYC page
2. Views USDT wallet address and amount
3. Sends USDT payment
4. Submits transaction ID
5. Admin reviews blockchain transaction
6. Approval/rejection with notification

### Withdrawal Process
1. User requests withdrawal from wallet
2. Enters amount and destination address
3. Admin reviews withdrawal request
4. Approval triggers token transfer
5. User receives confirmation

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- Admin-only route protection

## 🎨 UI Components

### Custom Components
- `MiningCircle` - Animated mining interface
- `AuthModal` - Login/signup modal
- `BottomNav` - Mobile navigation
- `AdminLayout` - Admin panel layout

### shadcn/ui Components
- Cards, buttons, inputs, dialogs
- Tables, badges, alerts
- Form components with validation
- Toast notifications

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS utility classes
- Custom gradient effects
- Dark theme support
- Touch-friendly interfaces

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Configure MongoDB connection
3. Deploy to services like Heroku, Railway, or DigitalOcean
4. Set up SSL certificates

### Frontend Deployment
1. Update API URL for production
2. Build the application: `npm run build`
3. Deploy to Vercel, Netlify, or similar
4. Configure custom domain

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions:
- Email: support@spxminer.com
- Documentation: [docs.spxminer.com](https://docs.spxminer.com)

---

Built with ❤️ using the MERN stack