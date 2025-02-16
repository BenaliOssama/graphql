export class authentication {
    static isAuthenticated() {
        // undefined --> true --> false 
        // jwt --> false --> true 
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
        window.location.href = '/login';
    }
}