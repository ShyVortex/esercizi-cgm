import { Comment } from "../types/comment.js";
import { ResponseJson } from "../types/response.js";
import { BASE_URL } from "../utilities/api.js";

export class CommentsService {
    static async getAllComments(): Promise<Comment[]> {
        const commentsRes: Response = await fetch(`${BASE_URL}/comments`);
        const comments: ResponseJson = await commentsRes.json();

        return (comments.data || comments) as Comment[];
    }
}