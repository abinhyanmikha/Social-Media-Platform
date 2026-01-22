const API_URL = "http://localhost:5000/api/posts";
const token = localStorage.getItem("token");

// Protect page
if (!token) {
  window.location.href = "index.html";
}

// LOGOUT
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// FETCH POSTS
async function fetchPosts() {
  const res = await fetch(API_URL, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  // Token expired or invalid
  if (res.status === 401) {
    logout();
    return;
  }

  const posts = await res.json();
  const postsDiv = document.getElementById("posts");
  postsDiv.innerHTML = "";

  posts.forEach((post) => {
    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
  <strong>${post.user.username}</strong>
  <p>${post.content}</p>

  <button class="like-btn" onclick="likePost('${post._id}')">
    ❤️ ${post.likes.length}
  </button>
${
  post.user._id.toString() === getUserIdFromToken()
    ? `<button class="delete-btn" onclick="deletePost('${post._id}')">🗑 Delete</button>`
    : ""
}
 <div class="comments">
  ${post.comments
    .map(
      (c) => `
        <p>
          <strong>${c.user?.username || "User"}:</strong>
          ${c.text}
          ${
            c.user && c.user._id.toString() === getUserIdFromToken()
              ? `<button onclick="deleteComment('${post._id}','${c._id || c.id}')">🗑</button>`
              : ""
          }
        </p>
      `,
    )
    .join("")}
</div>


  <input
    placeholder="Add a comment..."
    onkeydown="if(event.key==='Enter') addComment('${post._id}', this)"
  />
`;

    postsDiv.appendChild(div);
  });
}

// CREATE POST
async function createPost() {
  const content = document.getElementById("content").value.trim();
  if (!content) return;

  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ content }),
  });

  document.getElementById("content").value = "";
  fetchPosts();
}

// LIKE / UNLIKEd
async function likePost(postId) {
  await fetch(`${API_URL}/${postId}/like`, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  fetchPosts();
}
// Initial fetch
fetchPosts();

async function addComment(postId, input) {
  const text = input.value.trim();
  if (!text) return;

  await fetch(`${API_URL}/${postId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ text }),
  });

  input.value = "";
  fetchPosts();
}

function getUserIdFromToken() {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.id; // ✅ matches JWT
}

async function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) return;

  await fetch(`${API_URL}/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  fetchPosts();
}
async function deleteComment(postId, commentId) {
  if (!confirm("Are you sure you want to delete this comment?")) return;
  const res = await fetch(`${API_URL}/${postId}/comment/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (res.status === 401) return logout();
  if (res.status === 403)
    return alert("You are not authorized to delete this comment");
  if (res.status === 404) return "Comment not found";

  if (!res.ok) {
    const err = await res.json();
    return alert(err.message || "Failed to delete comment");
  }
  fetchPosts();
}
