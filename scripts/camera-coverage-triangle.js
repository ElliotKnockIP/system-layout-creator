export function addCameraCoverageTriangle(fabricCanvas, cameraIcon) {
    const baseRadius = 100;
    let radius = baseRadius;
    let isRotating = false; // Tracks rotation interaction
    let isDragging = false; // Tracks camera dragging

    const coverageArea = new fabric.Triangle({
        fill: new fabric.Gradient({
            type: 'linear',
            gradientUnits: 'percentage',
            coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
            colorStops: [
                { offset: 0, color: 'rgba(255, 0, 0, 0.25)' },
                { offset: 0.5, color: 'rgba(255, 165, 0, 0.25)' },
                { offset: 1, color: 'rgba(144, 238, 144, 0.25)' },
            ],
        }),
        height: 200,
        width: 100,
        stroke: 'black',
        strokeWidth: 1,
        originX: 'center',
        originY: 'center',
        hasControls: false,
        hasBorders: false,
        selectable: false,
        hoverCursor: 'default',
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockSkewingX: true,
        lockSkewingY: true,
    });

    fabric.Image.fromURL('./images/rotate-icon.png', (img) => {
        const rotationIcon = img.set({
            scaleX: 0.03,
            scaleY: 0.03,
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false,
            selectable: false,
            hoverCursor: 'pointer',
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            evented: true,
            visible: false, // Initially hidden
        });

        cameraIcon.coverageArea = coverageArea;
        cameraIcon.rotationIcon = rotationIcon;

        function updateCoveragePosition(angleDegrees, scale = 1) {
            const camCenter = cameraIcon.getCenterPoint();
            const angleRad = fabric.util.degreesToRadians(angleDegrees);

            const offsetX = Math.cos(angleRad) * radius;
            const offsetY = Math.sin(angleRad) * radius;

            coverageArea.set({
                left: camCenter.x + offsetX,
                top: camCenter.y + offsetY,
                angle: angleDegrees + 270,
                scaleX: scale,
                scaleY: scale,
            });

            const iconOffset = 0;
            rotationIcon.set({
                left: camCenter.x + offsetX + Math.cos(angleRad) * (radius + iconOffset),
                top: camCenter.y + offsetY + Math.sin(angleRad) * (radius + iconOffset),
            });

            coverageArea.setCoords();
            rotationIcon.setCoords();
            fabricCanvas.requestRenderAll();
        }

        updateCoveragePosition(0);

        cameraIcon.on('mousedown', () => {
            isDragging = true; // Start dragging
            rotationIcon.set({ visible: true }); // Show rotation icon
            fabricCanvas.requestRenderAll();
        });

        cameraIcon.on('moving', () => {
            isDragging = true; // Continue dragging
            rotationIcon.set({ visible: true }); // Keep rotation icon visible
            const currentAngle = coverageArea.angle - 90; // Maintain current angle
            const currentScale = coverageArea.scaleX;
            updateCoveragePosition(currentAngle, currentScale); // Update position only
            fabricCanvas.requestRenderAll();
        });

        cameraIcon.on('mouseup', () => {
            isDragging = false; // End dragging
            fabricCanvas.setActiveObject(cameraIcon); // Ensure camera stays selected
            rotationIcon.set({ visible: true }); // Keep rotation icon visible
            fabricCanvas.requestRenderAll();
        });

        cameraIcon.on('removed', () => {
            if (cameraIcon.coverageArea) {
                fabricCanvas.remove(cameraIcon.coverageArea);
            }
            if (cameraIcon.rotationIcon) {
                fabricCanvas.remove(cameraIcon.rotationIcon);
            }
        });

        // Show rotation icon when camera is selected
        cameraIcon.on('selected', () => {
            rotationIcon.set({ visible: true });
            fabricCanvas.requestRenderAll();
        });

        // Hide rotation icon when camera is deselected
        cameraIcon.on('deselected', () => {
            if (!isDragging && !isRotating) { // Only hide if not interacting
                rotationIcon.set({ visible: false });
                fabricCanvas.requestRenderAll();
            }
        });

        rotationIcon.on('mousedown', (opt) => {
            isRotating = true; // Start rotation
            fabricCanvas.setActiveObject(cameraIcon); // Keep camera selected
            fabricCanvas.selection = false;
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });

        fabricCanvas.on('mouse:up', () => {
            isRotating = false; // End rotation
            isDragging = false; // End dragging
            fabricCanvas.selection = true;
            if (fabricCanvas.getActiveObject() === cameraIcon) {
                rotationIcon.set({ visible: true }); // Keep visible if camera selected
            } else {
                rotationIcon.set({ visible: false }); // Hide if camera not selected
            }
            fabricCanvas.requestRenderAll();
        });

        fabricCanvas.on('mouse:move', (opt) => {
            if (!isRotating && !isDragging) return;

            opt.e.preventDefault();
            const pointer = fabricCanvas.getPointer(opt.e);
            const camCenter = cameraIcon.getCenterPoint();

            if (isRotating) {
                const dx = pointer.x - camCenter.x;
                const dy = pointer.y - camCenter.y;

                const angleRad = Math.atan2(dy, dx);
                const angleDeg = fabric.util.radiansToDegrees(angleRad);

                const distance = Math.sqrt(dx * dx + dy * dy);

                const sensitivity = 0.004;
                const scaleDelta = (distance - baseRadius) * sensitivity;
                let newScale = Math.max(0.5, Math.min(2, 1 + scaleDelta));

                radius = baseRadius * newScale;

                updateCoveragePosition(angleDeg, newScale);
            } else if (isDragging) {
                // When dragging, maintain current angle and scale
                const currentAngle = coverageArea.angle - 90;
                const currentScale = coverageArea.scaleX;
                updateCoveragePosition(currentAngle, currentScale);
            }
        });

        // Add elements to canvas
        fabricCanvas.add(coverageArea);
        fabricCanvas.add(rotationIcon);

        // Reorder objects: place coverageArea just below its own cameraIcon
        const camIndex = fabricCanvas.getObjects().indexOf(cameraIcon);
        if (camIndex !== -1) {
            fabricCanvas.insertAt(coverageArea, camIndex);
        }

        cameraIcon.bringToFront();
        rotationIcon.bringToFront();

        // Ensure camera is selected and rotation icon is visible after adding
        fabricCanvas.setActiveObject(cameraIcon);
        rotationIcon.set({ visible: true });
        fabricCanvas.requestRenderAll();
    });

    return coverageArea;
}