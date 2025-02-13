import { SpiderWebChart } from "./spiderweb.js";

export function createXpOverTimeChart(transactions) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '600');
    svg.setAttribute('height', '400');
    
    // Add implementation for line chart
    // (Calculate positions, create path elements, axes, etc.)
    
    document.getElementById('xpOverTime').appendChild(svg);
}

export function createProjectsXpChart(transactions) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '600');
    svg.setAttribute('height', '400');
    
    // Add implementation for bar chart
    // (Calculate bar positions, create rect elements, labels, etc.)
    
    document.getElementById('projectsXp').appendChild(svg);
}

export function createSpiderWebSkillsChart(data) {
    // Create an instance of the SpiderWebChart
    const spiderWebChart = new SpiderWebChart('chart-container', data, {
        width: 400,
        height: 400,
        levels: 10,
        maxValue: 100
    });

    spiderWebChart.draw();
}