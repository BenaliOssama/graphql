export function createSvg(type, setAttributes) {
    const shape = document.createElementNS('http://www.w3.org/2000/svg', type);

    // Assuming setAttributes is an object of attributes
    Object.entries(setAttributes).forEach(([attr, value]) => {
        shape.setAttribute(attr, value);
    });

    return shape;
}

export function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}