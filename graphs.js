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
    // const data = [
    //     { label: 'Comfort', value: 100 },
    //     { label: 'Reliability', value: 80 },
    //     { label: 'Speed', value: 60 },
    //     { label: 'Safety', value: 40 },
    //     { label: 'Environment', value: 20 },
    //     { label: 'Efficiency', value: 5 },
    //     { label: 'test', value: 11 },
    // ];

    // Create an instance of the SpiderWebChart , configuration of it
    const spiderWebChart = new SpiderWebChart('chart-container', data, {
        width: 400,
        height: 400,
        levels: 10,
        maxValue: 100
    });

    spiderWebChart.draw();
}

function filterSkillsData(rawData){
    let res = {};
    // skill --> object { type = "string", amount = "int" }
    for (let skill of rawData){
        if (!res[skill.type] || res[skill.type].amount < skill.amount) {
            res[skill.type] = skill.amount ; 
        }
    }
    let result = [];
    let last  = 0 ; 
    for (let [key,value] of Object.entries(res)){
       result.push({label : key, value: value})
    }
    result.sort((a,b)=> b.value- a.value)
    result = result.slice(0,6)
    return result
}