import type { User } from '../models/User';
import { fetchData } from './api';
import { store } from './Store';

export class UserService {
  static async getAllUsers(includeDeleted = false): Promise<User[]> {
    if (store.users.length === 0) {
      const users = await fetchData<User[]>('/users');
      store.setUsers(users);
    }
    return includeDeleted ? store.users : store.users.filter(u => !u.isDeleted);
  }

  static getDeletedUsers(): User[] {
    return store.users.filter(u => u.isDeleted);
  }

  static getUserById(id: number): User | undefined {
    return store.users.find(u => u.id === id);
  }

  // Admin CRUD
  static addUser(user: Omit<User, 'id' | 'isDeleted'>): User {
    const newUser: User = { ...user, id: Math.max(0, ...store.users.map(u => u.id)) + 1, isDeleted: false };
    store.users.push(newUser);
    return newUser;
  }

  static updateUser(id: number, userData: Partial<User>): User | undefined {
    const index = store.users.findIndex(u => u.id === id);
    if (index !== -1) {
      store.users[index] = { ...store.users[index], ...userData };
      return store.users[index];
    }
    return undefined;
  }

  // Logical Delete
  static deleteUser(id: number): boolean {
    const user = this.getUserById(id);
    if (user) {
      user.isDeleted = true;
      return true;
    }
    return false;
  }

  // Restore
  static restoreUser(id: number): boolean {
    const user = this.getUserById(id);
    if (user) {
      user.isDeleted = false;
      return true;
    }
    return false;
  }

  // Physical Delete
  static permanentlyDeleteUser(id: number): boolean {
    const initialLength = store.users.length;
    store.users = store.users.filter(u => u.id !== id);
    return store.users.length < initialLength;
  }
}
