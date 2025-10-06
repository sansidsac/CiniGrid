# CiniGrid

**A comprehensive production management platform for film and television projects with AI-powered location scouting and interconnected workflow management.**

## Team - Wizengamot

| Name | Role | Contact |
|------|------|---------|
| K S Sreekumar | Lead Developer | [kssreekumar04@gmail.com](mailto:kssreekumar04@gmail.com) |
| Alan Antony | Developer/AI Engineer | [voa.alan@gmail.com](mailto:voa.alan@gmail.com) |
| Parthiv S Nair | Business Strategist | [parthivsnair1@gmail.com](mailto:parthivsnair1@gmail.com) |
| Anand P S | Researcher | [anandps8888@gmail.com](mailto:anandps8888@gmail.com) |

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/sansidsac/CiniGrid.git
cd CiniGrid
```

#### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section)
npm start
```
Backend will be available at: `http://localhost:5000`

#### 3. Frontend Setup
```bash
cd ../web
npm install
npm run dev
```
Frontend will be available at: `http://localhost:5173`

#### 4. Seed Test Data (Optional)
```bash
cd backend
node scripts/seed.js
```

### Running Tests

#### Backend Tests
```bash
cd backend
npm test
# Or run specific tests
node test-auth-scenes.js
node test-integration-complete.js
node test-move-functionality.js
```

#### Frontend Tests
```bash
cd web
npm run test
```

## 🌐 Deployment

### Production Deployment
1. **Backend Deployment**
   ```bash
   cd backend
   npm run build
   npm run start:prod
   ```

2. **Frontend Deployment**
   ```bash
   cd web
   npm run build
   npm run preview
   ```

### Live Demo
- **Frontend URL**: [ https://cini-grid.vercel.app/ ]
- **Backend API**: [ https://cinigrid.onrender.com/ ]
- **Credentials**: acquire via mail (mailto:kssreekumar04@gmail.com)

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
MONGO_URI=mongodb://localhost:27017/cinigrid
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/cinigrid

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# API Configuration
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173

# AI Services (Optional)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# External APIs
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# External Services
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## 📁 Project Structure

```
CiniGrid/
├── backend/                 # Node.js/Express backend
│   ├── controllers/         # API controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication & middleware
│   ├── services/           # Business logic services
│   └── scripts/            # Database scripts
├── web/                    # React/TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   └── types/          # TypeScript types
└── app/                    # React Native mobile app (legacy)
```

## 🎯 Features

### Core Functionality
- **Project Management**: Create and manage film/TV projects
- **Scene Management**: Organize scenes with comprehensive metadata
- **Task Management**: Track production tasks with dependencies
- **Kanban Board**: Visual workflow management with 6-state queue system
- **Team Collaboration**: Multi-user project access with role-based permissions

### AI-Powered Location Scouting
- **AI Search**: Intelligent location recommendations using Gemini AI
- **Location Analysis**: Automated permit requirements and cost estimation
- **Google Maps Integration**: Real location data and verification
- **Photo Management**: Location imagery and documentation

### Workflow Management
- **6-State Queue System**: backlogged → pre-production → ready → ongoing → in review → completed
- **Cross-Page Updates**: Real-time synchronization across Board, Scenes, and Tasks
- **Status Tracking**: Comprehensive progress monitoring
- **Move Functionality**: Easy status transitions with dropdown interface

## 🚧 Known Limitations & TODOs

### Current Limitations
- [ ] Mobile app integration pending
- [ ] Real-time collaboration features limited
- [ ] Advanced reporting dashboard in development
- [ ] File upload/storage system needs enhancement
- [ ] Advanced permission system (currently basic roles)

### Planned Features
- [ ] **Calendar Integration**: Schedule management
- [ ] **Budget Tracking**: Financial oversight tools
- [ ] **Advanced Analytics**: Production insights and metrics
- [ ] **Mobile Responsive**: Enhanced mobile web experience
- [ ] **Export Features**: PDF reports and data export
- [ ] **Integration APIs**: Third-party service connections
- [ ] **Advanced Search**: Full-text search across all entities
- [ ] **Notification System**: Real-time alerts and updates

### Technical Debt
- [ ] Test coverage improvement (currently ~60%)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Performance optimization for large datasets
- [ ] Error handling standardization
- [ ] Logging system enhancement

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth
- **AI Integration**: Google Gemini API

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom service layer

### Database Schema
- **Users**: Authentication and profile management
- **Projects**: Production project containers
- **Scenes**: Individual scene management
- **Tasks**: Production task tracking
- **Locations**: AI-powered location data
- **Notes**: Collaborative annotations

## 🧪 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Core Endpoints
- `GET|POST /api/scenes` - Scene management
- `GET|POST /api/tasks` - Task management
- `GET /api/board` - Kanban board data
- `GET|POST /api/projects` - Project management
- `GET|POST /api/locations` - Location scouting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Attributions

### Dependencies
- **React**: Meta Platforms, Inc.
- **Express.js**: TJ Holowaychuk and the Express team
- **MongoDB**: MongoDB, Inc.
- **Tailwind CSS**: Tailwind Labs

### AI Services
- **Google Gemini AI**: Google LLC
- **Google Maps API**: Google LLC

### Development Tools
- **Vite**: Evan You and the Vite team
- **TypeScript**: Microsoft Corporation

---

**Built with ❤️ by Team Wizengamot**

For support or questions, please contact the team or create an issue in this repository.