import { authentication } from "./auth.js"
import { navigator } from "./utils.js";

export class Router {
    constructor() {
        this.routes = {};
        this.currentComponent = null; // Track active component instance

        // Bind events
        window.addEventListener('popstate', this.handlePopstate.bind(this));
        window.addEventListener('load', this.handleInitialLoad.bind(this));
    }

    addRoute(path, ComponentClass) {
        this.routes[path] = ComponentClass; // Store component class
    }
    authGaurd(route) {
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
    render(route) {
        this.authGaurd(route)

        const app = document.getElementById('app');

        // Unmount current component if it exists
        if (this.currentComponent && typeof this.currentComponent.unmount === 'function') {
            this.currentComponent.unmount();
        }

        // Get the component class for the route
        const ComponentClass = this.routes[route];

        if (ComponentClass) {
            // Instantiate and render the component
            this.currentComponent = new ComponentClass();
            app.innerHTML = this.currentComponent.render();

            // Mount the component (setup event listeners, etc.)
            if (typeof this.currentComponent.mount === 'function') {
                this.currentComponent.mount();
            }
        } else {
            app.innerHTML = '<h1>404 Not Found</h1>';
            this.currentComponent = null;
        }
    }


    handlePopstate(event) {
        event.preventDefault();
        const currentRoute = window.location.pathname;
        //navigator(currentRoute)
        this.render(currentRoute);
    }

    handleInitialLoad(event) {
        event.preventDefault();
        const initialRoute = window.location.pathname;
        navigator(initialRoute);
    }
}
