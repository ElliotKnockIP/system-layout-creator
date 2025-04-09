window.onload = function() {

    var canvas = document.getElementById('layout-canvas');
    var context = canvas.getContext('2d');

    // Image Upload Button
    document.getElementById('inp').onchange = function() {
        var img = new Image();
        img.onload = draw;
        img.onerror = failed;
        img.src = URL.createObjectURL(this.files[0]);
      };

      function draw() {
        context.drawImage(this, 0, 0, canvas.width, canvas.height);
      }
      
      function failed() {
        console.error("The provided file couldn't be loaded as an Image media");
      }
      


      

};








/*
// // Handle Clear Buttons
//   var clearButton = document.getElementById('clear');
//   clearButton.addEventListener('click', function() {
//     context.clearRect(0, 0, canvas.width, canvas.height);
//   });

//   // Handle Download Button
//   var downloadButton = document.getElementById('download');

//   downloadButton.addEventListener('click', function() {
//     var imageName = prompt("Enter image name");

//     var canvasDataURL = canvas.toDataURL();

//     var a = document.createElement('a');
//     a.href = canvasDataURL;
//     a.download = imageName || "drawing";
//     a.click();
//   });
*/
  