/**
 * Peer Support & Anonymous Recovery Forum Component
 * Enables community connection, encouragement posts, and likes.
 */
class PeerSupport {
  constructor() {
    this.initEvents();
  }

  initEvents() {
    this.renderPosts();

    const postBtn = document.getElementById('submit-peer-post-btn');
    if (postBtn) {
      postBtn.addEventListener('click', () => {
        const input = document.getElementById('peer-post-input');
        if (input && input.value.trim().length > 0) {
          window.storageManager.addPeerPost(input.value.trim());
          input.value = '';
          this.renderPosts();
        }
      });
    }
  }

  renderPosts() {
    const posts = window.storageManager.getPeerPosts();
    const container = document.getElementById('peer-posts-list');
    if (!container) return;

    container.innerHTML = posts.map(p => `
      <div class="peer-post-card">
        <div class="post-header">
          <div class="post-user">
            <span class="user-avatar">👤</span>
            <div>
              <span class="username">${p.author}</span>
              <span class="user-badge">${p.badge}</span>
            </div>
          </div>
          <span class="post-time">${p.time}</span>
        </div>
        <p class="post-content">${p.content}</p>
        <div class="post-footer">
          <button class="like-btn" onclick="window.peerSupport.like('${p.id}')">
            ❤️ <span>${p.likes} Support</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  like(id) {
    window.storageManager.likePost(id);
    this.renderPosts();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.peerSupport = new PeerSupport();
});
