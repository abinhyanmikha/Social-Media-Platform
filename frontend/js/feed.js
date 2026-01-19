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

  <div class="comments">
    ${post.comments
      .map(
        (c) => `
      <p>
        <strong>${c.user?.username || "User"}:</strong>
        ${c.text}
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

// LIKE / UNLIKE
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
