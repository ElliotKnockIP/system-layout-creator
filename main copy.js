document.addEventListener('DOMContentLoaded', function () {
    const canvas = new fabric.Canvas('canvas');
  
    // Load and set the background image
    fabric.Image.fromURL('images/back.jpg', function (backgroundImg) {
      canvas.setBackgroundImage(backgroundImg, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width / backgroundImg.width,
        scaleY: canvas.height / backgroundImg.height
      });
    });
  
    // List of template images with their positions
    const templates = [
      { src: 'images/intruderalarm.png', x: canvas.width - 62.5, y: 10 },
      { src: 'images/cctv.png', x: canvas.width - 62.5, y: 70 },
      { src: 'images/firealarm.png', x: canvas.width - 62.5, y: 130 },
      { src: 'images/access.png', x: canvas.width - 62.5, y: 190 },
      { src: 'images/panicalarm.png', x: canvas.width - 62.5, y: 250 },
    ];
  
    // Load template images onto the canvas
    templates.forEach(template => {
      fabric.Image.fromURL(template.src, function (img) {
        img.set({
          left: template.x,
          top: template.y,
          width: 50,
          height: 50,
          selectable: false // Templates are not directly interactive
        });
        canvas.add(img);
      });
    });
  
    // Function to add a new interactive image instance to the canvas
    function addImageInstance(src, x, y) {
      fabric.Image.fromURL(src, function (img) {
        img.set({
          left: x,
          top: y,
          width: 50,
          height: 50,
          hasControls: true, // Enable controls for resizing and rotating
          selectable: true
        });
        canvas.add(img);
        canvas.setActiveObject(img);
      });
    }
  
    // Handle mouse clicks to duplicate template images
    canvas.on('mouse:down', function (options) {
      const pointer = canvas.getPointer(options.e);
      const clickedObjects = canvas.getObjects().filter(obj => {
        return !obj.selectable && obj.containsPoint(pointer);
      });
  
      if (clickedObjects.length > 0) {
        const clickedTemplate = clickedObjects[0];
        addImageInstance(clickedTemplate.getSrc(), pointer.x - 25, pointer.y - 25);
      }
    });
  
    // Enable deletion of selected objects with the Delete or Backspace key
    document.addEventListener('keydown', function (event) {
      if ((event.key === 'Delete' || event.key === 'Backspace') && canvas.getActiveObject()) {
        canvas.remove(canvas.getActiveObject());
      }
    });
  });
  