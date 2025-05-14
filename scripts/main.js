import { initCanvasControls } from "./canvas-controls.js";
import { initDragDropIcons } from "./drag-drop-icons.js";
import { initAddWalls } from "./walls.js";
import { initCanvasInteractions } from "./canvas-interactions.js";

window.onload = function () {
  const container = document.querySelector(".canvas-container");
  const fabricCanvas = new fabric.Canvas("canvas-layout", {
    width: container.clientWidth,
    height: container.clientHeight,
  });

  const backgroundInput = document.getElementById("choose-background");
  const clearButton = document.getElementById("clear");
  const downloadButton = document.getElementById("download");
  const addLineButton = document.getElementById("adding-line-btn");

  initCanvasControls(fabricCanvas, clearButton, downloadButton, backgroundInput);
  initDragDropIcons(fabricCanvas);
  initAddWalls(fabricCanvas, addLineButton);
  initCanvasInteractions(fabricCanvas);

  // Handle window resize
  window.addEventListener("resize", () => {
    // Update canvas dimensions
    fabricCanvas.setDimensions({
      width: container.clientWidth,
      height: container.clientHeight,
    });

    // Optionally, adjust the viewport to maintain the current view
    const vpt = fabricCanvas.viewportTransform;
    const zoom = fabricCanvas.getZoom();
    vpt[4] = (container.clientWidth - fabricCanvas.getWidth() * zoom) / 2;
    vpt[5] = (container.clientHeight - fabricCanvas.getHeight() * zoom) / 2;
    fabricCanvas.setViewportTransform(vpt);

    fabricCanvas.requestRenderAll();
  });
};
