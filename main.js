window.onload = function () {
  const canvas = document.getElementById('layout-canvas');
  const context = canvas.getContext('2d');
  const input = document.getElementById('inp');
  const clearButton = document.getElementById('clear');

  input.addEventListener('change', function () {
      const file = this.files[0];
      if (!file) return;

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = function () {
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url); // Clean up

          // 🧽 Reset the input so re-uploading the same file works again
          input.value = "";
      };

      img.onerror = function () {
          alert("The provided file couldn't be loaded as an Image.");
      };

      img.src = url;
  });

  // Handle Clear Button
  clearButton.addEventListener('click', function () {
      context.clearRect(0, 0, canvas.width, canvas.height);
  });

  //Handle Download Button
  var downloadButton = document.getElementById('download');

  downloadButton.addEventListener('click', function() {
    var imageName = prompt("Enter image name");

    var canvasDataURL = canvas.toDataURL();

    var a = document.createElement('a');
    a.href = canvasDataURL;
    a.download = imageName || "drawing";
    a.click();
  });
  
};
