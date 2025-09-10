import {
  users,
  menuCategories,
  menuItems,
  events,
  reservations,
  settings,
  uploads,
  auditLogs,
  type User,
  type UpsertUser,
  type MenuCategory,
  type InsertMenuCategory,
  type MenuItem,
  type InsertMenuItem,
  type Event,
  type InsertEvent,
  type Reservation,
  type InsertReservation,
  type Setting,
  type InsertSetting,
  type Upload,
  type InsertUpload,
  type AuditLog,
  type InsertAuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Menu operations
  getMenuCategories(): Promise<MenuCategory[]>;
  createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory>;
  updateMenuCategory(id: string, category: Partial<InsertMenuCategory>): Promise<MenuCategory>;
  deleteMenuCategory(id: string): Promise<void>;
  
  getMenuItems(categoryId?: string, search?: string): Promise<(MenuItem & { category: MenuCategory })[]>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;
  
  // Event operations
  getEvents(featured?: boolean): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  
  // Reservation operations
  getReservations(status?: string, date?: string): Promise<Reservation[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: string, reservation: Partial<InsertReservation>): Promise<Reservation>;
  
  // Settings operations
  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  upsertSetting(setting: InsertSetting): Promise<Setting>;
  
  // Upload operations
  createUpload(upload: InsertUpload): Promise<Upload>;
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Menu operations
  async getMenuCategories(): Promise<MenuCategory[]> {
    return await db.select().from(menuCategories).orderBy(menuCategories.order);
  }

  async createMenuCategory(category: InsertMenuCategory): Promise<MenuCategory> {
    const [newCategory] = await db.insert(menuCategories).values(category).returning();
    return newCategory;
  }

  async updateMenuCategory(id: string, category: Partial<InsertMenuCategory>): Promise<MenuCategory> {
    const [updated] = await db
      .update(menuCategories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(menuCategories.id, id))
      .returning();
    return updated;
  }

  async deleteMenuCategory(id: string): Promise<void> {
    await db.delete(menuCategories).where(eq(menuCategories.id, id));
  }

  async getMenuItems(categoryId?: string, search?: string): Promise<(MenuItem & { category: MenuCategory })[]> {
    const conditions = [];
    if (categoryId) {
      conditions.push(eq(menuItems.categoryId, categoryId));
    }
    if (search) {
      conditions.push(like(menuItems.name, `%${search}%`));
    }

    const baseQuery = db
      .select({
        id: menuItems.id,
        categoryId: menuItems.categoryId,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        imageUrl: menuItems.imageUrl,
        isAvailable: menuItems.isAvailable,
        tags: menuItems.tags,
        spicyLevel: menuItems.spicyLevel,
        createdAt: menuItems.createdAt,
        updatedAt: menuItems.updatedAt,
        category: menuCategories,
      })
      .from(menuItems)
      .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id));

    if (conditions.length > 0) {
      return await baseQuery.where(and(...conditions)).orderBy(menuItems.name);
    }

    return await baseQuery.orderBy(menuItems.name);
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: string, item: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [updated] = await db
      .update(menuItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    return updated;
  }

  async deleteMenuItem(id: string): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Event operations
  async getEvents(featured?: boolean): Promise<Event[]> {
    const baseQuery = db.select().from(events);
    
    if (featured !== undefined) {
      return await baseQuery.where(eq(events.isFeatured, featured)).orderBy(events.dateTime);
    }
    
    return await baseQuery.orderBy(events.dateTime);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const [updated] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Reservation operations
  async getReservations(status?: string, date?: string): Promise<Reservation[]> {
    const conditions = [];
    if (status) {
      conditions.push(eq(reservations.status, status as any));
    }
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      conditions.push(
        and(
          sql`${reservations.dateTime} >= ${startDate}`,
          sql`${reservations.dateTime} < ${endDate}`
        )
      );
    }

    const baseQuery = db.select().from(reservations);

    if (conditions.length > 0) {
      return await baseQuery.where(and(...conditions)).orderBy(desc(reservations.dateTime));
    }

    return await baseQuery.orderBy(desc(reservations.dateTime));
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const [newReservation] = await db.insert(reservations).values(reservation).returning();
    return newReservation;
  }

  async updateReservation(id: string, reservation: Partial<InsertReservation>): Promise<Reservation> {
    const [updated] = await db
      .update(reservations)
      .set({ ...reservation, updatedAt: new Date() })
      .where(eq(reservations.id, id))
      .returning();
    return updated;
  }

  // Settings operations
  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings).orderBy(settings.key);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async upsertSetting(setting: InsertSetting): Promise<Setting> {
    const [result] = await db
      .insert(settings)
      .values(setting)
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value: setting.value,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // Upload operations
  async createUpload(upload: InsertUpload): Promise<Upload> {
    const [newUpload] = await db.insert(uploads).values(upload).returning();
    return newUpload;
  }

  // Audit log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db.insert(auditLogs).values(log).returning();
    return newLog;
  }
}

export const storage = new DatabaseStorage();
