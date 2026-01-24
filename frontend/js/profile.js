const token = localStorage.getItem("token");
if (!token) window.location.href = "index.html";

const params = new URLSearchParams(window.location.search);
const userId = params.get("id");

const USER_API = "http://localhost:5000/api/users";
const POST_API = "http://localhost:5000/api/posts";

const myId = JSON.parse(atob(token.split(".")[1])).id;

async function loadProfile() {
  const userId = getProfileId();
  const res = await fetch(`${USER_API}/${userId}`, {
    headers: { Authorization: "Bearer " + token },
  });
  const user = await res.json();

  document.getElementById("username").innerText = user.username;
  document.getElementById("followers").innerText = user.followers.length;
  document.getElementById("following").innerText = user.following.length;

  const followBtn = document.getElementById("followBtn");

  if (user._id === myId) {
    followBtn.style.display = "none";
  } else {
    followBtn.innerText = user.followers.includes(myId) ? "Unfollow" : "Follow";
    followBtn.onclick = toggleFollow;
  }

  loadPosts();
}

async function toggleFollow() {
  await fetch(`${USER_API}/${userId}/follow`, {
    method: "PUT",
    headers: { Authorization: "Bearer " + token },
  });
  loadProfile();
}

async function loadPosts() {
  const res = await fetch(`${POST_API}/user/${userId}`, {
    headers: { Authorization: "Bearer " + token },
  });
  const posts = await res.json();

  const postsDiv = document.getElementById("posts");
  postsDiv.innerHTML = "";

  document.getElementById("postCount").innerText = posts.length;

  posts.forEach((post) => {
    const div = document.createElement("div");
    div.className = "profile-post";
    div.innerText = post.content;
    postsDiv.appendChild(div);
  });
}
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
function getProfileId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

window.onload = () => {
  loadProfile();
};
