import { initCameraCoverageUtils } from './camera-coverage-utils.js';

export function addCameraCoverageTriangle(fabricCanvas, cameraIcon) {
    const baseRadius = 100;
    let radius = baseRadius;
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

    const leftResizeIcon = new fabric.Circle({
        radius: 5,
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
        radius: 5,
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

    function updateCoveragePosition(angleDegrees, scale = 1, width = coverageArea.width) {
        const camCenter = cameraIcon.getCenterPoint();
        const angleRad = fabric.util.degreesToRadians(angleDegrees);

        const scaledRadius = 100 * scale;
        const offsetX = Math.cos(angleRad) * scaledRadius;
        const offsetY = Math.sin(angleRad) * scaledRadius;

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

        const iconOffset = 100 * scale;
        cameraIcon.rotationIcon.set({
            left: triangleCenter.x + Math.cos(angleRad) * iconOffset,
            top: triangleCenter.y + Math.sin(angleRad) * iconOffset,
        });

        const leftBaseCorner = coverageArea.getPointByOrigin('left', 'bottom');
        const rightBaseCorner = coverageArea.getPointByOrigin('right', 'bottom');

        cameraIcon.leftResizeIcon.set({
            left: leftBaseCorner.x,
            top: leftBaseCorner.y,
        });

        cameraIcon.rightResizeIcon.set({
            left: rightBaseCorner.x,
            top: rightBaseCorner.y,
        });

        coverageArea.setCoords();
        cameraIcon.rotationIcon.setCoords();
        cameraIcon.leftResizeIcon.setCoords();
        cameraIcon.rightResizeIcon.setCoords();
        fabricCanvas.requestRenderAll();
    }

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

    function onMouseMove(opt) {
        if (!isResizing) return false;

        opt.e.preventDefault();
        const pointer = fabricCanvas.getPointer(opt.e);
        const camCenter = cameraIcon.getCenterPoint();
        const dx = pointer.x - camCenter.x;
        const dy = pointer.y - camCenter.y;
        const angleRad = fabric.util.degreesToRadians(coverageArea.angle - 270);
        const projectedDistance = dx * Math.cos(angleRad + Math.PI / 2) + dy * Math.sin(angleRad + Math.PI / 2);
        let newWidth = baseRadius + projectedDistance * 2;
        newWidth = Math.max(50, Math.min(300, newWidth));

        const currentAngle = coverageArea.angle - 270;
        const currentScale = coverageArea.scaleX;
        updateCoveragePosition(currentAngle, currentScale, newWidth);
        return true;
    }

    function onMouseUp() {
        isResizing = false;
        resizingSide = null;
    }

    return initCameraCoverageUtils({
        fabricCanvas,
        cameraIcon,
        coverageArea,
        updateCoveragePosition,
        angleOffset: 270,
        additionalIcons: [
            { name: 'leftResizeIcon', element: leftResizeIcon },
            { name: 'rightResizeIcon', element: rightResizeIcon }
        ],
        onMouseMove,
        onMouseUp
    });
}