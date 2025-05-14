export function initCameraCoverageUtils({ fabricCanvas, cameraIcon, coverageArea, updateCoveragePosition, angleOffset = 90, additionalIcons = [], onMouseMove, onMouseUp }) {
  const baseRadius = 100;
  let isRotating = false;
  let isDragging = false;
  let initialRotationDistance = null;
  let baseScale = 1; // Store the current scale when rotation starts

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
      baseScale = coverageArea.scaleX; // Capture the current scale

      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    fabricCanvas.on("mouse:up", (opt) => {
      isRotating = false;
      isDragging = false;
      initialRotationDistance = null; // Reset initialRotationDistance
      baseScale = coverageArea.scaleX; // Update baseScale to current scale
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
        const newScale = Math.max(0.5, baseScale + scaleDelta); // Use baseScale instead of 1

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
