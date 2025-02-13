export class ProfilePage {
    render() {
        return `
        <header>
            <span data-route="/logout">logout</span>
        </header>
        <h1>Home Page</h1>
        <button id="demo-btn">Click Me</button>`;
    }

    mount() {
        // Event listeners are set up here
        this.button = document.getElementById('demo-btn');
        this.handleClick = () => alert('Button clicked!');
        this.button.addEventListener('click', this.handleClick);

        // Handle navigation
        this.handleNavigation = (event) => {
            const route = event.target.getAttribute('data-route');
            if (route) {
                window.history.pushState({}, '', route);
                window.dispatchEvent(new Event('popstate')); // Trigger route change
            }
        };
        document.body.addEventListener('click', this.handleNavigation);
    }

    unmount() {
        // Cleanup when navigating away
        this.button.removeEventListener('click', this.handleClick);
        document.body.removeEventListener('click', this.handleNavigation);
    }
}