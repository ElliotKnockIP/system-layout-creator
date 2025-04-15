export function addCameraCoverage(fabricCanvas, cameraIcon) {
    // Define the coverage shape: flat bottom, widening top
    const coverageArea = new fabric.Polygon([
        { x: 20, y: 0 },       // bottom-left (at camera)
        { x: 40, y: 0 },      // bottom-right
        { x: 120, y: -200 },  // top-right (farthest point)
        { x: -60, y: -200 },  // top-left
    ], {
        fill: new fabric.Gradient({
            type: 'linear',
            gradientUnits: 'percentage',
            coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
            colorStops: [
                { offset: 1, color: 'rgba(255, 0, 0, 0.5)' },
                { offset: 0.5, color: 'rgba(255, 165, 0, 0.5)' },
                { offset: 0, color: 'rgba(144, 238, 144, 0.5)' },
            ],
        }),
        stroke: 'black',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        originX: 'center',  // Anchor to top-left
        originY: 'bottom',
    });

    cameraIcon.set({ angle: 0 });

    const updateCoveragePosition = () => {
        const iconPos = cameraIcon.getCenterPoint();
        const iconHeight = cameraIcon.getScaledHeight() / 2;

        // Offset so the polygon starts just below the camera icon
        const offsetDistance = iconHeight + 20;

        const angleRad = fabric.util.degreesToRadians(cameraIcon.angle);
        const offsetX = Math.cos(angleRad) * offsetDistance;
        const offsetY = Math.sin(angleRad) * offsetDistance;

        coverageArea.set({
            left: iconPos.x + offsetX,
            top: iconPos.y + offsetY,
            angle: cameraIcon.angle + 90
        });

        fabricCanvas.renderAll();
    };

    updateCoveragePosition();
    fabricCanvas.add(coverageArea);

    cameraIcon.on('moving', updateCoveragePosition);
    cameraIcon.on('scaling', updateCoveragePosition);
    cameraIcon.on('rotating', () => {
        coverageArea.set('angle', cameraIcon.angle);
        updateCoveragePosition();
    });

    cameraIcon.on('removed', () => {
        fabricCanvas.remove(coverageArea);
    });

    return coverageArea;
}
