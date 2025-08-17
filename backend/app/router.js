import { Router } from "express";
import mainController from "./controllers/mainController.js";
import authController from "./controllers/authController.js";
import talentController from "./controllers/talentController.js";
import profilController from "./controllers/profilController.js";
import skillController from "./controllers/skillController.js";

const router = Router();

// --- MAIN ---
router.get("/", mainController.getHomeData);
router.get("/help", mainController.getHelpData);
router.get("/search", mainController.search); 
router.get("/user/:id", mainController.getUserData);
router.get("/user/:id/profil", mainController.getProfileData);

// --- AUTH ---
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// --- TALENTS ---
router.get("/talents", talentController.getAllTalents);
router.get("/talents/:id", talentController.getTalentById);

// --- SKILLS ---
router.get("/skills", skillController.getAllSkills);
router.get("/skills/:slug", skillController.getSkillBySlug);

// --- PROFILE ---
router.post("/user/:id/profil", profilController.updateProfile);
router.delete("/user/:id/profil", profilController.deleteProfile);

export default router;


