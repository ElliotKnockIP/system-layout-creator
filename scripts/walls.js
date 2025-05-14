export function initAddWalls(fabricCanvas, addLineButton) {
  let isAddingLine = false;
  let currentLine = null;
  let lastPoint = null;
  let pointCircle = null;

  const lineSegments = []; // Track lines and associated points

  addLineButton.addEventListener("click", activateAddingLine);
  document.addEventListener("keydown", handleKeyDown);

  // Ensure circles are always on top when any object is added
  fabricCanvas.on("object:added", (e) => {
    fabricCanvas.getObjects("circle").forEach((circle) => circle.bringToFront());
    fabricCanvas.requestRenderAll();
  });

  function activateAddingLine() {
    if (isAddingLine) return;
    isAddingLine = true;

    fabricCanvas.selection = false;
    // Disable selection for all non-circle objects during drawing
    fabricCanvas.getObjects().forEach((obj) => {
      if (obj.type !== "circle") {
        obj.set({ selectable: false });
      }
    });
    fabricCanvas.on("mouse:down", handleMouseDown);
    fabricCanvas.on("mouse:move", handleMouseMove);
    fabricCanvas.requestRenderAll();
  }

  function handleMouseDown(o) {
    o.e.preventDefault(); // Prevent browser defaults (e.g., text selection)
    o.e.stopPropagation(); // Stop event propagation to parent elements

    const pointer = fabricCanvas.getPointer(o.e);

    // Create a circle for the current point
    const newCircle = new fabric.Circle({
      left: pointer.x,
      top: pointer.y,
      radius: 6,
      fill: "black",
      originX: "center",
      originY: "center",
      selectable: true,
      evented: true,
      hasControls: false,
      borderColor: "#FE8800",
      borderScaleFactor: 2,
      cornerSize: 8,
      cornerColor: "#FE8800",
      cornerStrokeColor: "#000000",
      cornerStyle: "circle",
      transparentCorners: false,
      padding: 5,
    });

    newCircle.on("moving", () => {
      const circleCenter = newCircle.getCenterPoint();
      lineSegments.forEach((segment) => {
        if (segment.startCircle === newCircle) {
          segment.line.set({ x1: circleCenter.x, y1: circleCenter.y });
          segment.line.setCoords();
        }
        if (segment.endCircle === newCircle) {
          segment.line.set({ x2: circleCenter.x, y2: circleCenter.y });
          segment.line.setCoords();
        }
      });
      fabricCanvas.requestRenderAll();
    });

    fabricCanvas.add(newCircle);
    newCircle.bringToFront();

    if (!lastPoint) {
      // First point only
      lastPoint = { x: pointer.x, y: pointer.y };
      pointCircle = newCircle;
      fabricCanvas.requestRenderAll();
    } else {
      // Remove preview line
      if (currentLine) {
        fabricCanvas.remove(currentLine);
        currentLine = null;
      }

      // Create the actual line, non-selectable during drawing and non-draggable
      const newLine = new fabric.Line([lastPoint.x, lastPoint.y, pointer.x, pointer.y], {
        stroke: "red",
        strokeWidth: 3,
        selectable: false,
        evented: true,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
      });

      fabricCanvas.add(newLine);
      lineSegments.push({
        line: newLine,
        startCircle: pointCircle,
        endCircle: newCircle,
      });

      // Prepare for the next segment
      lastPoint = { x: pointer.x, y: pointer.y };
      pointCircle = newCircle;
      fabricCanvas.requestRenderAll();
    }
  }

  function handleMouseMove(o) {
    if (!lastPoint) return;

    const pointer = fabricCanvas.getPointer(o.e);

    if (!currentLine) {
      currentLine = new fabric.Line([lastPoint.x, lastPoint.y, pointer.x, pointer.y], {
        stroke: "red",
        strokeWidth: 3,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
      });
      fabricCanvas.add(currentLine);
    } else {
      currentLine.set({ x2: pointer.x, y2: pointer.y });
    }

    fabricCanvas.requestRenderAll();
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      if (currentLine) {
        fabricCanvas.remove(currentLine);
        currentLine = null;
      }
      pointCircle = null;
      stopDrawing();
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject && activeObject.type === "line") {
        const segmentIndex = lineSegments.findIndex((seg) => seg.line === activeObject);
        if (segmentIndex !== -1) {
          const segment = lineSegments[segmentIndex];
          fabricCanvas.remove(segment.line);

          // Count how many segments use each circle
          const startCircleUsage = lineSegments.filter((seg, idx) => idx !== segmentIndex && (seg.startCircle === segment.startCircle || seg.endCircle === segment.startCircle)).length;
          const endCircleUsage = lineSegments.filter((seg, idx) => idx !== segmentIndex && (seg.startCircle === segment.endCircle || seg.endCircle === segment.endCircle)).length;

          // Remove circles only if they are not used by other segments
          if (startCircleUsage === 0) {
            fabricCanvas.remove(segment.startCircle);
          }
          if (endCircleUsage === 0) {
            fabricCanvas.remove(segment.endCircle);
          }

          lineSegments.splice(segmentIndex, 1);
          cleanupOrphanedCircles();
        }

        fabricCanvas.discardActiveObject();
        fabricCanvas.requestRenderAll();
      }
    }
  }

  function cleanupOrphanedCircles() {
    const referencedCircles = new Set(lineSegments.flatMap((seg) => [seg.startCircle, seg.endCircle]));
    fabricCanvas.getObjects("circle").forEach((circle) => {
      if (!referencedCircles.has(circle)) {
        fabricCanvas.remove(circle);
      }
    });
  }

  function stopDrawing() {
    isAddingLine = false;
    lastPoint = null;
    currentLine = null;

    fabricCanvas.selection = true;
    fabricCanvas.getObjects("line").forEach((line) => line.set({ selectable: true }));
    fabricCanvas.requestRenderAll();

    fabricCanvas.off("mouse:down", handleMouseDown);
    fabricCanvas.off("mouse:move", handleMouseMove);
  }
}
