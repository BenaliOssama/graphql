import { Router } from "./router.js";
import { ProfilePage } from "./home.js";
import {LogInPage} from "./login.js"



const router = new Router();

// Register routes with component classes
router.addRoute('/profile', ProfilePage);
router.addRoute('/login', LogInPage);