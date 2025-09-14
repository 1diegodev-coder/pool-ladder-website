# Deployment Instructions

## Vercel Deployment with Authentication

Your pool ladder website now includes secure admin authentication. Here are the complete deployment steps:

### Option 1: Vercel CLI (After Fixing npm Permissions)

1. **Fix npm permissions:**
   ```bash
   sudo chown -R $(whoami) ~/.npm
   npm cache clean --force
   ```

2. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

3. **Deploy:**
   ```bash
   cd /Users/diegosuarez/Documents/pool-ladder-website
   vercel login
   vercel --prod
   ```

### Option 2: Vercel Web Dashboard (Recommended)

1. **Visit:** https://vercel.com/dashboard
2. **Sign in** with GitHub, GitLab, or Bitbucket account
3. **Click "Add New Project"**
4. **Choose "Browse All Templates"** or **"Import Git Repository"**
5. **Select "Other"** for custom deployment
6. **Upload/drag the entire project folder**
7. **Configure:**
   - Project Name: `pool-ladder-website`
   - Framework Preset: `Other`
   - Build Command: (leave empty)
   - Output Directory: (leave empty - uses root)
8. **Click "Deploy"**

### Option 3: GitHub Integration

1. **Create GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to Vercel dashboard
   - Click "Add New Project"
   - Import from GitHub
   - Select your repository
   - Deploy automatically

## Configuration

The `vercel.json` file is already configured with:
- **Clean URLs:** `/admin` instead of `/pages/admin.html`
- **Security headers:** XSS protection, content type options
- **Caching:** Optimized for static assets
- **Static site optimization**

## Environment Variables Setup

### Required Environment Variables

1. **JWT_SECRET** (Required for production)
   ```bash
   # Generate a secure secret
   openssl rand -base64 32
   ```

2. **ADMIN_PASSWORD_HASH** (Optional - uses default password if not set)
   ```bash
   # Generate password hash
   cd /path/to/your/project
   node scripts/generate-password.js yourSecurePassword123
   ```

### Setting Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to **Settings** > **Environment Variables**
4. Add the following variables:
   - `JWT_SECRET`: Your generated secure string
   - `ADMIN_PASSWORD_HASH`: Your generated password hash (optional)

### Default Authentication Setup

If you don't set `ADMIN_PASSWORD_HASH`, the system will use:
- **Default Password**: `admin123`
- **⚠️ Warning**: Change this immediately in production!

## Post-Deployment

After deployment:
1. **Test all pages** work correctly
2. **Test admin authentication** with your password
3. **Verify admin panel** functionality after login
4. **Check localStorage** persistence
5. **Test responsive design** on mobile
6. **Configure custom domain** (optional)

## Security Features

✅ **JWT-based authentication** with secure tokens
✅ **Password hashing** with PBKDF2 + salt
✅ **Session management** with automatic expiration
✅ **Secure API endpoints** with CORS support
✅ **Token verification** on every admin action
✅ **Automatic logout** on session expiry

## Expected Result

Your website will be available at: `https://pool-ladder-[random].vercel.app`

- **Public pages**: Accessible to everyone
- **Admin panel**: Password-protected with secure authentication
- **Data persistence**: localStorage still works for admin data
- **Security**: Professional-grade authentication system