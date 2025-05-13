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
};
