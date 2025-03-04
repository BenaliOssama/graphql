import { navigator } from "./utils.js"

export class authentication {
    static isAuthenticated() {
        return !!this.getJwt();
    }
    static getJwt() {
        return localStorage.getItem("jwt");
    }
    static logout() {
        localStorage.removeItem('jwt');
        this.redirectToLogin()
    }
    static redirectToLogin() {
        navigator('/login')
    }

    static authGaurd(route) {
        if (!authentication.isAuthenticated()) {
            if (route != "/login") {
                navigator('/login');
                return
            }
        } else {
            if (route == "/login") {
                navigator('/');
                return
            }
        }
    }
}