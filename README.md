# Role-Based Job Portal Backend

A robust backend for a role-based job portal built with Node.js, Express.js, and MongoDB.

## Features

- Role-based authentication (Admin, Recruiter, Job Seeker)
- Job posting and management
- Job application system with resume upload
- Admin dashboard with statistics
- File upload using Cloudinary
- Secure password hashing with Argon2
- Input validation using Joi
- JWT-based authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/job-portal
   JWT_SECRET=your_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Jobs

- `GET /api/jobs` - Get all active jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job (Recruiter/Admin)
- `PUT /api/jobs/:id` - Update job (Recruiter/Admin)
- `DELETE /api/jobs/:id` - Delete job (Recruiter/Admin)

### Applications

- `POST /api/applications` - Apply for a job (Job Seeker)
- `GET /api/applications/job/:jobId` - Get applications for a job (Recruiter/Admin)
- `GET /api/applications/my-applications` - Get user's applications (Job Seeker)
- `PATCH /api/applications/:id/status` - Update application status (Recruiter/Admin)

### Admin

- `GET /api/admin/users` - Get all users
- `GET /api/admin/jobs` - Get all jobs
- `GET /api/admin/applications` - Get all applications
- `GET /api/admin/dashboard` - Get dashboard statistics
- `PATCH /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user

## Role-Based Access Control

### Admin
- Full access to all features
- Can manage users, jobs, and applications
- Access to dashboard statistics

### Recruiter
- Can post, update, and delete their own jobs
- Can view and manage applications for their jobs
- Can update application statuses

### Job Seeker
- Can view all active jobs
- Can apply for jobs with resume upload
- Can view their own applications

## Security Features

- Password hashing using Argon2
- JWT-based authentication
- Role-based access control
- Input validation using Joi
- Secure file upload with size and type restrictions
- Environment variable configuration

## Error Handling

The API includes comprehensive error handling for:
- Invalid input validation
- Authentication errors
- Authorization errors
- Database errors
- File upload errors

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 