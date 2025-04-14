import { initImageUpload } from './image-upload.js';
import { initCanvasControls } from './canvas-controls.js';
import { initDragDropIcons } from './drag-drop-icons.js'

window.onload = function () {
  const fabricCanvas = new fabric.Canvas('layout-canvas');
  const input = document.getElementById('choose-background');
  const clearButton = document.getElementById('clear');
  const downloadButton = document.getElementById('download');

  initImageUpload(fabricCanvas, input);
  initCanvasControls(fabricCanvas, clearButton, downloadButton);
  initDragDropIcons(fabricCanvas);
};
