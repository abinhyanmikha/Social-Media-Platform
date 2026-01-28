const API_URL = "/api/users";
const POST_API = "/api/posts";

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

function getProfileId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function getUserIdFromToken() {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.id;
}

function openModal(title, list) {
  document.getElementById("modalTitle").innerText = title;

  const modalList = document.getElementById("modalList");
  modalList.innerHTML = "";

  list.forEach((user) => {
    modalList.innerHTML += `
      <p>
        <a href="profile.html?id=${user._id}">
          ${user.username}
        </a>
      </p>
    `;
  });

  document.getElementById("listModal").style.display = "flex";
}

document.getElementById("closeModal").onclick = () => {
  document.getElementById("listModal").style.display = "none";
};

async function loadPosts(userId) {
  const res = await fetch(`${POST_API}/user/${userId}`, {
    headers: { Authorization: "Bearer " + token },
  });
  const posts = await res.json();

  document.getElementById("postCount").innerText = posts.length;

  document.getElementById("posts").innerHTML = posts
    .map(
      (p) => `
      <div class="post">
        <p><strong>${p.user.username}</strong></p>
        <p>${p.content}</p>
      </div>
    `,
    )
    .join("");
}

async function loadProfile() {
  const userId = getProfileId();

  const res = await fetch(`${API_URL}/${userId}`, {
    headers: { Authorization: "Bearer " + token },
  });

  const user = await res.json();

  document.getElementById("username").innerText = user.username;
  document.getElementById("followers").innerText = user.followers.length;
  document.getElementById("following").innerText = user.following.length;

  document.getElementById("followersBtn").onclick = () => {
    openModal("Followers", user.followers);
  };

  document.getElementById("followingBtn").onclick = () => {
    openModal("Following", user.following);
  };

  // follow/unfollow button
  const currentUserId = getUserIdFromToken();
  const followBtn = document.getElementById("followBtn");

  if (currentUserId === user._id.toString()) {
    followBtn.style.display = "none";
  } else {
    followBtn.innerText = user.followers.some(
      (u) => u._id.toString() === currentUserId,
    )
      ? "Unfollow"
      : "Follow";

    followBtn.onclick = async () => {
      await fetch(`${API_URL}/${userId}/follow`, {
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
      });

      loadProfile(); // refresh
    };
  }

  // load profile posts
  loadPosts(userId);
}

loadProfile();
