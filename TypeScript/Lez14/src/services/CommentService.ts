import type { Comment } from '../models/Comment';
import { fetchData } from './api';
import { store } from './Store';

export class CommentService {
  static async getAllComments(includeDeleted = false): Promise<Comment[]> {
    if (store.comments.length === 0) {
      const comments = await fetchData<Comment[]>('/comments');
      store.setComments(comments);
    }
    return includeDeleted ? store.comments : store.comments.filter(c => !c.isDeleted);
  }

  static getDeletedComments(): Comment[] {
    return store.comments.filter(c => c.isDeleted);
  }

  static async getCommentsByPostId(postId: number): Promise<Comment[]> {
    const allComments = await this.getAllComments();
    return allComments.filter(c => c.postId === postId && !c.isDeleted);
  }

  // Admin CRUD
  static addComment(comment: Omit<Comment, 'id' | 'isDeleted'>): Comment {
    const newComment: Comment = { ...comment, id: Math.max(0, ...store.comments.map(c => c.id)) + 1, isDeleted: false };
    store.comments.push(newComment);
    return newComment;
  }

  static updateComment(id: number, commentData: Partial<Comment>): Comment | undefined {
    const index = store.comments.findIndex(c => c.id === id);
    if (index !== -1) {
      store.comments[index] = { ...store.comments[index], ...commentData };
      return store.comments[index];
    }
    return undefined;
  }

  // Logical Delete
  static deleteComment(id: number): boolean {
    const comment = store.comments.find(c => c.id === id);
    if (comment) {
      comment.isDeleted = true;
      return true;
    }
    return false;
  }

  // Restore
  static restoreComment(id: number): boolean {
    const comment = store.comments.find(c => c.id === id);
    if (comment) {
      comment.isDeleted = false;
      return true;
    }
    return false;
  }

  // Physical Delete
  static permanentlyDeleteComment(id: number): boolean {
    const initialLength = store.comments.length;
    store.comments = store.comments.filter(c => c.id !== id);
    return store.comments.length < initialLength;
  }
}
