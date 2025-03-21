export function createSvg(type, setAttributes) {
    const shape = document.createElementNS('http://www.w3.org/2000/svg', type);

    // Assuming setAttributes is an object of attributes
    Object.entries(setAttributes).forEach(([attr, value]) => {
        shape.setAttribute(attr, value);
    });

    return shape;
}

export function formatBytes(bytes, fix = 1, accurate = false) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    if (!accurate) {
        return (bytes / Math.pow(1000, i)).toFixed(fix) + ' ' + sizes[i];
    }
    return (bytes / Math.pow(1024, i)).toFixed(fix) + ' ' + sizes[i];
}

export function navigator(route) {
    // null , null, /home
    history.replaceState(null, null, route); // pushState --> 
    window.dispatchEvent(new PopStateEvent('popstate')); 
}