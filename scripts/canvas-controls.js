export function initCanvasControls(fabricCanvas, clearButton, downloadButton) {
  clearButton.addEventListener('click', function () {
    fabricCanvas.clear();
  });

  downloadButton.addEventListener('click', function () {
    const imageName = prompt("Enter image name") || "drawing";
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      multiplier: 1
    });

    const a = document.createElement('a');
    a.href = dataURL;
    a.download = imageName;
    a.click();
  });
}