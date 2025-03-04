import { SpiderWebChart } from "./spiderweb.js";
import { formatBytes } from "./utils.js";


/*______________________________projects xp____________________________*/
export function createProjectsXpChart(transactions) {
    const container = document.getElementById('projectsXp');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    // Set responsive attributes
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
        amountText.textContent = formatBytes(amount, 0);
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


