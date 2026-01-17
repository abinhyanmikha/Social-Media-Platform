const API_URL = "http://localhost:5000/api/posts";
const token = localStorage.getItem("token");

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

  const posts = await res.json();
  const postsDiv = document.getElementById("posts");
  postsDiv.innerHTML = "";

  posts.forEach((post) => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <strong>${post.user.username}</strong>
      <p>${post.content}</p>
      <button onclick="likePost('${post._id}')">
        ❤️ ${post.likes.length}
      </button>
    `;

    postsDiv.appendChild(div);
  });
}

// CREATE POST
async function createPost() {
  const content = document.getElementById("content").value;

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

// INITIAL LOAD
fetchPosts();
