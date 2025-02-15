import { SpiderWebChart } from "./spiderweb.js";
/*____________________________xp over time_____________________________*/
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

    // Add labels
    dataPoints.forEach((point, i) => {
        if (i % 2 === 0) { // Add labels for every other data point
            const x = margin.left +
                ((point.date - dataPoints[0].date) /
                    (dataPoints[dataPoints.length - 1].date - dataPoints[0].date)) * width;

            // X-axis labels
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', 400 - 10);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '10px');
            text.textContent = point.date.toISOString().slice(0, 10);
            svg.appendChild(text);

            // Y-axis labels
            const yText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            yText.setAttribute('x', margin.left - 10);
            yText.setAttribute('y', 400 - margin.bottom -
                (point.cumulative / dataPoints[dataPoints.length - 1].cumulative) * height);
            yText.setAttribute('text-anchor', 'end');
            yText.setAttribute('dominant-baseline', 'middle');
            yText.setAttribute('font-size', '10px');
            yText.textContent = point.cumulative.toLocaleString();
            svg.appendChild(yText);
        }
    });

    document.getElementById('xpOverTime').appendChild(svg);
}

/*_________________________ projects xp chart _________________________*/
export function createProjectsXpChart(transactions) {
    const container = document.getElementById('projectsXp');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');

    // Aggregate XP per project
    const projects = {};

    transactions.forEach(t => {
        projects[t.path] =  t.amount;
    });

    const projectEntries = Object.entries(projects).sort(([, a], [, b]) => b - a).slice(0, 10);

    // Dynamic sizing
    const calculateDimensions = () => {
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        // Calculate dynamic margins based on text length
        const tempText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tempText.textContent = projectEntries.reduce((longest, [project]) =>
            project.length > longest.length ? project : longest, ''
        ).split('/').pop();
        svg.appendChild(tempText);
        const textWidth = tempText.getBBox().width;
        svg.removeChild(tempText);

        return {
            margin: {
                top: 20,
                right: 20,
                bottom: 40,
                left: textWidth  // Dynamic left margin based on longest text
            },
            barHeight: Math.min(30, containerHeight * 0.05),
            spacing: 10,
            containerWidth,
            containerHeight
        };
    };
    const drawChart = () => {
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        const { margin, barHeight, spacing, containerWidth, containerHeight } = calculateDimensions();
        const maxAmount = Math.max(...Object.values(projects));
        const chartHeight = projectEntries.length * (barHeight + spacing) + margin.top;

        // Set viewBox dynamically
        svg.setAttribute('viewBox', `0 0 ${containerWidth} ${Math.max(chartHeight, containerHeight)}`);

        // Create bars
        projectEntries.forEach(([project, amount], i) => {
            const y = margin.top + (i * (barHeight + spacing));
            const width = (amount / maxAmount) * (containerWidth - margin.left - margin.right );

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
            text.setAttribute('font-size', `${Math.min(14, barHeight * 0.8)}px`);
            text.textContent = project.split('/').pop();
            svg.appendChild(text);

            // Amount label
            const amountText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            amountText.setAttribute('x', margin.left + width + 5);
            amountText.setAttribute('y', y + barHeight / 2);
            amountText.setAttribute('dominant-baseline', 'middle');
            amountText.setAttribute('font-size', `${Math.min(12, barHeight * 0.7)}px`);
            amountText.textContent = amount.toLocaleString();
            svg.appendChild(amountText);
        });
    };

    // Initial draw
    drawChart();

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
        drawChart();
    });
    resizeObserver.observe(container);

    container.appendChild(svg);
}


/*________________________________ spiderWeb chart ____________________________*/
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