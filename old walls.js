export function initAddWalls(fabricCanvas) {
  let addingLineBtn = document.getElementById("adding-line-btn");
  let addingLineBtnClicked = false;

  addingLineBtn.addEventListener("click", activateAddingLine);

  function activateAddingLine() {
    if (addingLineBtnClicked === false) {
      addingLineBtnClicked = true;
      fabricCanvas.on("mouse:down", startAddingLine);
      fabricCanvas.on("mouse:move", startDrawingLine);
      fabricCanvas.on("mouse:up", stopDrawingLine);

      fabricCanvas.selection = false;
      fabricCanvas.hoverCursor = "auto";

      objectSelectability("added-line", false);
    }
  }

  let line;
  let mouseDown = false;

  // o = object
  function startAddingLine(o) {
    mouseDown = true;
    let pointer = fabricCanvas.getPointer(o.e);

    line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
      id: "added-line",
      stroke: "red",
      strokeWidth: 3,
      selectable: false,
      hasControls: false,
    });

    fabricCanvas.add(line);
    fabricCanvas.requestRenderAll();
  }

  function startDrawingLine(o) {
    if (mouseDown === true) {
      let pointer = fabricCanvas.getPointer(o.e);

      line.set({
        x2: pointer.x,
        y2: pointer.y,
      });

      fabricCanvas.requestRenderAll();
    }
  }

  function stopDrawingLine() {
    line.setCoords();
    // switch this to off to keep it continuous then add esc button to stop
    mouseDown = false;
  }

  let deactivateAddingShapeBtn = document.getElementById(
    "deactivate-adding-shape-btn"
  );

  deactivateAddingShapeBtn.addEventListener("click", deactivateAddingShape);

  function deactivateAddingShape() {
    fabricCanvas.off("mouse:down", startAddingLine);
    fabricCanvas.off("mouse:move", startDrawingLine);
    fabricCanvas.off("mouse:up", stopDrawingLine);

    objectSelectability("added-line", true);

    fabricCanvas.hoverCursor = "all-scroll";
    addingLineBtnClicked = false;
  }

  function objectSelectability(id, value) {
    fabricCanvas.getObjects().forEach((o) => {
      if (o.id === id) {
        o.set({
          selectable: value,
        });
      }
    });
  }

  fabricCanvas.on({
    "object:modified": updateNewLineCoordinates,
    "selection:created": updateNewLineCoordinates,
    "selection:updated": updateNewLineCoordinates,
    "mouse:dblclick": addingControlPoints,
    "object:moving": endPointOfLineToFollowPointer,
  });

  let newLineCoords = {};

  function updateNewLineCoordinates(o) {
    newLineCoords = {};

    let obj = o.target;
    if (!obj) {
      return;
    } else {
      if (obj.id === "added-line") {
        let centerX = obj.getCenterPoint().x;
        let centerY = obj.getCenterPoint().y;

        let x1offset = obj.calcLinePoints().x1;
        let y1offset = obj.calcLinePoints().y1;
        let x2offset = obj.calcLinePoints().x2;
        let y2offset = obj.calcLinePoints().y2;

        newLineCoords = {
          x1: centerX + x1offset - obj.strokeWidth / 2,
          y1: centerY + y1offset - obj.strokeWidth / 2,
          x2: centerX + x2offset - obj.strokeWidth / 2,
          y2: centerY + y2offset - obj.strokeWidth / 2,
        };

        obj.set({
          x1: centerX + x1offset - obj.strokeWidth / 2,
          y1: centerY + y1offset - obj.strokeWidth / 2,
          x2: centerX + x2offset - obj.strokeWidth / 2,
          y2: centerY + y2offset - obj.strokeWidth / 2,
        });
        obj.setCoords();
      }
    }
  }

  function addingControlPoints(o) {
    let obj = o.target;

    if (!obj || obj.id !== "added-line") return;

    // Recalculate coordinates directly from the object
    const centerX = obj.getCenterPoint().x;
    const centerY = obj.getCenterPoint().y;

    const x1offset = obj.calcLinePoints().x1;
    const y1offset = obj.calcLinePoints().y1;
    const x2offset = obj.calcLinePoints().x2;
    const y2offset = obj.calcLinePoints().y2;

    const coords = {
      x1: centerX + x1offset,
      y1: centerY + y1offset,
      x2: centerX + x2offset,
      y2: centerY + y2offset,
    };

    let pointer1 = new fabric.Circle({
      id: "pointer1",
      radius: obj.strokeWidth * 2,
      fill: "blue",
      opacity: 0.5,
      top: coords.y1,
      left: coords.x1,
      originX: "center",
      originY: "center",
      hasBorders: false,
      hasControls: false,
    });

    let pointer2 = new fabric.Circle({
      id: "pointer2",
      radius: obj.strokeWidth * 2,
      fill: "blue",
      opacity: 0.5,
      top: coords.y2,
      left: coords.x2,
      originX: "center",
      originY: "center",
      hasBorders: false,
      hasControls: false,
    });

    fabricCanvas.add(pointer1, pointer2);
    fabricCanvas.setActiveObject(pointer2);
    fabricCanvas.requestRenderAll();

    fabricCanvas.on({
      "object:moving": endPointOfLineToFollowPointer,
      "selection:cleared": removePointers,
    });
  }

  const removePointers = function () {
    fabricCanvas.getObjects().forEach((o) => {
      if (o.id === "pointer1" || o.id === "pointer2") {
        fabricCanvas.remove(o);
      }
    });
    fabricCanvas.requestRenderAll();
  };

  function endPointOfLineToFollowPointer(o) {
    let obj = o.target;

    // Case 1: Moving pointer1 updates line's x1, y1
    if (obj.id === "pointer1") {
      fabricCanvas.getObjects().forEach((o) => {
        if (o.id === "added-line") {
          o.set({
            x1: obj.left,
            y1: obj.top,
          });
          o.setCoords();
        }
      });
    }
    // Case 2: Moving pointer2 updates line's x2, y2
    else if (obj.id === "pointer2") {
      fabricCanvas.getObjects().forEach((o) => {
        if (o.id === "added-line") {
          o.set({
            x2: obj.left,
            y2: obj.top,
          });
          o.setCoords();
        }
      });
    }
    // Case 3: Moving the line updates pointer1 and pointer2 positions
    else if (obj.id === "added-line") {
      // Recalculate line endpoints
      const centerX = obj.getCenterPoint().x;
      const centerY = obj.getCenterPoint().y;

      const x1offset = obj.calcLinePoints().x1;
      const y1offset = obj.calcLinePoints().y1;
      const x2offset = obj.calcLinePoints().x2;
      const y2offset = obj.calcLinePoints().y2;

      const coords = {
        x1: centerX + x1offset,
        y1: centerY + y1offset,
        x2: centerX + x2offset,
        y2: centerY + y2offset,
      };

      // Update pointers' positions
      fabricCanvas.getObjects().forEach((o) => {
        if (o.id === "pointer1") {
          o.set({
            left: coords.x1,
            top: coords.y1,
          });
          o.setCoords();
        } else if (o.id === "pointer2") {
          o.set({
            left: coords.x2,
            top: coords.y2,
          });
          o.setCoords();
        }
      });
    }

    fabricCanvas.requestRenderAll();
  }
}
