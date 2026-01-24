const API_URL = "http://localhost:5000/api/users";
const token = localStorage.getItem("token");
const userId = new URLSearchParams(window.location.search).get("id");

async function loadProfile() {
  const res = await fetch(`${API_URL}/${userId}`, {
    headers: { Authorization: "Bearer " + token },
  });

  const user = await res.json();

  document.getElementById("username").innerText = user.username;
  document.getElementById("followers").innerText = user.followers.length;
  document.getElementById("following").innerText = user.following.length;

  const loggedInUserId = getUserIdFromToken();
  const isFollowing = user.followers.some((f) => f._id === loggedInUserId);

  document.getElementById("followBtn").innerText = isFollowing
    ? "Unfollow"
    : "Follow";
}

async function toggleFollow() {
  await fetch(`${API_URL}/${userId}/follow`, {
    method: "PUT",
    headers: { Authorization: "Bearer " + token },
  });
  loadProfile();
}

document.getElementById("followBtn").onclick = toggleFollow;
loadProfile();

function getUserIdFromToken() {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.id;
}
