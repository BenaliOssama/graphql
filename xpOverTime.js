import { createSvg } from "./utils.js"

/*______________________________xp over time____________________________*/
export function createXpOverTimeChart(transactions, cohortInfo, xMonths) {
    // add the start day and today
    transactions = addStartEnd(transactions, cohortInfo, xMonths)

    // Define margins
    const margin = { left: 50, right: 50, top: 20, bottom: 30 };
    const svg = Path.makePathBody(margin)

    // Process and sort transactions
    // Calculate cumulative XP
    const dataPoints = getDataPoints(transactions, xMonths)

    console.log('dataPoints', dataPoints)


    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // In your chart code:
    const maxY = roundUpToNearestPowerOfTen(dataPoints[dataPoints.length - 1].cumulative);

    const maxX = new Date(); // Get the current date and time
    const minX = new Date(maxX); // Copy maxX date
    minX.setMonth(maxX.getMonth() - xMonths); // Subtract x months from maxX to get minX

    const timeRange = maxX - minX;

    const path = Path.drawPath(dataPoints, margin, minX, maxX)
    svg.appendChild(path);

    // Create 10 Y-axis labels
    for (let i = 0; i <= 10; i++) {
        const value = Math.pow(maxY / 10, 1) * i;
        //const y = 400 - margin.bottom - (value / maxY) * height;
        const y = 400 - margin.bottom - (Math.sqrt(value) / Math.sqrt(maxY)) * height;

        const yText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yText.setAttribute('x', margin.left - 10);
        yText.setAttribute('y', y);
        yText.setAttribute('text-anchor', 'end');
        yText.setAttribute('dominant-baseline', 'middle');
        yText.setAttribute('font-size', '10px');
        yText.textContent = Math.round(value).toLocaleString();
        svg.appendChild(yText);
    }

    //Create 10 X-axis labels
    for (let i = 0; i <= 6; i++) {
        const date = new Date(minX.getTime() + (timeRange / 6) * i);
        const x = margin.left + (width / 5) * i;

        svg.appendChild(Path.createDot(x, 400 - margin.bottom, 3, '#333'));

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', 400 - 10);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '10px');
        text.textContent = date.toISOString().slice(0, 10);
        svg.appendChild(text);
    }
    document.getElementById('xpOverTime').appendChild(svg);
    // Update function
    function update() {
        document.getElementById('monthsSelect').removeEventListener('change', update);
        // Remove the previous svg element if it exists
        const svgElement = document.getElementById('xpOverTime').querySelector('svg');
        if (svgElement) {
            svgElement.remove();
        }

        // Append the new svg based on the selected value
        const x = parseInt(monthsSelect.value);
        createXpOverTimeChart(transactions, cohortInfo, x);
        //document.getElementById('xpOverTime').appendChild(newSvg);
    }

    // Add event listener to the select element to update the chart
    document.getElementById('monthsSelect').addEventListener('change', update);

}


function getLastXMonthsTransactions(transactions, months) {
    const now = new Date();
    const cutoffDate = new Date();
    if (months == 'all') {
        return transactions
            .map(t => ({ ...t, createdAt: new Date(t.createdAt) })) // Ensure Date objects
            .sort((a, b) => a.createdAt - b.createdAt) // Sort by date

    }
    cutoffDate.setMonth(now.getMonth() - months); // Move back X months

    return transactions
        .map(t => ({ ...t, createdAt: new Date(t.createdAt) })) // Ensure Date objects
        .sort((a, b) => a.createdAt - b.createdAt) // Sort by date
        .filter(t => t.createdAt >= cutoffDate); // Keep only recent ones
}



function addStartEnd(transactions, cohortInfo) {
    const now = new Date();
    const isoString = now.toISOString();

    transactions.push({ path: "start", amount: 0, createdAt: cohortInfo.startAt })
    transactions.push({ path: "end", amount: 0, createdAt: isoString })
    return transactions
}

function getDataPoints(transactions, xMonths) {
    // Process and sort transactions
    const processed = getLastXMonthsTransactions(transactions, xMonths)
    console.log('processed', processed)
    // Calculate cumulative XP
    let cumulative = 0;
    const dataPoints = processed.map(t => {
        cumulative += t.amount;
        return { date: t.createdAt, cumulative };
    });
    return dataPoints
}

function roundUpToNearestPowerOfTen(num) {
    const length = Math.floor(Math.log10(num)); // Find the number of digits minus 1
    const factor = Math.pow(10, length); // Get 10^length
    return Math.ceil(num / factor) * factor; // Round up to the nearest multiple of 10^length
}



class Path {
    static makePathBody(margin) {
        const svg = createSvg('svg', { width: '100%', height: '100%', viewBox: `0 0 ${600} ${400}`, preserveAspectRation: 'xMidYMid meet' });
        // Create the xAxis
        const xAxis = createSvg('line', {
            x1: margin.left,
            y1: 400 - margin.bottom,
            x2: 600 - margin.right,
            y2: 400 - margin.bottom,
            stroke: '#333'
        });
        svg.appendChild(xAxis);

        // Create the yAxis
        const yAxis = createSvg('line', {
            x1: margin.left,
            y1: margin.top,
            x2: margin.left,
            y2: 400 - margin.bottom,
            stroke: '#333'
        });
        svg.appendChild(yAxis);
        return svg
    }
    static drawPath(dataPoints, margin, from, to) {
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create line path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        console.log('dataPoints befor pop', dataPoints[dataPoints.length - 1])
        const start = dataPoints.pop();
        console.log('dataPoints after pop', dataPoints[dataPoints.length - 1])
        const x = margin.left;
        const y = 400 - margin.bottom 

        let pathData = `M ${x} ${y}`;

        dataPoints.forEach((point, i) => {
            const x = margin.left +
                ((point.date - from) / // time since the first date
                    (to - from) * width); // distance between the first and the last
            const y = 400 - margin.bottom -
                Math.sqrt(point.cumulative / dataPoints[dataPoints.length - 1].cumulative) * height;

            pathData += ` H ${x} V ${y}`;
        });

        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#4a90e2');
        path.setAttribute('stroke-width', '2');
        return path
    }
    static createDot(x, y, radius = 3, color = '#333') {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        dot.setAttribute('r', radius);
        dot.setAttribute('fill', color);
        return dot;
    }
}