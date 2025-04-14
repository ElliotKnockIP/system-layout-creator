export function addCameraCoverage(fabricCanvas, cameraIcon) {
    // Define the coverage area as a triangle
    const coverageArea = new fabric.Triangle({
        width: 300, // Width of the coverage area
        height: 300,
        // Height of the coverage area
        fill: new fabric.Gradient({
            type: 'linear',
            gradientUnits: 'percentage', // Use percentage for gradient positioning
            coords: { x1: 0, y1: 0, x2: 0, y2: 1 }, // Vertical gradient
            colorStops: [
            { offset: 0, color: 'red' },
            { offset: 0.7, color: 'orange' },
            { offset: 1, color: 'lightgreen' },
            ],
        }),
        stroke: 'black', // Orange border
        strokeWidth: 2,
        selectable: false, // Coverage area should not be selectable
        evented: false, // Prevent interaction with the coverage area
        originX: 'center',
        originY: 'center',

    });

    // Rotate the camera icon to face downward (adjust based on the icon's default orientation)
    cameraIcon.set({
        angle: 0, // Rotate the camera icon to face the coverage area (adjust this value if the icon's default orientation is different)
    });

    const updateCoveragePosition = () => {
        const iconPos = cameraIcon.getCenterPoint();
        const iconHeight = cameraIcon.getScaledHeight() / 2;
        const offsetDistance = iconHeight + (coverageArea.getScaledHeight() / 2);
    
        const angleRad = fabric.util.degreesToRadians(cameraIcon.angle);
        const offsetX = Math.cos(angleRad) * offsetDistance;
        const offsetY = Math.sin(angleRad) * offsetDistance;
    
        coverageArea.set({
            left: iconPos.x + offsetX,
            top: iconPos.y + offsetY,
            angle: cameraIcon.angle + 270 // or +180 if the triangle needs to flip
        });
    
        fabricCanvas.renderAll();
    };

    // Initial positioning
    updateCoveragePosition();

    // Add the coverage area to the canvas
    fabricCanvas.add(coverageArea);
    fabricCanvas.sendToBack(coverageArea); // Ensure the coverage area is behind the icon

    // Bind the coverage area to the camera icon so they move together
    cameraIcon.on('moving', updateCoveragePosition);
    cameraIcon.on('scaling', updateCoveragePosition);
    cameraIcon.on('rotating', () => {
        coverageArea.set('angle', cameraIcon.angle + 180); // Keep the coverage area 180 degrees relative to the camera icon
        updateCoveragePosition();
    });

    // Remove the coverage area when the camera icon is deleted
    cameraIcon.on('removed', () => {
        fabricCanvas.remove(coverageArea);
    });

    return coverageArea;
}