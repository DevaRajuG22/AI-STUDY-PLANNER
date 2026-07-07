import fs from 'fs';
import path from 'path';

// Path to store our JSON file database (mock MongoDB)
const DB_FILE_PATH = path.resolve(process.cwd(), 'data', 'db.json');

// Ensure parent directories exist
function ensureDbFileExists() {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE_PATH)) {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify({
      users: [],
      studyPlans: [],
      tasks: [],
      habits: [],
      reminders: [],
      aiRecommendations: []
    }, null, 2));
  }
}

interface DbSchema {
  users: any[];
  studyPlans: any[];
  tasks: any[];
  habits: any[];
  reminders: any[];
  aiRecommendations: any[];
}

export class MockCollection<T extends { id: string; [key: string]: any }> {
  private collectionName: keyof DbSchema;

  constructor(collectionName: keyof DbSchema) {
    this.collectionName = collectionName;
    ensureDbFileExists();
  }

  private readAll(): T[] {
    ensureDbFileExists();
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const db: DbSchema = JSON.parse(data);
    return (db[this.collectionName] || []) as T[];
  }

  private writeAll(items: T[]): void {
    ensureDbFileExists();
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const db: DbSchema = JSON.parse(data);
    db[this.collectionName] = items;
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2));
  }

  async find(filter: Partial<T> = {}): Promise<T[]> {
    const items = this.readAll();
    return items.filter(item => {
      for (const key in filter) {
        if (item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(filter: Partial<T> = {}): Promise<T | null> {
    const items = this.readAll();
    const found = items.find(item => {
      for (const key in filter) {
        if (item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
    return found || null;
  }

  async findById(id: string): Promise<T | null> {
    const items = this.readAll();
    const found = items.find(item => item.id === id);
    return found || null;
  }

  async create(itemData: Omit<T, 'id'>): Promise<T> {
    const items = this.readAll();
    const newItem = {
      ...itemData,
      id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as unknown as T;
    
    items.push(newItem);
    this.writeAll(items);
    return newItem;
  }

  async findByIdAndUpdate(id: string, updateData: Partial<T>): Promise<T | null> {
    const items = this.readAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    items[index] = updatedItem;
    this.writeAll(items);
    return updatedItem;
  }

  async findByIdAndDelete(id: string): Promise<boolean> {
    const items = this.readAll();
    const initialLength = items.length;
    const filteredItems = items.filter(item => item.id !== id);
    this.writeAll(filteredItems);
    return filteredItems.length < initialLength;
  }
}

// Instantiate and export database collections acting as MongoDB collections
export const User = new MockCollection<any>('users');
export const StudyPlan = new MockCollection<any>('studyPlans');
export const Task = new MockCollection<any>('tasks');
export const Habit = new MockCollection<any>('habits');
export const Reminder = new MockCollection<any>('reminders');
export const AIRecommendation = new MockCollection<any>('aiRecommendations');
