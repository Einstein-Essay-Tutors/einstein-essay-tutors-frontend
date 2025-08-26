# Einstein Essay Tutors Frontend

Next.js 15.5.0 frontend application for the Einstein Essay Tutors platform.

## Features

- Next.js 15.5.0 with App Router
- React 19.1.0 with TypeScript
- Tailwind CSS for styling
- TipTap rich text editor for blog content
- JWT Authentication
- Responsive design with mobile-first approach
- Docker containerization
- CI/CD with GitHub Actions

## Development Setup

### Prerequisites

- Node.js 20+
- npm or yarn
- Docker & Docker Compose (for containerized setup)

### Local Development

1. Clone the repository:
```bash
git clone git@github.com:ewt-writers/einstein-essay-tutors-frontend.git
cd einstein-essay-tutors-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Run development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Docker Development

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

## Environment Variables

### Development (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### Production (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── contexts/           # React contexts (auth, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

## Key Features

### Authentication
- JWT-based authentication with the Django backend
- Protected routes and role-based access control
- User registration, login, and profile management

### Blog System
- Rich text editing with TipTap editor
- Blog post creation, editing, and publishing
- Category and tag management
- Responsive blog post display

### Dashboard
- User dashboard with order statistics
- Animated counters with smooth transitions
- Order management and tracking
- Admin dashboard for site management

### Responsive Design
- Mobile-first responsive design
- Tablet and desktop optimizations
- Touch-friendly interactions
- Accessible UI components

## Production Deployment

### Docker Production Deployment

1. Set up production environment file:
```bash
cp .env.example .env.production
# Edit .env.production with production values
```

2. Build and deploy:
```bash
docker-compose -f docker-compose.yml up -d
```

### Manual Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## CI/CD

The project uses GitHub Actions for continuous integration and deployment:

- **Test**: Runs linting, type checking, and builds on every push
- **Build**: Builds Docker image on main branch
- **Deploy**: Deploys to production on main branch

Required GitHub Secrets:

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password
- `HOST` - Production server IP
- `USERNAME` - Production server username
- `SSH_KEY` - SSH private key for production server

## Performance Optimizations

- Next.js standalone build for smaller Docker images
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Static asset optimization
- Gzip compression in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

Private repository - All rights reserved.
# Clean server deployment - Tue Aug 26 12:55:19 PM CAT 2025
