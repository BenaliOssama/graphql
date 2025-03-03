import { navigator } from "./utils.js";
export class LogOut {
    render() {
        return ``;
    }
    mount() {
        localStorage.removeItem('jwt');
        navigator('/login')
    }
}