import { Router } from "express";
import mainController from "./controllers/mainController.js";
import authController from "./controllers/authController.js";
import talentController from "./controllers/talentController.js";
import profilController from "./controllers/profilController.js";
import skillController from "./controllers/skillController.js";
import followController from "./controllers/followController.js";
import reviewController from "./controllers/reviewController.js";
import messageController from "./controllers/messageController.js";
import notificationController from "./controllers/notificationController.js";
import searchController from "./controllers/searchController.js";
import healthController from "./controllers/healthController.js";
import { verifyJWT, optionalJWT } from "./middlewares/jwtVerify.js";
import { uploadAvatar } from "./middlewares/upload.js";

const router = Router();

router.get("/healthz", healthController.liveness);
router.get("/readyz", healthController.readiness);

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

router.post("/logout", authController.logout);

router.get("/search", optionalJWT, searchController.getSearchPage);
router.get("/api/search/talents", searchController.searchTalents);
router.get("/api/search/autocomplete", searchController.autocomplete);

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
router.get("/api/messages/unread-count", verifyJWT, messageController.getUnreadCount);

// Notifications
router.get("/notifications", verifyJWT, notificationController.renderNotificationsPage);
router.get("/api/notifications/count", verifyJWT, notificationController.getUnreadCount);
router.get("/api/notifications/recent", verifyJWT, notificationController.getRecent);
router.post("/api/notifications/:id/read", verifyJWT, notificationController.markAsRead);
router.post("/api/notifications/read-all", verifyJWT, notificationController.markAllAsRead);
router.post("/api/notifications/:id/delete", verifyJWT, notificationController.deleteNotification);

// Recherches sauvegardees
router.post("/api/search/save", verifyJWT, searchController.saveSearch);
router.get("/api/search/saved", verifyJWT, searchController.getSavedSearches);
router.delete("/api/search/saved/:id", verifyJWT, searchController.deleteSavedSearch);

export default router;
