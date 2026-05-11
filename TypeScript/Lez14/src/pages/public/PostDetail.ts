import { PostService } from '../../services/PostService';
import { UserService } from '../../services/UserService';
import { CommentService } from '../../services/CommentService';

export async function renderPostDetail(container: HTMLElement, postId: number) {
  const post = PostService.getPostById(postId);
  
  if (!post) {
    container.innerHTML = `<div class="error-container">Post non trovato. <a href="#/">Torna alla home</a></div>`;
    return;
  }

  const author = UserService.getUserById(post.userId);
  
  // Show skeleton/loading for comments
  container.innerHTML = `
    <article class="post-detail">
      <header class="post-detail-header">
        <a href="#/" class="back-link"><span class="material-icons">arrow_back</span> Torna alla lista</a>
        <h1>${post.title}</h1>
        <div class="post-meta">
          <span class="author-info">di <strong>${author?.name || 'Autore sconosciuto'}</strong></span>
          ${author?.email ? `<span class="author-email">(${author.email})</span>` : ''}
        </div>
      </header>
      <div class="post-body">
        <p>${post.body}</p>
      </div>
      <section class="comments-section">
        <h3>Commenti</h3>
        <div id="comments-list" class="comments-list">
          <p class="loading-text">Caricamento commenti...</p>
        </div>
      </section>
    </article>
  `;

  // Fetch comments
  try {
    const comments = await CommentService.getCommentsByPostId(postId);
    const commentsList = container.querySelector('#comments-list') as HTMLElement;
    
    if (comments.length === 0) {
      commentsList.innerHTML = '<p class="no-comments">Nessun commento per questo post.</p>';
    } else {
      commentsList.innerHTML = comments.map(comment => `
        <div class="comment-card">
          <div class="comment-header">
            <span class="comment-author">${comment.name}</span>
            <span class="comment-email">${comment.email}</span>
          </div>
          <p class="comment-body">${comment.body}</p>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    const commentsList = container.querySelector('#comments-list') as HTMLElement;
    commentsList.innerHTML = '<p class="error-text">Errore nel caricamento dei commenti.</p>';
  }
}
