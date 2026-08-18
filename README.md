# Digital Loan Approval System

A comprehensive full-stack loan application and approval system with animated UI, real-time eligibility checking, document management, and admin dashboard.

## Features

### Customer Features
- **User Authentication**: Secure registration, login, and profile management with JWT
- **Loan Types Browser**: Browse 8 different loan types with detailed terms and requirements
- **Advanced Eligibility Engine**: Comprehensive eligibility checking with detailed scoring
- **EMI Calculator**: Interactive standalone and embedded EMI calculators with animated sliders
- **Multi-Step Application**: Animated multi-step loan application form
- **Document Upload**: Drag-and-drop document upload with Cloudinary integration
- **Customer Dashboard**: Animated dashboard with statistics and recent applications
- **Application Tracking**: View application status and details

### Admin Features
- **Admin Dashboard**: Comprehensive admin dashboard with analytics
- **Application Management**: View, review, and manage all loan applications
- **Document Verification**: Verify uploaded documents
- **Status Management**: Update application status with notes
- **Analytics**: View application trends and statistics

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Recharts** - Charts (for admin analytics)

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Cloud storage
- **Nodemailer** - Email notifications

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for document uploads)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Digital_Loan_Approval
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

#### Server Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/loanapproval?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
JWT_EXPIRE=7d
NODE_ENV=development

# Cloudinary (required for document uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional - for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@loanapproval.com

# Frontend URL
CLIENT_URL=http://localhost:5173
```

#### Client Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api

# EmailJS (optional - for contact form)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### 4. Database Setup

The application uses MongoDB. You can either:
- Use MongoDB Atlas (recommended for production)
- Use local MongoDB installation

### 5. Seed Database

Run the seed script to populate the database with initial data:

```bash
cd server
npm run seed
```

This will create:
- 1 admin user (admin@loanapproval.com / admin123)
- 8 loan types with realistic data

**Important**: Change the admin password after first login!

## Running the Application

### Development Mode

Start both servers in development mode:

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Production Mode

**Build the client:**
```bash
cd client
npm run build
```

**Start the server:**
```bash
cd server
npm start
```

## Usage

### Customer Flow

1. **Register**: Create a new account at `/register`
2. **Login**: Sign in at `/login`
3. **Browse Loans**: View available loan types at `/loan-types`
4. **Check Eligibility**: Use the eligibility checker in the application form
5. **Calculate EMI**: Use the standalone calculator at `/emi-calculator`
6. **Apply for Loan**: Complete the multi-step application form
7. **Upload Documents**: Upload required documents for your application
8. **Track Status**: View your applications on the dashboard

### Admin Flow

1. **Login**: Use admin credentials (admin@loanapproval.com / admin123)
2. **View Dashboard**: Access admin dashboard at `/admin/dashboard`
3. **Review Applications**: View all applications at `/admin/applications`
4. **Verify Documents**: Review uploaded documents
5. **Update Status**: Approve or reject applications with notes

## Project Structure

```
Digital_Loan_Approval/
├── client/                 # React frontend
│   ├── src/
│   │   ├── animations/     # Animation variants
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   ├── layouts/        # Layout components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Express backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── uploads/            # Temporary upload directory
│   ├── utils/              # Utility functions
│   ├── server.js           # Server entry point
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Loan Types
- `GET /api/loan-types` - Get all loan types
- `GET /api/loan-types/:id` - Get loan type by ID
- `POST /api/loan-types/calculate-emi` - Calculate EMI
- `POST /api/loan-types/check-eligibility` - Check eligibility

### Applications
- `POST /api/applications` - Create application
- `GET /api/applications` - Get user applications
- `GET /api/applications/:id` - Get application by ID
- `GET /api/applications/admin/all` - Get all applications (admin)
- `PUT /api/applications/:id/status` - Update status (admin)
- `DELETE /api/applications/:id` - Delete application

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/application/:applicationId` - Get application documents
- `PUT /api/documents/:id/verify` - Verify document (admin)
- `DELETE /api/documents/:id` - Delete document

### Dashboard
- `GET /api/dashboard/user` - Get user dashboard data
- `GET /api/dashboard/admin` - Get admin dashboard data
- `GET /api/dashboard/analytics` - Get analytics data (admin)

## Eligibility Engine

The eligibility engine evaluates applications based on:

1. **Age Requirements**: 21-65 years at loan maturity
2. **Income Requirements**: Minimum income per loan type
3. **Loan Amount Limits**: Within loan type constraints
4. **EMI Ratio**: EMI should not exceed 50% of monthly income
5. **Employment Stability**: Based on employment type and experience
6. **Duration Limits**: Within loan type maximum duration

Score breakdown:
- Age: 15 points
- Income: 25-30 points
- Loan Amount: 20 points
- EMI Ratio: 15-20 points
- Employment: 15-20 points
- Duration: 10 points

**Passing score**: 70/100

## Document Types

The system supports the following document types:
- Identity Proof
- Address Proof
- Income Proof
- Bank Statement
- Property Documents
- Admission Letter
- Vehicle Quotation
- Business Proof
- ITR Documents
- Business Plan
- Gold Appraisal
- Land Documents
- Property Valuation

## Troubleshooting

### MongoDB Connection Issues
- Ensure your MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Verify database user credentials

### Cloudinary Upload Issues
- Verify Cloudinary API credentials
- Check upload folder permissions
- Ensure file size is under 5MB

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## Security Notes

- Change default admin password immediately after setup
- Use strong JWT secrets in production
- Enable MongoDB Atlas IP whitelisting
- Use environment variables for sensitive data
- Enable HTTPS in production
- Implement rate limiting for API endpoints

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team.

<!---LeetCode Topics Start-->
# LeetCode Topics
## Array
| Problem Name | Difficulty |
| ------- | ------- |
| [1122-relative-sort-array](https://github.com/gkdhass/Digital_Loan_Approval/tree/main/1122-relative-sort-array/) | Easy |
## Hash Table
| Problem Name | Difficulty |
| ------- | ------- |
| [1122-relative-sort-array](https://github.com/gkdhass/Digital_Loan_Approval/tree/main/1122-relative-sort-array/) | Easy |
## Sorting
| Problem Name | Difficulty |
| ------- | ------- |
| [1122-relative-sort-array](https://github.com/gkdhass/Digital_Loan_Approval/tree/main/1122-relative-sort-array/) | Easy |
## Counting Sort
| Problem Name | Difficulty |
| ------- | ------- |
| [1122-relative-sort-array](https://github.com/gkdhass/Digital_Loan_Approval/tree/main/1122-relative-sort-array/) | Easy |
## Quicksort
| Problem Name | Difficulty |
| ------- | ------- |
| [1122-relative-sort-array](https://github.com/gkdhass/Digital_Loan_Approval/tree/main/1122-relative-sort-array/) | Easy |
## Bubble Sort
| Problem Name | Difficulty |
| ------- | ------- |
| [1122-relative-sort-array](https://github.com/gkdhass/Digital_Loan_Approval/tree/main/1122-relative-sort-array/) | Easy |
## Tree
| Problem Name | Difficulty |
| ------- | ------- |
| [0700-search-in-a-binary-search-tree](https://github.com/gkdhass/Digital_Loan_Approval/tree/main/0700-search-in-a-binary-search-tree/) | Easy |
## Binary Search Tree
| Problem Name | Difficulty |
| ------- | ------- |
| [0700-search-in-a-binary-search-tree](https://github.com/gkdhass/Digital_Loan_Approval/tree/main/0700-search-in-a-binary-search-tree/) | Easy |
## Binary Tree
| Problem Name | Difficulty |
| ------- | ------- |
| [0700-search-in-a-binary-search-tree](https://github.com/gkdhass/Digital_Loan_Approval/tree/main/0700-search-in-a-binary-search-tree/) | Easy |
<!---LeetCode Topics End-->