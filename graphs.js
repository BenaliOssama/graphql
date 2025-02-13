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

export function createSpiderWebSkillsChart(unfilteredData) {
    // filter data removing dublicates and choosing the top skill
    // order data from largest to smallest
    let data = filterSkillsData(unfilteredData)
    if (data.length < 2){
        console.log("you don't have enough skills data to be displayed")
        throw error("you don't have enough skills data to be displayed")
    }
    // Create an instance of the SpiderWebChart , configuration of it
    const spiderWebChart = new SpiderWebChart('chart-container', data, {
        width: 500,
        height: 500,
        levels: 10,
        maxValue: 100,
        radius : 200
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