import type { Post } from '../models/Post';
import { fetchData } from './api';
import { store } from './Store';

export class PostService {
  static async getAllPosts(includeDeleted = false): Promise<Post[]> {
    if (store.posts.length === 0) {
      const posts = await fetchData<Post[]>('/posts');
      store.setPosts(posts);
    }
    return includeDeleted ? store.posts : store.posts.filter(p => !p.isDeleted);
  }

  static getDeletedPosts(): Post[] {
    return store.posts.filter(p => p.isDeleted);
  }

  static getPostById(id: number): Post | undefined {
    return store.posts.find(p => p.id === id);
  }

  static getPostsByUserId(userId: number): Post[] {
    return store.posts.filter(p => p.userId === userId && !p.isDeleted);
  }

  static searchPosts(query: string): Post[] {
    const lowerQuery = query.toLowerCase();
    return store.posts.filter(p => 
      !p.isDeleted && (
        p.title.toLowerCase().includes(lowerQuery) || 
        p.body.toLowerCase().includes(lowerQuery)
      )
    );
  }

  // Admin CRUD
  static addPost(post: Omit<Post, 'id' | 'isDeleted'>): Post {
    const newPost: Post = { ...post, id: Math.max(0, ...store.posts.map(p => p.id)) + 1, isDeleted: false };
    store.posts.unshift(newPost);
    return newPost;
  }

  static updatePost(id: number, postData: Partial<Post>): Post | undefined {
    const index = store.posts.findIndex(p => p.id === id);
    if (index !== -1) {
      store.posts[index] = { ...store.posts[index], ...postData };
      return store.posts[index];
    }
    return undefined;
  }

  // Logical Delete
  static deletePost(id: number): boolean {
    const post = this.getPostById(id);
    if (post) {
      post.isDeleted = true;
      return true;
    }
    return false;
  }

  // Restore
  static restorePost(id: number): boolean {
    const post = this.getPostById(id);
    if (post) {
      post.isDeleted = false;
      return true;
    }
    return false;
  }

  // Physical Delete
  static permanentlyDeletePost(id: number): boolean {
    const initialLength = store.posts.length;
    store.posts = store.posts.filter(p => p.id !== id);
    return store.posts.length < initialLength;
  }
}
