export function initImageUpload(fabricCanvas, input) {
  // Reference to the button
  const chooseBackgroundBtn = document.getElementById("choose-background-btn");

  // Add click event listener to the button to trigger file input
  chooseBackgroundBtn.addEventListener("click", () => {
    input.click();
  });

  input.addEventListener("change", function () {
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

        const scale = Math.min(
          canvasWidth / imgWidth,
          canvasHeight / imgHeight
        );
        const left = (canvasWidth - imgWidth * scale) / 2;
        const top = (canvasHeight - imgHeight * scale) / 2;

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: left,
          top: top,
          selectable: false,
        });

        fabricCanvas.clear();
        fabricCanvas.add(img);
        fabricCanvas.sendToBack(img);

        URL.revokeObjectURL(url);
        input.value = "";
      },
      {
        crossOrigin: "anonymous",
      }
    );
  });
}
