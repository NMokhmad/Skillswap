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
import { uploadAvatar, validateAndRenameAvatar } from "./middlewares/upload.js";

const router = Router();

router.get("/healthz", healthController.liveness);
router.get("/readyz", healthController.readiness);

// ============================================
// Routes publiques (optionalJWT pour savoir si un user est connecté)
// ============================================
router.get("/api/homepage", optionalJWT, mainController.getHomepage);

router.get("/api/talents", optionalJWT, talentController.apiGetTalents);
router.get("/api/talents/:id", optionalJWT, talentController.apiGetTalent);

router.get("/api/skills", skillController.apiGetSkills);
router.get("/api/skills/:slug", skillController.apiGetSkill);

// ── Routes API JSON (pour React frontend) ──────────────────────────────────
router.post("/api/auth/login", authController.apiLogin);
router.post("/api/auth/register", authController.apiRegister);
router.post("/api/auth/logout", authController.apiLogout);
router.get("/api/me", optionalJWT, authController.apiMe);

router.get("/api/search/talents", searchController.searchTalents);
router.get("/api/search/autocomplete", searchController.autocomplete);
router.get("/api/user/:id/profil", optionalJWT, profilController.getProfil);
router.get("/api/me/profil", verifyJWT, profilController.getMyProfil);
router.put("/api/me/profil", verifyJWT, uploadAvatar, validateAndRenameAvatar, profilController.apiUpdateProfile);
router.delete("/api/me/profil", verifyJWT, profilController.apiDeleteProfile);

// ============================================
// Routes protégées (verifyJWT obligatoire)
// ============================================

// Onboarding API JSON
router.get("/api/onboarding/skills", verifyJWT, mainController.getOnboardingData);
router.post("/api/onboarding", verifyJWT, uploadAvatar, validateAndRenameAvatar, mainController.apiCompleteOnboarding);

// Follow / Unfollow
router.post("/follow/:id", verifyJWT, followController.follow);
router.delete("/follow/:id", verifyJWT, followController.unfollow);

// Avis
router.post("/review/:userId", verifyJWT, reviewController.createReview);

// Messagerie API JSON
router.get("/api/messages", verifyJWT, messageController.getConversations);
router.get("/api/messages/unread-count", verifyJWT, messageController.getUnreadCount);
router.get("/api/messages/:userId", verifyJWT, messageController.getConversation);
router.post("/api/messages/:userId", verifyJWT, messageController.apiSendMessage);

// Notifications
router.get("/api/notifications", verifyJWT, notificationController.getAll);
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
