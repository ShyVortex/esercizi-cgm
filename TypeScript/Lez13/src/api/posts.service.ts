import { Post } from "../shared/types/post.js";
import { BaseApiService } from "./base-api.service.js";

class PostsService extends BaseApiService<Post> {
    protected resource = "posts";

    public async getActivePosts(): Promise<Post[]> {
        return this.getAll("?isActive=true");
    }
}

export const postsService = new PostsService();
