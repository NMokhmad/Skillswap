document.addEventListener("DOMContentLoaded", () => {
  const userInfoCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('userInfo='));

  if (userInfoCookie) {
    const userInfo = JSON.parse(decodeURIComponent(userInfoCookie.split('=')[1]));
    console.log("Utilisateur :", userInfo.firstname, userInfo.lastname);
  } else {
    console.log("Aucun utilisateur trouvé");
  }
});
