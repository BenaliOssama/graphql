export class SpiderWebChart {
    constructor(containerId, data, options = {}, radius) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.outerCircle = 25,
            this.options = {
                width: 500,
                height: 500,
                levels: 5,
                maxValue: 10,
                ...options
            };
        this.svg = null;
        this.radius = options.radius || Math.min(this.options.width, this.options.height) / 2;
        this.angleSlice = (Math.PI * 2) / this.data.length;
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
        // viewBox = "minX minY width height" ensures scaling.
        // preserveAspectRatio = "xMidYMid meet" keeps proportions.
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", "0 0 500 500");
        this.svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
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

            const xt = centerX + Math.cos(Math.PI / 2 - angle) * (this.radius + this.outerCircle);
            const yt = centerY + Math.sin(Math.PI / 2 - angle) * (this.radius + this.outerCircle);

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", centerX);
            line.setAttribute("y1", centerY);
            line.setAttribute("x2", x);
            line.setAttribute("y2", y);
            line.setAttribute("stroke", "#ccc");
            this.svg.appendChild(line);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", xt);
            text.setAttribute("y", yt);
            //text-anchor="middle" fill="red" font-size="30"
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("fill", "black");
            //text.setAttribute("font-size", "30");
            text.innerHTML = this.data[i].label.split('_')[1];
            this.svg.appendChild(text);
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