import { Router } from "express";
import mainController from "./controllers/mainController.js";
import authController from "./controllers/authController.js";
import talentController from "./controllers/talentController.js";
import profilController from "./controllers/profilController.js";
import skillController from "./controllers/skillController.js";

const router = Router();

router.get("/", mainController.renderHomePage);
router.get("/help", mainController.renderHelpPage);

router.get("/talents", talentController.renderTalentsPage);
router.get("/talents/:id", talentController.renderTalentPage);

router.get("/skills", skillController.renderSkillsPage);
router.get("/skills/:slug", skillController.renderSkillPage);

router.get("/register", authController.renderRegisterPage);
router.post("/register", authController.register);

router.get("/login", authController.renderloginPage);
router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.get("/searchPage", mainController.searchPage);

router.get("/user/:id", mainController.renderHomePage);

router.route("/user/:id/profil")
  .get(mainController.renderProfilePage)
  .post(profilController.updateProfile)
  .delete(profilController.deleteProfile);
  


export default router;


