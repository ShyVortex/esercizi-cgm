import type { User } from '../models/User';
import type { Post } from '../models/Post';
import type { Comment } from '../models/Comment';

class Store {
  private static instance: Store;
  
  public users: User[] = [];
  public posts: Post[] = [];
  public comments: Comment[] = [];
  public isAuthenticated: boolean = sessionStorage.getItem('is_auth') === 'true';
  
  // Pagination State
  public publicPagination = {
    pageSize: 10,
    currentPage: 1
  };

  public adminPagination = {
    posts: { pageSize: 10, currentPage: 1 },
    users: { pageSize: 10, currentPage: 1 },
    comments: { pageSize: 10, currentPage: 1 },
    trash: { pageSize: 10, currentPage: 1 }
  };
  
  private constructor() {}

  public static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  public setUsers(users: User[]) {
    this.users = users;
  }

  public setPosts(posts: Post[]) {
    this.posts = posts;
  }

  public setComments(comments: Comment[]) {
    this.comments = comments;
  }
  
  public setAuthenticated(value: boolean) {
    this.isAuthenticated = value;
    sessionStorage.setItem('is_auth', String(value));
  }
}

export const store = Store.getInstance();
