const view = document.querySelector("#profil-view");
const edit = document.querySelector("#profil-edit");
const editBtn = document.querySelector("#editBtn");
const cancelBtn = document.querySelector("#cancelEdit");

editBtn.addEventListener("click", () => {
  view.classList.add("ss-hidden");
  edit.classList.remove("ss-hidden");
});

cancelBtn.addEventListener("click", () => {
  edit.classList.add("ss-hidden");
  view.classList.remove("ss-hidden");
});
