import { Comment } from "../shared/types/comment.js";
import { BaseApiService } from "./base-api.service.js";

class CommentsService extends BaseApiService<Comment> {
    protected resource = "comments";

    public async getActiveComments(): Promise<Comment[]> {
        return this.getAll("?isActive=true");
    }

    public async getCommentsByPostId(postId: number): Promise<Comment[]> {
        return this.getAll(`?postId=${postId}&isActive=true`);
    }
}

export const commentsService = new CommentsService();
