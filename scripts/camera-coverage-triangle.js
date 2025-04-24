export function addCameraCoverageTriangle(fabricCanvas, cameraIcon) {
    const baseRadius = 100;
    let radius = baseRadius;
    let isRotating = false;
    let isDragging = false;
    let isResizing = false;
    let resizingSide = null;

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
        width: baseRadius,
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

    fabric.Image.fromURL('./images/rotate-icon.png', (rotateImg) => {
        const rotationIcon = rotateImg.set({
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
            visible: false,
        });

        const leftResizeIcon = new fabric.Circle({
            radius: 8,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 1,
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false,
            selectable: false,
            hoverCursor: 'ew-resize',
            lockRotation: true,
            visible: false,
        });

        const rightResizeIcon = new fabric.Circle({
            radius: 8,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 1,
            originX: 'center',
            originY: 'center',
            hasControls: false,
            hasBorders: false,
            selectable: false,
            hoverCursor: 'ew-resize',
            lockRotation: true,
            visible: false,
        });

        cameraIcon.coverageArea = coverageArea;
        cameraIcon.rotationIcon = rotationIcon;
        cameraIcon.leftResizeIcon = leftResizeIcon;
        cameraIcon.rightResizeIcon = rightResizeIcon;

        function updateCoveragePosition(angleDegrees, scale = 1, width = baseRadius) {
            const camCenter = cameraIcon.getCenterPoint();
            const angleRad = fabric.util.degreesToRadians(angleDegrees);

            const offsetX = Math.cos(angleRad) * radius;
            const offsetY = Math.sin(angleRad) * radius;

            const triangleCenter = {
                x: camCenter.x + offsetX,
                y: camCenter.y + offsetY,
            };

            coverageArea.set({
                left: triangleCenter.x,
                top: triangleCenter.y,
                angle: angleDegrees + 270,
                scaleX: scale,
                scaleY: scale,
                width: width,
            });

            rotationIcon.set({
                left: triangleCenter.x + Math.cos(angleRad) * radius,
                top: triangleCenter.y + Math.sin(angleRad) * radius,
            });

            coverageArea.setCoords();

            const leftBaseCorner = coverageArea.getPointByOrigin('left', 'bottom');
            const rightBaseCorner = coverageArea.getPointByOrigin('right', 'bottom');

            leftResizeIcon.set({
                left: leftBaseCorner.x,
                top: leftBaseCorner.y,
            });

            rightResizeIcon.set({
                left: rightBaseCorner.x,
                top: rightBaseCorner.y,
            });

            leftResizeIcon.setCoords();
            rightResizeIcon.setCoords();
            rotationIcon.setCoords();

            fabricCanvas.requestRenderAll();
        }

        updateCoveragePosition(0);

        cameraIcon.on('mousedown', () => {
            isDragging = true;
            rotationIcon.set({ visible: true });
            leftResizeIcon.set({ visible: true });
            rightResizeIcon.set({ visible: true });
            fabricCanvas.requestRenderAll();
        });

        cameraIcon.on('moving', () => {
            isDragging = true;
            const currentAngle = coverageArea.angle - 270;
            const currentScale = coverageArea.scaleX;
            const currentWidth = coverageArea.width;
            updateCoveragePosition(currentAngle, currentScale, currentWidth);
        });

        cameraIcon.on('mouseup', () => {
            isDragging = false;
            fabricCanvas.setActiveObject(cameraIcon);
        });

        cameraIcon.on('removed', () => {
            fabricCanvas.remove(coverageArea);
            fabricCanvas.remove(rotationIcon);
            fabricCanvas.remove(leftResizeIcon);
            fabricCanvas.remove(rightResizeIcon);
        });

        cameraIcon.on('selected', () => {
            rotationIcon.set({ visible: true });
            leftResizeIcon.set({ visible: true });
            rightResizeIcon.set({ visible: true });
            fabricCanvas.requestRenderAll();
        });

        cameraIcon.on('deselected', () => {
            if (!isDragging && !isRotating && !isResizing) {
                rotationIcon.set({ visible: false });
                leftResizeIcon.set({ visible: false });
                rightResizeIcon.set({ visible: false });
                fabricCanvas.requestRenderAll();
            }
        });

        rotationIcon.on('mousedown', (opt) => {
            isRotating = true;
            fabricCanvas.setActiveObject(cameraIcon);
            fabricCanvas.selection = false;
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });

        leftResizeIcon.on('mousedown', (opt) => {
            isResizing = true;
            resizingSide = 'left';
            fabricCanvas.setActiveObject(cameraIcon);
            fabricCanvas.selection = false;
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });

        rightResizeIcon.on('mousedown', (opt) => {
            isResizing = true;
            resizingSide = 'right';
            fabricCanvas.setActiveObject(cameraIcon);
            fabricCanvas.selection = false;
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });

        fabricCanvas.on('mouse:up', () => {
            isRotating = false;
            isDragging = false;
            isResizing = false;
            resizingSide = null;
            fabricCanvas.selection = true;

            const active = fabricCanvas.getActiveObject() === cameraIcon;
            rotationIcon.set({ visible: active });
            leftResizeIcon.set({ visible: active });
            rightResizeIcon.set({ visible: active });

            fabricCanvas.requestRenderAll();
        });

        fabricCanvas.on('mouse:move', (opt) => {
            if (!isRotating && !isDragging && !isResizing) return;

            opt.e.preventDefault();
            const pointer = fabricCanvas.getPointer(opt.e);
            const camCenter = cameraIcon.getCenterPoint();

            if (isRotating) {
                const dx = pointer.x - camCenter.x;
                const dy = pointer.y - camCenter.y;
                const angleRad = Math.atan2(dy, dx);
                const angleDeg = fabric.util.radiansToDegrees(angleRad);

                const distance = Math.sqrt(dx * dx + dy * dy);
                const sensitivity = 0.006;
                const scaleDelta = (distance - baseRadius) * sensitivity;
                const newScale = Math.max(0.5, Math.min(2, 1 + scaleDelta));

                radius = baseRadius * newScale;
                updateCoveragePosition(angleDeg, newScale, coverageArea.width);
            } else if (isDragging) {
                const currentAngle = coverageArea.angle - 270;
                const currentScale = coverageArea.scaleX;
                const currentWidth = coverageArea.width;
                updateCoveragePosition(currentAngle, currentScale, currentWidth);
            } else if (isResizing) {
                const dx = pointer.x - camCenter.x;
                const dy = pointer.y - camCenter.y;
                const angleRad = fabric.util.degreesToRadians(coverageArea.angle - 270);
                const projectedDistance = dx * Math.cos(angleRad + Math.PI / 2) + dy * Math.sin(angleRad + Math.PI / 2);
                let newWidth = baseRadius + projectedDistance * 2;
                newWidth = Math.max(50, Math.min(300, newWidth));

                const currentAngle = coverageArea.angle - 270;
                const currentScale = coverageArea.scaleX;
                updateCoveragePosition(currentAngle, currentScale, newWidth);
            }
        });

        fabricCanvas.add(coverageArea);
        fabricCanvas.add(rotationIcon);
        fabricCanvas.add(leftResizeIcon);
        fabricCanvas.add(rightResizeIcon);

        const camIndex = fabricCanvas.getObjects().indexOf(cameraIcon);
        if (camIndex !== -1) {
            fabricCanvas.insertAt(coverageArea, camIndex);
        }

        cameraIcon.bringToFront();
        rotationIcon.bringToFront();
        leftResizeIcon.bringToFront();
        rightResizeIcon.bringToFront();

        fabricCanvas.setActiveObject(cameraIcon);
        rotationIcon.set({ visible: true });
        leftResizeIcon.set({ visible: true });
        rightResizeIcon.set({ visible: true });
        fabricCanvas.requestRenderAll();
    });

    return coverageArea;
}
