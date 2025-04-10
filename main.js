window.onload = function () {
  // Initialize the Fabric.js canvas
  const fabricCanvas = new fabric.Canvas('layout-canvas');
  
  // Get DOM elements for input, clear button, and download button
  const input = document.getElementById('choose-background');
  const clearButton = document.getElementById('clear');
  const downloadButton = document.getElementById('download');

  // Event listener for the file input to upload an image
  input.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    // Create an object URL for the file (temporary URL for the uploaded image)
    const url = URL.createObjectURL(file);

    // Load the image using Fabric.js
    fabric.Image.fromURL(url, function (img) {
      // Get the current canvas dimensions
      const canvasWidth = fabricCanvas.getWidth();
      const canvasHeight = fabricCanvas.getHeight();
      
      // Get the image's natural dimensions
      const imgWidth = img.width;
      const imgHeight = img.height;
    
      // Calculate the scale factor to fit the image within the canvas
      const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
    
      // Calculate the position to center the image on the canvas
      const left = (canvasWidth - imgWidth * scale) / 2;
      const top = (canvasHeight - imgHeight * scale) / 2;
    
      // Set the image properties: scale, position, and make it non-selectable
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: left,
        top: top,
        selectable: false
      });
    
      // Clear the canvas before adding the new image
      fabricCanvas.clear();
      
      // Add the image to the canvas and send it to the back
      fabricCanvas.add(img);
      fabricCanvas.sendToBack(img);
      
      URL.revokeObjectURL(url);
      
      // Reset the file input so that the same image can be uploaded again if needed
      input.value = "";
    }, {
      crossOrigin: 'anonymous'
    });
  });

  // Handle Clear Button
  clearButton.addEventListener('click', function () {
    fabricCanvas.clear();
  });

  // Handle Download Button
  downloadButton.addEventListener('click', function () {
    const imageName = prompt("Enter image name") || "drawing";
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      multiplier: 1
    });

    // Create download link and trigger download
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = imageName;
    a.click();
  });


};
