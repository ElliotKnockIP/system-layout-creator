export function initCameraCoverageUtils({ fabricCanvas, cameraIcon, coverageArea, updateCoveragePosition, angleOffset = 90, additionalIcons = [], onMouseMove, onMouseUp }) {
  const baseRadius = 50; // Reduced from 100 to match smaller icon scale
  let isRotating = false;
  let isDragging = false;
  let initialRotationDistance = null;
  let baseScale = 1;

  fabric.Image.fromURL("./images/rotate-icon.png", (img) => {
    const rotationIcon = img.set({
      scaleX: 0.02,
      scaleY: 0.02,
      originX: "center",
      originY: "center",
      hasControls: false,
      hasBorders: false,
      selectable: false,
      hoverCursor: "pointer",
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      evented: true,
      visible: false,
    });

    cameraIcon.coverageArea = coverageArea;
    cameraIcon.rotationIcon = rotationIcon;
    additionalIcons.forEach((icon) => {
      cameraIcon[icon.name] = icon.element;
    });

    cameraIcon.on("mousedown", () => {
      isDragging = true;
      rotationIcon.set({ visible: true });
      additionalIcons.forEach((icon) => icon.element.set({ visible: true }));
      const camIndex = fabricCanvas.getObjects().indexOf(cameraIcon);
      if (camIndex !== -1) {
        coverageArea.moveTo(camIndex);
      }
      cameraIcon.bringToFront();
      rotationIcon.bringToFront();
      additionalIcons.forEach((icon) => icon.element.bringToFront());
      fabricCanvas.requestRenderAll();
    });

    cameraIcon.on("moving", () => {
      isDragging = true;
      rotationIcon.set({ visible: true });
      const currentAngle = coverageArea.angle - angleOffset;
      const currentScale = coverageArea.scaleX;
      updateCoveragePosition(currentAngle, currentScale);
      fabricCanvas.requestRenderAll();
    });

    cameraIcon.on("mouseup", () => {
      isDragging = false;
      fabricCanvas.setActiveObject(cameraIcon);
      rotationIcon.set({ visible: true });
      additionalIcons.forEach((icon) => icon.element.set({ visible: true }));
      fabricCanvas.requestRenderAll();
    });

    cameraIcon.on("removed", () => {
      fabricCanvas.remove(coverageArea);
      fabricCanvas.remove(rotationIcon);
      additionalIcons.forEach((icon) => fabricCanvas.remove(icon.element));
    });

    cameraIcon.on("selected", () => {
      rotationIcon.set({ visible: true });
      additionalIcons.forEach((icon) => icon.element.set({ visible: true }));
      const camIndex = fabricCanvas.getObjects().indexOf(cameraIcon);
      if (camIndex !== -1) {
        coverageArea.moveTo(camIndex);
      }
      cameraIcon.bringToFront();
      rotationIcon.bringToFront();
      additionalIcons.forEach((icon) => icon.element.bringToFront());
      fabricCanvas.requestRenderAll();
    });

    cameraIcon.on("deselected", () => {
      if (!isDragging && !isRotating) {
        rotationIcon.set({ visible: false });
        additionalIcons.forEach((icon) => icon.element.set({ visible: false }));
        fabricCanvas.requestRenderAll();
      }
    });

    rotationIcon.on("mousedown", (opt) => {
      isRotating = true;
      fabricCanvas.setActiveObject(cameraIcon);
      fabricCanvas.selection = false;

      const pointer = fabricCanvas.getPointer(opt.e);
      const camCenter = cameraIcon.getCenterPoint();
      const dx = pointer.x - camCenter.x;
      const dy = pointer.y - camCenter.y;
      initialRotationDistance = Math.sqrt(dx * dx + dy * dy);
      baseScale = coverageArea.scaleX;

      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    fabricCanvas.on("mouse:up", (opt) => {
      isRotating = false;
      isDragging = false;
      initialRotationDistance = null;
      baseScale = coverageArea.scaleX;
      fabricCanvas.selection = true;
      const active = fabricCanvas.getActiveObject() === cameraIcon;
      rotationIcon.set({ visible: active });
      additionalIcons.forEach((icon) => icon.element.set({ visible: active }));
      fabricCanvas.requestRenderAll();
      if (onMouseUp) onMouseUp(opt);
    });

    fabricCanvas.on("mouse:move", (opt) => {
      if (onMouseMove && onMouseMove(opt)) return;

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
        const sensitivity = 0.006;
        const scaleDelta = (distance - initialRotationDistance) * sensitivity;
        const newScale = Math.max(0.5, baseScale + scaleDelta);

        updateCoveragePosition(angleDeg, newScale);
      } else if (isDragging) {
        const currentAngle = coverageArea.angle - angleOffset;
        const currentScale = coverageArea.scaleX;
        updateCoveragePosition(currentAngle, currentScale);
      }
    });

    fabricCanvas.add(coverageArea);
    fabricCanvas.add(rotationIcon);
    additionalIcons.forEach((icon) => fabricCanvas.add(icon.element));

    const camIndex = fabricCanvas.getObjects().indexOf(cameraIcon);
    if (camIndex !== -1) {
      fabricCanvas.insertAt(coverageArea, camIndex);
    } else {
      fabricCanvas.sendToBack(coverageArea);
    }

    cameraIcon.bringToFront();
    rotationIcon.bringToFront();
    additionalIcons.forEach((icon) => icon.element.bringToFront());

    fabricCanvas.setActiveObject(cameraIcon);
    rotationIcon.set({ visible: true });
    additionalIcons.forEach((icon) => icon.element.set({ visible: true }));
    updateCoveragePosition(0, 1);
    fabricCanvas.requestRenderAll();
  });

  return coverageArea;
}

export function addCameraCoverage(fabricCanvas, cameraIcon, shapeType) {
  const baseRadius = 50; // Reduced from 100 to match smaller icon scale
  let coverageArea;
  let angleOffset;

  const commonProps = {
    stroke: "black",
    strokeWidth: 1,
    strokeUniform: true,
    originX: "center",
    originY: "center",
    hasControls: false,
    hasBorders: false,
    selectable: false,
    evented: false,
    hoverCursor: "default",
    lockMovementX: true,
    lockMovementY: true,
    lockScalingX: true,
    lockScalingY: true,
    lockSkewingX: true,
    lockSkewingY: true,
  };

  const createTriangle = (dimensions, color) => {
    return new fabric.Triangle({
      ...commonProps,
      fill: new fabric.Gradient({
        type: "linear",
        gradientUnits: "percentage",
        coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
        colorStops: [{ offset: 1, color }],
      }),
      height: dimensions.height * 0.5, // Scale down by 0.5 to match icon size
      width: dimensions.width * 0.5, // Scale down by 0.5 to match icon size
    });
  };

  const triangleConfigs = {
    triangle3mm: { height: 150, width: 500, color: "rgba(255, 181, 181, 0.25)" },
    triangle4mm: { height: 200, width: 375, color: "rgba(22, 178, 22, 0.25)" },
    triangle6mm: { height: 300, width: 200, color: "rgba(83, 69, 233, 0.25)" },
    triangle12mm: { height: 300, width: 100, color: "rgba(253, 250, 63, 0.25)" },
  };

  if (triangleConfigs[shapeType]) {
    coverageArea = createTriangle(triangleConfigs[shapeType], triangleConfigs[shapeType].color);
    angleOffset = 270;
  } else if (shapeType === "polygon") {
    coverageArea = new fabric.Polygon(
      [
        { x: -25, y: 0 }, // Scaled down by 0.5
        { x: 25, y: 0 }, // Scaled down by 0.5
        { x: 100, y: -100 }, // Scaled down by 0.5
        { x: -100, y: -100 }, // Scaled down by 0.5
      ],
      {
        ...commonProps,
        fill: new fabric.Gradient({
          type: "linear",
          gradientUnits: "percentage",
          coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
          colorStops: [
            { offset: 1, color: "rgba(255, 0, 0, 0.25)" },
            { offset: 0.5, color: "rgba(255, 165, 0, 0.25)" },
            { offset: 0, color: "rgba(144, 238, 144, 0.25)" },
          ],
        }),
      }
    );
    angleOffset = 90;
  } else if (shapeType === "circle") {
    coverageArea = new fabric.Circle({
      ...commonProps,
      radius: 50, // Scaled down by 0.5
      fill: new fabric.Gradient({
        type: "linear",
        gradientUnits: "percentage",
        coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
        colorStops: [{ offset: 1, color: "rgba(163, 255, 226, 0.25)" }],
      }),
    });
    angleOffset = 90;
  } else {
    throw new Error(`Unsupported shape type: ${shapeType}`);
  }

  function updateCoveragePosition(angleDegrees, scale = 1) {
    const camCenter = cameraIcon.getCenterPoint();
    const angleRad = fabric.util.degreesToRadians(angleDegrees);
    const radius = baseRadius * scale;

    let offsetX = Math.cos(angleRad) * radius;
    let offsetY = Math.sin(angleRad) * radius;
    let coverageLeft = camCenter.x;
    let coverageTop = camCenter.y;
    let coverageAngle = angleDegrees + angleOffset;
    let rotationIconLeft = camCenter.x + offsetX;
    let rotationIconTop = camCenter.y + offsetY;

    if (triangleConfigs[shapeType]) {
      const triangleHeight = coverageArea.height;
      const scaledHeight = triangleHeight * scale;
      coverageLeft = camCenter.x + Math.cos(angleRad) * (scaledHeight / 2);
      coverageTop = camCenter.y + Math.sin(angleRad) * (scaledHeight / 2);
      coverageAngle = angleDegrees + 270;
      const tipDistance = scaledHeight;
      rotationIconLeft = camCenter.x + Math.cos(angleRad) * tipDistance;
      rotationIconTop = camCenter.y + Math.sin(angleRad) * tipDistance;
    } else if (shapeType === "polygon") {
      coverageLeft = camCenter.x + offsetX;
      coverageTop = camCenter.y + offsetY;
      const edgeDistance = 50 * scale; // Scaled down by 0.5
      rotationIconLeft = camCenter.x + Math.cos(angleRad) * (radius + edgeDistance);
      rotationIconTop = camCenter.y + Math.sin(angleRad) * (radius + edgeDistance);
    }

    coverageArea.set({
      left: coverageLeft,
      top: coverageTop,
      angle: coverageAngle,
      scaleX: scale,
      scaleY: scale,
    });

    cameraIcon.rotationIcon.set({
      left: rotationIconLeft,
      top: rotationIconTop,
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
    angleOffset,
  });
}
