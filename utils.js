export function createSvg(type, setAttributes) {
    const shape = document.createElementNS('http://www.w3.org/2000/svg', type);

    // Assuming setAttributes is an object of attributes
    Object.entries(setAttributes).forEach(([attr, value]) => {
        shape.setAttribute(attr, value);
    });

    return shape;
}
