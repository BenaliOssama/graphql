export class SpiderWebChart {
    constructor(containerId, data, options = {}) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.options = {
            width: 400,
            height: 400,
            levels: 5,
            maxValue: 10,
            ...options
        };
        this.svg = null;
        this.radius = Math.min(this.options.width, this.options.height) / 2;
        this.angleSlice = (Math.PI * 2) / this.data.length ;
    }

    draw() {
        this.clearContainer();
        this.createSVG();
        this.drawGrid();
        this.drawData();
    }

    clearContainer() {
        this.container.innerHTML = '';
    }

    createSVG() {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width", this.options.width);
        this.svg.setAttribute("height", this.options.height);
        this.container.appendChild(this.svg);
    }

    drawGrid() {
        const centerX = this.options.width / 2;
        const centerY = this.options.height / 2;

        // Draw the circular grid
        for (let level = 0; level < this.options.levels; level++) {
            const levelRadius = (this.radius / this.options.levels) * (level + 1);
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", centerX);
            circle.setAttribute("cy", centerY);
            circle.setAttribute("r", levelRadius);
            circle.setAttribute("stroke", "#ccc");
            circle.setAttribute("fill", "none");
            this.svg.appendChild(circle);
        }

        // Draw the axes
        for (let i = 0; i < this.data.length; i++) {
            const angle = this.angleSlice * i - Math.PI;
            const x = centerX + Math.cos(Math.PI / 2 - angle) * this.radius;
            const y = centerY + Math.sin(Math.PI / 2 - angle) * this.radius;

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", centerX);
            line.setAttribute("y1", centerY);
            line.setAttribute("x2", x);
            line.setAttribute("y2", y);
            line.setAttribute("stroke", "#ccc");
            this.svg.appendChild(line);
        }
    }

    drawData() {
        const centerX = this.options.width / 2;
        const centerY = this.options.height / 2;
        const points = [];

        for (let i = 0; i < this.data.length; i++) {
            const value = this.data[i].value;
            const angle = this.angleSlice * i - Math.PI / 2;
            const x = centerX + Math.cos(angle) * (value / this.options.maxValue) * this.radius;
            const y = centerY + Math.sin(angle) * (value / this.options.maxValue) * this.radius;
            points.push(`${x},${y}`);
        }

        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", points.join(" "));
        polygon.setAttribute("stroke", "blue");
        polygon.setAttribute("fill", "rgba(0, 0, 255, 0.2)");
        this.svg.appendChild(polygon);
    }
}