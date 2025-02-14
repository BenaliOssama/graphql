export class LogOut {
    render() {
        return ``;
    }
    mount() {
        localStorage.removeItem('jwt');
        window.location.href = '/login';
    }
}