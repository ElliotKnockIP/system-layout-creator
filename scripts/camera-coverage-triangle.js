import { initCameraCoverageUtils } from "./camera-coverage-utils.js";

export function addCameraCoverageTriangle(fabricCanvas, cameraIcon) {
  const baseRadius = 100;

  const coverageArea = new fabric.Triangle({
    fill: new fabric.Gradient({
      type: "linear",
      gradientUnits: "percentage",
      coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
      colorStops: [
        { offset: 0, color: "rgba(255, 0, 0, 0.25)" },
        { offset: 0.5, color: "rgba(255, 165, 0, 0.25)" },
        { offset: 1, color: "rgba(144, 238, 144, 0.25)" },
      ],
    }),
    height: 200,
    width: baseRadius,
    stroke: "black",
    strokeWidth: 1,
    originX: "center",
    originY: "center",
    hasControls: false,
    hasBorders: false,
    selectable: false,
    hoverCursor: "default",
    lockMovementX: true,
    lockMovementY: true,
    lockScalingX: true,
    lockScalingY: true,
    lockSkewingX: true,
    lockSkewingY: true,
  });

  function updateCoveragePosition(angleDegrees, scale = 1) {
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
    });

    const iconOffset = 100 * scale;
    cameraIcon.rotationIcon.set({
      left: triangleCenter.x + Math.cos(angleRad) * iconOffset,
      top: triangleCenter.y + Math.sin(angleRad) * iconOffset,
    });

    coverageArea.setCoords();
    cameraIcon.rotationIcon.setCoords();
    fabricCanvas.requestRenderAll();
  }

  return initCameraCoverageUtils({
    fabricCanvas,
    cameraIcon,
    coverageArea,
    updateCoveragePosition,
    angleOffset: 270,
  });
}
