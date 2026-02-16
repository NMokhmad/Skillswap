import { Router } from "express";
import mainController from "./controllers/mainController.js";
import authController from "./controllers/authController.js";
import talentController from "./controllers/talentController.js";
import profilController from "./controllers/profilController.js";
import skillController from "./controllers/skillController.js";
import followController from "./controllers/followController.js";
import reviewController from "./controllers/reviewController.js";
import messageController from "./controllers/messageController.js";
import { verifyJWT, optionalJWT } from "./middlewares/jwtVerify.js";
import { uploadAvatar } from "./middlewares/upload.js";

const router = Router();

// ============================================
// Routes publiques (optionalJWT pour savoir si un user est connecté)
// ============================================
router.get("/", optionalJWT, mainController.renderHomePage);
router.get("/help", mainController.renderHelpPage);

router.get("/talents", optionalJWT, talentController.renderTalentsPage);
router.get("/talents/:id", optionalJWT, talentController.renderTalentPage);

router.get("/skills", optionalJWT, skillController.renderSkillsPage);
router.get("/skills/:slug", optionalJWT, skillController.renderSkillPage);

router.get("/register", authController.renderRegisterPage);
router.post("/register", authController.register);

router.get("/login", authController.renderloginPage);
router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.get("/search", optionalJWT, mainController.searchPage);

// ============================================
// Routes protégées (verifyJWT obligatoire)
// ============================================

// Onboarding
router.get("/onboarding", verifyJWT, mainController.renderOnboardingPage);
router.post("/onboarding", verifyJWT, uploadAvatar, mainController.completeOnboarding);

// Profil
router.get("/user/:id", verifyJWT, mainController.renderHomePage);
router.route("/user/:id/profil")
  .get(verifyJWT, mainController.renderProfilePage)
  .post(verifyJWT, uploadAvatar, profilController.updateProfile)
  .delete(verifyJWT, profilController.deleteProfile);

// Follow / Unfollow
router.post("/follow/:id", verifyJWT, followController.follow);
router.delete("/follow/:id", verifyJWT, followController.unfollow);

// Avis
router.post("/review/:userId", verifyJWT, reviewController.createReview);

// Messagerie
router.get("/messages", verifyJWT, messageController.renderMessagesPage);
router.get("/messages/:userId", verifyJWT, messageController.renderConversation);
router.post("/messages/:userId", verifyJWT, messageController.sendMessage);

export default router;
