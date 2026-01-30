import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PRISMA_SERVICE_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      message: 'Prisma service is running',
      timestamp: new Date().toISOString(),
      database: 'connected',
      provider: 'postgresql'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      provider: 'postgresql'
    });
  }
});

// ==================== USER ROUTES ====================

// GET /api/users - Get all users
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get user by ID
app.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/users/email/:email - Get user by email
app.get('/api/users/email/:email', async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users - Create user
app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await prisma.user.create({
      data: { email, name }
    });
    
    res.status(201).json(user);
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

// PUT /api/users/:id - Update user
app.put('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { email, name } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { 
        ...(email && { email }),
        ...(name !== undefined && { name })
      }
    });
    
    res.json(user);
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
});

// DELETE /api/users/:id - Delete user
app.delete('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    await prisma.user.delete({
      where: { id }
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
});

// ==================== POST ROUTES ====================

// GET /api/posts - Get all posts
app.get('/api/posts', async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: true, tags: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET /api/posts/:id - Get post by ID
app.get('/api/posts/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true, comments: true, tags: true }
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST /api/posts - Create post
app.post('/api/posts', async (req: Request, res: Response) => {
  try {
    const { title, content, published, authorId } = req.body;
    
    if (!title || !authorId) {
      return res.status(400).json({ error: 'Title and authorId are required' });
    }
    
    const post = await prisma.post.create({
      data: { title, content, published, authorId },
      include: { author: true }
    });
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down Prisma service...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down Prisma service...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  // Test database connection on startup
  try {
    await prisma.$connect();
    console.log(`
╔═══════════════════════════════════════════════════════╗
║         Prisma Database Service for Vicrow            ║
╠═══════════════════════════════════════════════════════╣
║  Status:    Running                                   ║
║  Port:      ${PORT}                                       ║
║  Database:  PostgreSQL                                ║
║  Connected: ✓ Yes                                     ║
╚═══════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error(`
╔═══════════════════════════════════════════════════════╗
║         Prisma Database Service for Vicrow            ║
╠═══════════════════════════════════════════════════════╣
║  Status:    Running                                   ║
║  Port:      ${PORT}                                       ║
║  Database:  PostgreSQL                                ║
║  Connected: ✗ No - Check PostgreSQL is running       ║
╚═══════════════════════════════════════════════════════╝
    `);
    console.error('Connection error:', error);
  }
});

export default app;
