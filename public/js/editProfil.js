const view = document.querySelector("#profil-view");
const edit = document.querySelector("#profil-edit");
const editBtn = document.querySelector("#editBtn");
const cancelBtn = document.querySelector("#cancelEdit");

editBtn.addEventListener("click", () => {
  view.classList.add("is-hidden");
  edit.classList.remove("is-hidden");
});

cancelBtn.addEventListener("click", () => {
  edit.classList.add("is-hidden");
  view.classList.remove("is-hidden");
});
