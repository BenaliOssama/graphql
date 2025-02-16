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

    const path = Path.drawPath(dataPoints, margin)
    svg.appendChild(path);

    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // In your chart code:
    const maxY = roundUpToNearestPowerOfTen(dataPoints[dataPoints.length - 1].cumulative);
    const minX = dataPoints[0].date;
    const maxX = dataPoints[dataPoints.length - 1].date;
    const timeRange = maxX - minX;

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
    // //Add 10 equally spaced dots along x-axis
    // const xStart = margin.left;
    // const xEnd = 600 - margin.right;
    // const xInterval = (xEnd - xStart) / xMonths;  // Divide the axis into 10 intervals

    // for (let i = 0; i <= 10; i++) {
    //     const x = xStart + i * xInterval;
    //     svg.appendChild(Path.createDot(x, 400 - margin.bottom, 3, '#333'));
    // }
    // //Create 10 X-axis labels
    // for (let i = 0; i <= 10; i++) {
    //     const date = new Date(minX.getTime() + (timeRange / 10) * i);
    //     const x = margin.left + (width / 9) * i;

    //     const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    //     text.setAttribute('x', x);
    //     text.setAttribute('y', 400 - 10);
    //     text.setAttribute('text-anchor', 'middle');
    //     text.setAttribute('font-size', '10px');
    //     text.textContent = date.toISOString().slice(0, 10);
    //     svg.appendChild(text);
    // }
    // // Add 10 equally spaced dots along y-axis
    // const yStart = margin.top;
    // const yEnd = 400 - margin.bottom;
    // const yInterval = (yEnd - yStart) / 10;  // Divide the axis into 10 intervals

    // for (let i = 0; i <= 10; i++) {
    //     const y = yStart + i * yInterval;
    //     svg.appendChild(createDot(margin.left, y, 3, '#333'));
    // }
    document.getElementById('xpOverTime').appendChild(svg);
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
    static drawPath(dataPoints, margin) {
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create line path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathData = '';
        dataPoints.forEach((point, i) => {
            const x = margin.left +
                ((point.date - dataPoints[0].date) / // time since the first date
                    (dataPoints[dataPoints.length - 1].date - dataPoints[0].date)) * width; // distance between the first and the last
            const y = 400 - margin.bottom -
                Math.sqrt(point.cumulative / dataPoints[dataPoints.length - 1].cumulative) * height;

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