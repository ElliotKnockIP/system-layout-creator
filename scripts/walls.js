export function initAddWalls(fabricCanvas) {
  const addingLineBtn = document.getElementById("adding-line-btn");
  let isAddingLine = false;
  let currentLine = null;
  let lastPoint = null;
  let pointCircle = null;

  addingLineBtn.addEventListener("click", activateAddingLine);

  function activateAddingLine() {
    if (isAddingLine) return;
    isAddingLine = true;

    // Disable canvas selection
    fabricCanvas.selection = false;

    // Start listening for mouse events
    fabricCanvas.on("mouse:down", handleMouseDown);
    fabricCanvas.on("mouse:move", handleMouseMove);
    document.addEventListener("keydown", handleKeyDown);
  }

  function handleMouseDown(o) {
    const pointer = fabricCanvas.getPointer(o.e);

    // Draw a small circle at each point
    pointCircle = new fabric.Circle({
      left: pointer.x,
      top: pointer.y,
      radius: 4,
      fill: "black",
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    fabricCanvas.add(pointCircle);

    if (!lastPoint) {
      // First point only
      lastPoint = { x: pointer.x, y: pointer.y };
    } else {
      // Finalize current line
      if (currentLine) {
        currentLine.set({ x2: pointer.x, y2: pointer.y });
        currentLine = null;
      }

      // Draw actual line
      const newLine = new fabric.Line(
        [lastPoint.x, lastPoint.y, pointer.x, pointer.y],
        {
          stroke: "red",
          strokeWidth: 3,
          selectable: false,
          evented: false,
          hasControls: false,
        }
      );

      fabricCanvas.add(newLine);
      fabricCanvas.requestRenderAll();

      lastPoint = { x: pointer.x, y: pointer.y };
    }
  }

  function handleMouseMove(o) {
    if (!lastPoint) return;

    const pointer = fabricCanvas.getPointer(o.e);

    // Update or create preview line
    if (!currentLine) {
      currentLine = new fabric.Line(
        [lastPoint.x, lastPoint.y, pointer.x, pointer.y],
        {
          stroke: "red",
          strokeWidth: 3,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
        }
      );

      fabricCanvas.add(currentLine);
    } else {
      currentLine.set({ x2: pointer.x, y2: pointer.y });
    }

    fabricCanvas.requestRenderAll();
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      // Remove preview line if drawing
      if (currentLine) {
        fabricCanvas.remove(currentLine);
        currentLine = null;
      }

      if (pointCircle && !currentLine && lastPoint) {
        pointCircle = null;
      }

      stopDrawing();
    }
  }

  function stopDrawing() {
    isAddingLine = false;
    lastPoint = null;
    currentLine = null;

    // Re-enable canvas selection
    fabricCanvas.selection = true;

    fabricCanvas.off("mouse:down", handleMouseDown);
    fabricCanvas.off("mouse:move", handleMouseMove);
    document.removeEventListener("keydown", handleKeyDown);
  }
}
