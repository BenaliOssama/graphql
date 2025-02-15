import { SpiderWebChart } from "./spiderweb.js";

/*______________________________xp over time____________________________*/
export function createXpOverTimeChart(transactions) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    // width="100%" height="100%": Ensures the SVG takes up the available space.
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    // viewBox="0 0 400 210": Defines the coordinate system for the SVG, making it scale properly.
    svg.setAttribute('viewBox', `0 0 ${600} ${400}`);
    // preserveAspectRatio="xMidYMid meet": Maintains aspect ratio while centering the content.
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Process and sort transactions
    const processed = transactions
        .map(t => ({ ...t, createdAt: new Date(t.createdAt) }))
        .sort((a, b) => a.createdAt - b.createdAt);

    // Calculate cumulative XP
    let cumulative = 0;
    const dataPoints = processed.map(t => {
        cumulative += t.amount;
        return { date: t.createdAt, cumulative };
    });

    // Chart dimensions
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create axes
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', margin.left);
    xAxis.setAttribute('y1', 400 - margin.bottom);
    xAxis.setAttribute('x2', 600 - margin.right);
    xAxis.setAttribute('y2', 400 - margin.bottom);
    xAxis.setAttribute('stroke', '#333');
    svg.appendChild(xAxis);

    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', margin.left);
    yAxis.setAttribute('y1', margin.top);
    yAxis.setAttribute('x2', margin.left);
    yAxis.setAttribute('y2', 400 - margin.bottom);
    yAxis.setAttribute('stroke', '#333');
    svg.appendChild(yAxis);

    // Create line path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let pathData = '';

    dataPoints.forEach((point, i) => {
        const x = margin.left +
            ((point.date - dataPoints[0].date) /
                (dataPoints[dataPoints.length - 1].date - dataPoints[0].date)) * width;
        const y = 400 - margin.bottom -
            (point.cumulative / dataPoints[dataPoints.length - 1].cumulative) * height;

        if (i === 0) {
            pathData = `M ${x} ${y}`;
        } else {
            pathData += ` L ${x} ${y}`;
        }
    });

    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#4a90e2');
    path.setAttribute('stroke-width', '2');
    svg.appendChild(path);

    function roundUpToNearestPowerOfTen(num) {
        const length = Math.floor(Math.log10(num)); // Find the number of digits minus 1
        const factor = Math.pow(10, length); // Get 10^length
        return Math.ceil(num / factor) * factor; // Round up to the nearest multiple of 10^length
    }
    // In your chart code:
    const maxY = roundUpToNearestPowerOfTen(dataPoints[dataPoints.length - 1].cumulative);
    const minX = dataPoints[0].date;
    const maxX = dataPoints[dataPoints.length - 1].date;
    const timeRange = maxX - minX;
    // Create a dot function
    function createDot(x, y, radius = 3, color = '#333') {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        dot.setAttribute('r', radius);
        dot.setAttribute('fill', color);
        return dot;
    }
    // Create 10 Y-axis labels
    for (let i = 0; i <= 10; i++) {
        const value = (maxY / 10) * i;
        const y = 400 - margin.bottom - (value / maxY) * height;

        const yText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yText.setAttribute('x', margin.left - 10);
        yText.setAttribute('y', y);
        yText.setAttribute('text-anchor', 'end');
        yText.setAttribute('dominant-baseline', 'middle');
        yText.setAttribute('font-size', '10px');
        yText.textContent = Math.round(value).toLocaleString();
        svg.appendChild(yText);
    }
    //Add 10 equally spaced dots along x-axis
    const xStart = margin.left;
    const xEnd = 600 - margin.right;
    const xInterval = (xEnd - xStart) / 9;  // Divide the axis into 10 intervals

    for (let i = 0; i <= 10; i++) {
        const x = xStart + i * xInterval;
        svg.appendChild(createDot(x, 400 - margin.bottom, 3, '#333'));
    }
    //Create 10 X-axis labels
    for (let i = 0; i <= 10; i++) {
        const date = new Date(minX.getTime() + (timeRange / 10) * i);
        const x = margin.left + (width / 9) * i;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', 400 - 10);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '10px');
        text.textContent = date.toISOString().slice(0, 10);
        svg.appendChild(text);
    }
    // Add 10 equally spaced dots along y-axis
    const yStart = margin.top;
    const yEnd = 400 - margin.bottom;
    const yInterval = (yEnd - yStart) / 10;  // Divide the axis into 10 intervals

    for (let i = 0; i <= 10; i++) {
        const y = yStart + i * yInterval;
        svg.appendChild(createDot(margin.left, y, 3, '#333'));
    }
    document.getElementById('xpOverTime').appendChild(svg);
}


/*______________________________projects xp____________________________*/
export function createProjectsXpChart(transactions) {
    const container = document.getElementById('projectsXp');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    // Set responsive attributes
    svg.setAttribute('viewBox', `0 0 600 400`);
    svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.maxHeight = '100vh';

    // Aggregate XP per project
    const projects = {};
    transactions.forEach(t => {
        projects[t.path] = t.amount;
    });

    const projectEntries = Object.entries(projects)
        .sort(([, a], [, b]) => b - a).slice(0, 10);

    // Calculate dynamic dimensions
    const margin = {
        left: 180,
        right: 120,
        top: 30,
        bottom: 30
    };

    // Measure longest project name
    const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const tempText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tempText.textContent = projectEntries.reduce((a, [p]) =>
        p.split('/').pop().length > a.length ? p.split('/').pop() : a, ''
    );
    tempSvg.appendChild(tempText);
    document.body.appendChild(tempSvg);
    const textWidth = tempText.getBBox().width;
    document.body.removeChild(tempSvg);

    // Adjust left margin based on longest text
    margin.left = Math.min(Math.max(textWidth + 20, 180), 300);

    // Calculate bar dimensions
    const barHeight = 28;
    const spacing = 12;
    const chartHeight = margin.top +
        (projectEntries.length * (barHeight + spacing)) +
        margin.bottom;

    // Update viewBox height
    svg.setAttribute('viewBox', `0 0 600 ${chartHeight}`);

    // Create bars
    projectEntries.forEach(([project, amount], i) => {
        const y = margin.top + (i * (barHeight + spacing));
        const maxWidth = 600 - margin.left - margin.right;
        const width = (amount / Math.max(...Object.values(projects))) * maxWidth;

        // Bar element
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', margin.left);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', barHeight);
        rect.setAttribute('fill', '#4a90e2');
        svg.appendChild(rect);

        // Project label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', margin.left - 10);
        text.setAttribute('y', y + barHeight / 2);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '1.2em');
        text.textContent = project.split('/').pop();
        svg.appendChild(text);

        // Amount label
        const amountText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        amountText.setAttribute('x', margin.left + width + 5);
        amountText.setAttribute('y', y + barHeight / 2);
        amountText.setAttribute('dominant-baseline', 'middle');
        amountText.setAttribute('font-size', '1em');
        amountText.textContent = amount.toLocaleString();
        svg.appendChild(amountText);
    });

    container.appendChild(svg);
}
/*______________________________spider web chart____________________________*/
export function createSpiderWebSkillsChart(unfilteredData) {
    // filter data removing dublicates and choosing the top skill
    // order data from largest to smallest
    let data = filterSkillsData(unfilteredData)
    if (data.length < 2) {
        console.log("you don't have enough skills data to be displayed")
        throw error("you don't have enough skills data to be displayed")
    }
    // Create an instance of the SpiderWebChart , configuration of it
    const spiderWebChart = new SpiderWebChart('chart-container', data, {
        width: 500,
        height: 500,
        levels: 10,
        maxValue: 100,
        radius: 200
    });

    spiderWebChart.draw();
}


function filterSkillsData(rawData) {
    let res = {};
    // skill --> object { type = "string", amount = "int" }
    for (let skill of rawData) {
        if (!res[skill.type] || res[skill.type].amount < skill.amount) {
            res[skill.type] = skill.amount;
        }
    }
    let result = [];
    for (let [key, value] of Object.entries(res)) {
        result.push({ label: key, value: value })
    }
    result.sort((a, b) => b.value - a.value)
    if (result.length > 6) {
        result = result.slice(0, 6)
    }
    return result
}