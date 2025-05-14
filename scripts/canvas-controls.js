export function initCanvasControls(fabricCanvas, clearButton, downloadButton, backgroundInput) {
  // Clear the canvas button
  clearButton.addEventListener("click", function () {
    fabricCanvas.clear();
  });

  // Download the canvas as an image
  downloadButton.addEventListener("click", function () {
    const imageName = prompt("Enter image name");
    if (imageName === null) return; // Exit if Cancel is clicked
    const finalImageName = imageName || "drawing"; // Use fallback name if empty

    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      multiplier: 1,
    });

    const a = document.createElement("a");
    a.href = dataURL;
    a.download = finalImageName;
    a.click();
  });

  // Background image upload
  const chooseBackgroundBtn = document.getElementById("choose-background-btn");

  chooseBackgroundBtn.addEventListener("click", () => {
    backgroundInput.click();
  });

  backgroundInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    fabric.Image.fromURL(
      url,
      function (img) {
        const canvasWidth = fabricCanvas.getWidth();
        const canvasHeight = fabricCanvas.getHeight();
        const imgWidth = img.width;
        const imgHeight = img.height;

        // Calculate scale to fit image within canvas, with a maximum scale cap
        const maxScale = 0.5; // Adjust this value to make the image smaller (e.g., 0.5 for 50% max size)
        const scale = Math.min(
          canvasWidth / imgWidth,
          canvasHeight / imgHeight,
          maxScale // Enforce maximum scale
        );

        // Center the image
        const left = (canvasWidth - imgWidth * scale) / 2;
        const top = (canvasHeight - imgHeight * scale) / 2;

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: left,
          top: top,
          selectable: false,
          hoverCursor: "default",
        });

        fabricCanvas.clear();
        fabricCanvas.add(img);
        fabricCanvas.sendToBack(img);

        URL.revokeObjectURL(url);
        backgroundInput.value = "";
      },
      {
        crossOrigin: "anonymous",
      }
    );
  });
}
