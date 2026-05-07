import { Post } from "../types/post.js";
import { ResponseJson } from "../types/response-json.js";
import { BASE_URL } from "../utilities/api.js";

export class PostsService {
    static async getAllPosts(): Promise<Post[]> {
        const postsRes: Response = await fetch(`${BASE_URL}/posts`);
        const posts: ResponseJson = await postsRes.json();

        return (posts.data || posts) as Post[];
    }

    static async getPost(id: number): Promise<Post> {
        const postRes: Response = await fetch(`${BASE_URL}/posts/${id}`);
        const post: Post = await postRes.json();

        return post;
    }
}