import { authentication } from "./auth.js"

export class Router {
    constructor() {
        this.routes = {};
        this.currentComponent = null; // Track active component instance
        console.log('Router initialized');

        // Bind events
        window.addEventListener('popstate', this.handlePopstate.bind(this));
        window.addEventListener('load', this.handleInitialLoad.bind(this));
    }

    addRoute(path, ComponentClass) {
        console.log(`Adding route: ${path}`);
        this.routes[path] = ComponentClass; // Store component class
    }

    render(route) {
        console.log(`befor Attempting to render: ${route}. check if the user is loggedin ? `);
        if (window.location.pathname != "/login") {
            if (!authentication.isAuthenticated()) {
                this.navigate('/login', true)
                return
            }
        }
        console.log(`Attempting to render: ${route}`);
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

    navigate(route, replace = false) {
        console.log(`Navigating to: ${route}`, replace ? '(replace)' : '');
        window.history[replace ? 'replaceState' : 'pushState']({}, '', route);
        this.render(route);
    }

    handlePopstate() {
        console.log('Popstate triggered');
        const currentRoute = window.location.pathname;
        this.render(currentRoute);
    }

    handleInitialLoad() {
        if (window.location.href != "/login") {
            if (!authentication.isAuthenticated()) {
                this.navigate('/login', true)
                return
            }
        }
        console.log('Page loaded');
        const initialRoute = window.location.pathname;
        this.navigate(initialRoute, true);
    }
}
