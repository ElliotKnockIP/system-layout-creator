import { addCameraCoverageTriangle } from "./camera-coverage-triangle.js";
import { addCameraCoveragePolygon } from "./camera-coverage-polygon.js";
import { addCameraCoverageCircle } from "./camera-coverage-circle.js";

export function initDragDropIcons(fabricCanvas) {
  const icons = document.querySelectorAll(".system-icons img");

  icons.forEach((icon) => {
    icon.setAttribute("draggable", true);
    icon.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", e.target.src);
    });
  });

  const canvasElement = fabricCanvas.getElement();
  const canvasContainer = canvasElement.parentElement;

  canvasContainer.style.position = "relative";
  canvasContainer.style.zIndex = "10";

  canvasContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  canvasContainer.addEventListener("drop", (e) => {
    e.preventDefault();

    const imgSrc = e.dataTransfer.getData("text/plain");
    const rect = canvasElement.getBoundingClientRect();

    // Get the mouse coordinates relative to the canvas
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Get the current viewport transform
    const vpt = fabricCanvas.viewportTransform;
    const zoom = fabricCanvas.getZoom();

    // Adjust coordinates to account for zoom and pan
    const canvasX = (clientX - vpt[4]) / zoom;
    const canvasY = (clientY - vpt[5]) / zoom;

    fabric.Image.fromURL(
      imgSrc,
      (img) => {
        img.set({
          left: canvasX - 30,
          top: canvasY - 30,
          scaleX: 60 / img.width,
          scaleY: 60 / img.height,
          selectable: true,
          hasControls: false,
          cornerSize: 8,
          cornerColor: "#FE8800",
          cornerStrokeColor: "#000000",
          cornerStyle: "circle",
          transparentCorners: false,
          borderColor: "#000000",
          borderScaleFactor: 2,
        });

        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);

        // Add camera coverage if applicable
        if (imgSrc.includes("camera.png")) {
          addCameraCoverageTriangle(fabricCanvas, img);
        } else if (imgSrc.includes("camera2.png")) {
          addCameraCoveragePolygon(fabricCanvas, img);
        } else if (imgSrc.includes("camera3.png")) {
          addCameraCoverageCircle(fabricCanvas, img);
        }

        fabricCanvas.renderAll();
      },
      { crossOrigin: "anonymous" }
    );
  });

  document.addEventListener("keydown", (e) => {
    if ((e.key === "Delete" || e.key === "Backspace") && fabricCanvas.getActiveObject()) {
      const activeObj = fabricCanvas.getActiveObject();
      // Only handle deletions for images (icons)
      if (activeObj.type === "image") {
        activeObj.fire("removed");
        fabricCanvas.remove(activeObj);
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();
      }
    }
  });
}
