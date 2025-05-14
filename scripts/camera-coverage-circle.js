import { initCameraCoverageUtils } from "./camera-coverage-utils.js";

export function addCameraCoverageCircle(fabricCanvas, cameraIcon) {
  const coverageArea = new fabric.Circle({
    radius: 100,
    fill: new fabric.Gradient({
      type: "linear",
      gradientUnits: "percentage",
      coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
      colorStops: [{ offset: 1, color: "rgba(163, 255, 226, 0.25)" }],
    }),
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
    const radius = 100 * scale;

    const offsetX = Math.cos(angleRad) * radius;
    const offsetY = Math.sin(angleRad) * radius;

    coverageArea.set({
      left: camCenter.x,
      top: camCenter.y,
      angle: angleDegrees + 90,
      scaleX: scale,
      scaleY: scale,
    });

    cameraIcon.rotationIcon.set({
      left: camCenter.x + offsetX,
      top: camCenter.y + offsetY,
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
    angleOffset: 90,
  });
}
