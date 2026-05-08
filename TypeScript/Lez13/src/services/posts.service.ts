import { Post } from "../types/post.js";
import { BASE_URL } from "../utilities/api.js";

export class PostsService {
    static async getAllPosts(): Promise<Post[]> {
        const postsRes: Response = await fetch(`${BASE_URL}/posts?isActive=true`);
        const posts: Post[] = await postsRes.json();

        return posts;
    }

    static async getPost(id: number): Promise<Post> {
        const postRes: Response = await fetch(`${BASE_URL}/posts/${id}`);
        const post: Post = await postRes.json();

        return post;
    }
}