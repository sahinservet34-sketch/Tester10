import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { 
  insertMenuCategorySchema,
  insertMenuItemSchema,
  insertEventSchema,
  insertReservationSchema,
  insertSettingSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Multer setup for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Serve static files from uploads directory
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(process.cwd(), 'public', 'uploads', req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  });

  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'supano-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Simple health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Initialize default admin user if none exists
  app.post('/api/init-admin', async (req, res) => {
    try {
      const existingAdmin = await dbStorage.getUserByUsername('admin');
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin user already exists' });
      }

      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = await dbStorage.createUser({
        username: 'admin',
        email: 'admin@supanos.bar',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });

      res.json({ 
        message: 'Admin user created successfully',
        username: adminUser.username
      });
    } catch (error) {
      console.error('Error creating admin user:', error);
      res.status(500).json({ message: 'Failed to create admin user' });
    }
  });

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = z.object({
        username: z.string().min(1),
        password: z.string().min(1)
      }).parse(req.body);

      const user = await dbStorage.getUserByUsername(username);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user in session
      (req.session as any).userId = user.id;
      (req.session as any).userRole = user.role;

      res.json({ 
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json({
      userId,
      userRole: (req.session as any)?.userRole
    });
  });

  // User management routes (Admin only)
  app.post("/api/users", async (req, res) => {
    try {
      const userRole = (req.session as any)?.userRole;
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userData = insertUserSchema.parse(req.body);
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const user = await dbStorage.createUser({
        ...userData,
        password: hashedPassword
      });

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const userRole = (req.session as any)?.userRole;
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await dbStorage.getAllUsers();
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }));

      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userRole = (req.session as any)?.userRole;
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { id } = req.params;
      const currentUserId = (req.session as any)?.userId;
      
      // Prevent admin from deleting themselves
      if (id === currentUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await dbStorage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  // Menu Categories
  app.get("/api/menu/categories", async (req, res) => {
    try {
      const categories = await dbStorage.getMenuCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/menu/categories", async (req, res) => {
    try {
      const validatedData = insertMenuCategorySchema.parse(req.body);
      const category = await dbStorage.createMenuCategory(validatedData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  // Menu Items
  app.get("/api/menu/items", async (req, res) => {
    try {
      const { categoryId, search } = req.query;
      const items = await dbStorage.getMenuItems(
        categoryId as string,
        search as string
      );
      res.json(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post("/api/menu/items", async (req, res) => {
    try {
      const validatedData = insertMenuItemSchema.parse(req.body);
      const item = await dbStorage.createMenuItem(validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(400).json({ message: "Failed to create menu item" });
    }
  });

  app.patch("/api/menu/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertMenuItemSchema.partial().parse(req.body);
      const item = await dbStorage.updateMenuItem(id, validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(400).json({ message: "Failed to update menu item" });
    }
  });

  app.delete("/api/menu/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await dbStorage.deleteMenuItem(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(400).json({ message: "Failed to delete menu item" });
    }
  });

  // Events
  app.get("/api/events", async (req, res) => {
    try {
      const { featured } = req.query;
      const events = await dbStorage.getEvents(
        featured === "1" ? true : undefined
      );
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      // Convert dateTime string to Date object if needed
      if (req.body.dateTime && typeof req.body.dateTime === 'string') {
        req.body.dateTime = new Date(req.body.dateTime);
      }
      const validatedData = insertEventSchema.parse(req.body);
      const event = await dbStorage.createEvent(validatedData);
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(400).json({ message: "Failed to create event" });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertEventSchema.partial().parse(req.body);
      const event = await dbStorage.updateEvent(id, validatedData);
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(400).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await dbStorage.deleteEvent(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(400).json({ message: "Failed to delete event" });
    }
  });

  // Reservations
  app.post("/api/reservations", async (req, res) => {
    try {
      // Convert dateTime string to Date object if needed
      if (req.body.dateTime && typeof req.body.dateTime === 'string') {
        req.body.dateTime = new Date(req.body.dateTime);
      }
      const validatedData = insertReservationSchema.parse(req.body);
      const reservation = await dbStorage.createReservation(validatedData);
      // TODO: Send confirmation email
      res.json(reservation);
    } catch (error) {
      console.error("Error creating reservation:", error);
      res.status(400).json({ message: "Failed to create reservation" });
    }
  });

  app.get("/api/reservations", async (req, res) => {
    try {
      const { status, date } = req.query;
      const reservations = await dbStorage.getReservations(
        status as string,
        date as string
      );
      res.json(reservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });

  app.patch("/api/reservations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertReservationSchema.partial().parse(req.body);
      const reservation = await dbStorage.updateReservation(id, validatedData);
      // TODO: Send status update email
      res.json(reservation);
    } catch (error) {
      console.error("Error updating reservation:", error);
      res.status(400).json({ message: "Failed to update reservation" });
    }
  });

  app.delete("/api/reservations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await dbStorage.deleteReservation(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting reservation:", error);
      res.status(400).json({ message: "Failed to delete reservation" });
    }
  });

  // Sports Scores
  app.get("/api/scores", async (req, res) => {
    try {
      const { date } = req.query;
      const scoreDate = date as string || new Date().toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      
      // Generate dynamic mock data based on the requested date
      const generateMockData = (requestedDate: string) => {
        const isToday = requestedDate === today;
        const isPast = requestedDate < today;
        const isFuture = requestedDate > today;
        
        if (isPast) {
          // Yesterday - show final games
          return {
            NFL: [
              {
                id: `nfl-${requestedDate}-1`,
                startTime: `${requestedDate}T20:20:00Z`,
                status: "final",
                home: { abbr: "KC", name: "Kansas City Chiefs", score: 28 },
                away: { abbr: "BUF", name: "Buffalo Bills", score: 21 },
                details: { quarter: "Final", clock: "" }
              },
              {
                id: `nfl-${requestedDate}-2`,
                startTime: `${requestedDate}T17:00:00Z`,
                status: "final",
                home: { abbr: "DAL", name: "Dallas Cowboys", score: 24 },
                away: { abbr: "NYG", name: "New York Giants", score: 17 },
                details: { quarter: "Final", clock: "" }
              }
            ],
            MLB: [
              {
                id: `mlb-${requestedDate}-1`,
                startTime: `${requestedDate}T19:00:00Z`,
                status: "final",
                home: { abbr: "NYY", name: "New York Yankees", score: 8 },
                away: { abbr: "BOS", name: "Boston Red Sox", score: 5 },
                details: { inning: "Final", outs: "" }
              }
            ]
          };
        } else if (isFuture) {
          // Tomorrow - show scheduled games
          return {
            NFL: [
              {
                id: `nfl-${requestedDate}-1`,
                startTime: `${requestedDate}T20:20:00Z`,
                status: "scheduled",
                home: { abbr: "SEA", name: "Seattle Seahawks", score: null },
                away: { abbr: "SF", name: "San Francisco 49ers", score: null },
                details: { quarter: "", clock: "" }
              },
              {
                id: `nfl-${requestedDate}-2`,
                startTime: `${requestedDate}T17:00:00Z`,
                status: "scheduled",
                home: { abbr: "GB", name: "Green Bay Packers", score: null },
                away: { abbr: "CHI", name: "Chicago Bears", score: null },
                details: { quarter: "", clock: "" }
              }
            ],
            MLB: [
              {
                id: `mlb-${requestedDate}-1`,
                startTime: `${requestedDate}T19:00:00Z`,
                status: "scheduled",
                home: { abbr: "LAD", name: "Los Angeles Dodgers", score: null },
                away: { abbr: "SD", name: "San Diego Padres", score: null },
                details: { inning: "", outs: "" }
              }
            ]
          };
        } else {
          // Today - show mix of live and final games
          return {
            NFL: [
              {
                id: `nfl-${requestedDate}-1`,
                startTime: `${requestedDate}T20:20:00Z`,
                status: "live",
                home: { abbr: "KC", name: "Kansas City Chiefs", score: 21 },
                away: { abbr: "BUF", name: "Buffalo Bills", score: 14 },
                details: { quarter: "Q3", clock: "8:45" }
              },
              {
                id: `nfl-${requestedDate}-2`,
                startTime: `${requestedDate}T17:00:00Z`,
                status: "final",
                home: { abbr: "DAL", name: "Dallas Cowboys", score: 28 },
                away: { abbr: "NYG", name: "New York Giants", score: 21 },
                details: { quarter: "Final", clock: "" }
              }
            ],
            MLB: [
              {
                id: `mlb-${requestedDate}-1`,
                startTime: `${requestedDate}T19:00:00Z`,
                status: "final",
                home: { abbr: "NYY", name: "New York Yankees", score: 7 },
                away: { abbr: "BOS", name: "Boston Red Sox", score: 4 },
                details: { inning: "Final", outs: "" }
              }
            ]
          };
        }
      };
      
      const mockScores = {
        date: scoreDate,
        leagues: generateMockData(scoreDate)
      };
      
      res.json(mockScores);
    } catch (error) {
      console.error("Error fetching scores:", error);
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await dbStorage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingSchema.parse(req.body);
      const setting = await dbStorage.upsertSetting(validatedData);
      res.json(setting);
    } catch (error) {
      console.error("Error saving setting:", error);
      res.status(400).json({ message: "Failed to save setting" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
