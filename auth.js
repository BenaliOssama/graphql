export class authentication {
    static isAuthenticated() {
        return !!localStorage.getItem("jwt");
    }

    static logout() {
        localStorage.removeItem('jwt');
        this.redirectToLogin()
    }
    static redirectToLogin(){
        window.location.href = '/login'; 
    }
}