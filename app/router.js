import { Router } from "express";
import mainController from "./controllers/mainController.js";
import authController from "./controllers/authController.js";
import talentController from "./controllers/talentController.js";
import profilController from "./controllers/profilController.js";
import skillController from "./controllers/skillController.js";
import followController from "./controllers/followController.js";
import reviewController from "./controllers/reviewController.js";
import messageController from "./controllers/messageController.js";
import { userInfo } from "./middlewares/userInfoCookie.js";

const router = Router();

router.get("/", mainController.renderHomePage);
router.get("/help", mainController.renderHelpPage);

router.get("/talents", talentController.renderTalentsPage);
router.get("/talents/:id", talentController.renderTalentPage);

router.get("/skills", skillController.renderSkillsPage);
router.get("/skills/:slug", skillController.renderSkillPage);

router.get("/register", authController.renderRegisterPage);
router.post("/register", authController.register);

router.get("/onboarding", mainController.renderOnboardingPage);
router.post("/onboarding", mainController.completeOnboarding);

router.get("/login", authController.renderloginPage);
router.post("/login", authController.login);

router.get("/logout", authController.logout);

// Recherche par compétences
router.get("/search", mainController.searchPage);

router.get("/user/:id", mainController.renderHomePage);

router.route("/user/:id/profil")
  .get(mainController.renderProfilePage)
  .post(profilController.updateProfile)
  .delete(profilController.deleteProfile);

// Follow / Unfollow
router.post("/follow/:id", followController.follow);
router.delete("/follow/:id", followController.unfollow);

// Avis
router.post("/review/:userId", reviewController.createReview);

// Messagerie
router.get("/messages", messageController.renderMessagesPage);
router.get("/messages/:userId", messageController.renderConversation);
router.post("/messages/:userId", messageController.sendMessage);

export default router;
