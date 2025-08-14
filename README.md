# Real-Time Collaborative Code Editor

> **Collaborative Coding, Google Docs Style:**  
> Experience seamless, real-time code editing and teamwork—just like collaborating in Google Docs, but purpose-built for developers.

A comprehensive web-based platform for real-time collaborative coding with integrated testing, version control, live chat, dependecy management, and user role management capabilities. Designed for educational institutions, development teams, and organizations requiring seamless collaborative development environments.

## Architecture At Large

![System Architecture](docs/readme_data/RTC_Editor.drawio.png)

Our platform follows a **microservices architecture** designed for scalability, maintainability, and real-time collaboration. The system consists of several independent services working together to provide a seamless collaborative coding experience.

### Architecture Components

- **Frontend**: React-based client application with real-time collaboration capabilities
- **API Gateway**: Central routing and authentication hub for all services
- **Codespace Service**: Manages development environments and project workspaces
- **Compiler Service**: Handles code execution with containerized environments
- **WebSocket Server**: Enables real-time collaboration and communication
- **Database**: Supabase PostgreSQL for persistent data storage
- **Authentication**: Role-based access control (RBAC) system implemented in Supabase Auth Service

## Features

### Real-Time Collaboration

- **Simultaneous editing** with conflict-free replicated data types (CRDTs) via Yjs
- **Live cursors and selections** showing collaborator activity
- **Auto-synchronization** without manual saving
- **Real-time chat** with integrated communication tools

### Development Environment

- **Multi-language support** with syntax highlighting and autocompletion
- **Monaco Editor** integration for VS Code-like editing experience
- **Customizable environments** using Docker containers
- **Integrated testing** capabilities for supported languages
- **Code execution** with secure sandboxed environments

### Version Control

- **Git-like functionality** with commit, history, and rollback capabilities
- **Branch management** and diff visualization
- **Version tracking** with detailed change logs

### User Management & Access Control

- **Role-based access control** (Admins/Tutors, Developers/Employees, Students/Learners)
- **Workspace management** for organizations and teams
- **Project assignment** and access control
- **Activity monitoring** and user behavior tracking
- **Secure authentication** via Supabase Auth

### Security & Compliance

- **Isolated execution environments** using Docker containers
- **Secure authentication** and session management
- **Rate limiting** and request throttling
- **Malicious code protection** with execution timeouts and memory limits
- **Data encryption** and secure communication protocols

## Getting Started

### Environment Configuration

Each service requires environment configuration. Create `.env` files in each service directory:

#### Frontend (.env)

```env
VITE_SUPABASE_PROJECT_ID=projectID
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### API Gateway (.env)

```env
PORT=4000
SUPABASE_JWT_SECRET=your_jwt_secret
```

#### Codespace Service (.env)

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_PROJECT_ID=
Email_password='Provide app password'
Email_user=
PORT=5000
GOOGLE_GENERATIVE_AI_API_KEY=
```


## Use Cases

### Educational Institutions

- **Interactive coding sessions** with real-time instructor supervision
- **Assignment management** with submission tracking and grading
- **Student collaboration** on group projects and peer learning
- **Progress monitoring** with detailed analytics and reporting
- **Classroom management** with organized codespaces per course

### Development Teams

- **Pair programming** and collaborative code reviews
- **Cross-team collaboration** on shared projects
- **Code execution and testing** in standardized environments
- **Version control workflows** with team-based Git operations
- **Knowledge sharing** through integrated chat and documentation

### Organizations & Enterprises

- **Corporate training programs** and coding bootcamps
- **Hackathons and coding competitions** with real-time judging
- **Remote development** collaboration across global teams
- **Custom environment configurations** for specific tech stacks
- **Onboarding programs** for new developers

## Development Guide

### Local Development Setup

1. **Prerequisites Installation**

   ```bash
   # Install Node.js dependencies
   cd Frontend && npm install
   cd API_Gateway && npm install
   cd Codespace_Service && npm install

   # Follow platform-specific installation guides
   ```

2. **Database Setup**

   ```bash
   # Set up Supabase project
   # Configure database schema
   # Set up authentication providers
   ```

3. **Service Development**

   ```bash
   # Frontend development
   cd Frontend && npm run dev

   # Backend services development
   cd API_Gateway && npm run dev
   cd Codespace_Service && npm run dev
   cd WS_Server && npm run dev
   ```

## Team

**Group ID-18, Project ID-4**

- **Mannage K.M.K.K** - 220384B
- **Nandasiri A.P.K** - 220414U
- **Navodi S.Y.A.C.** - 220419N

**Mentor**: Mr. Oshada Amila

## Roadmap

### Phase 1 (Current)

- ✅ Core real-time collaboration
- ✅ Basic code execution
- ✅ User authentication
- ✅ Workspace management

### Phase 2 (Upcoming)

- 🔄 Advanced Git integration
- 🔄 AI-powered code suggestions
- 🔄 Enhanced testing frameworks

---

**Built with ❤️ for collaborative development and education**

_Empowering teams to code together, anywhere, anytime._
