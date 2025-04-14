import { initImageUpload } from './image-upload.js';
import { initCanvasControls } from './canvas-controls.js';

window.onload = function () {
  // Fabric.js canvas setup moved here
  const fabricCanvas = new fabric.Canvas('layout-canvas');

  const input = document.getElementById('choose-background');
  const clearButton = document.getElementById('clear');
  const downloadButton = document.getElementById('download');

  initImageUpload(fabricCanvas, input);
  initCanvasControls(fabricCanvas, clearButton, downloadButton);
};
