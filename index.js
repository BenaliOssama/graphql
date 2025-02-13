import { Router } from "./router.js";
import { ProfilePage } from "./profile.js";
import {LogInPage} from "./login.js"



const router = new Router();

// Register routes with component classes
router.addRoute('/', ProfilePage);
router.addRoute('/login', LogInPage);