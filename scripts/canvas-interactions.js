export function initCanvasInteractions(fabricCanvas) {
  let isPanning = false;
  let lastPosX = 0;
  let lastPosY = 0;

  fabricCanvas.on("mouse:down", function () {
    fabricCanvas.selection = false; // Disable selection during drag
  });

  fabricCanvas.on("mouse:up", function () {
    fabricCanvas.selection = true; // Re-enable selection after drag
  });

  fabricCanvas.on("mouse:down", function (opt) {
    const evt = opt.e;
    // Start panning with left mouse button only if no object is clicked
    if (evt.button === 0 && !opt.target) {
      isPanning = true;
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;
      fabricCanvas.selection = false; // Disable selection during panning
      evt.preventDefault();
      evt.stopPropagation();
    }
  });

  fabricCanvas.on("mouse:move", function (opt) {
    if (isPanning) {
      const evt = opt.e;
      const deltaX = evt.clientX - lastPosX;
      const deltaY = evt.clientY - lastPosY;
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;

      const vpt = fabricCanvas.viewportTransform;
      vpt[4] += deltaX; // Adjust horizontal translation
      vpt[5] += deltaY; // Adjust vertical translation
      fabricCanvas.setViewportTransform(vpt);
      fabricCanvas.requestRenderAll();

      evt.preventDefault();
      evt.stopPropagation();
    }
  });

  fabricCanvas.on("mouse:up", function (opt) {
    if (isPanning) {
      isPanning = false;
      fabricCanvas.selection = true; // Re-enable selection after panning
      opt.e.preventDefault();
      opt.e.stopPropagation();
    }
  });

  // Zoom functionality with mouse wheel
  fabricCanvas.on("mouse:wheel", function (opt) {
    opt.e.preventDefault();
    opt.e.stopPropagation();

    const delta = opt.e.deltaY; // Scroll direction
    let zoom = fabricCanvas.getZoom();
    const zoomFactor = 0.1; // Adjust zoom speed
    const minZoom = 0.1; // Minimum zoom level
    const maxZoom = 10; // Maximum zoom level

    // Adjust zoom based on scroll direction
    if (delta > 0) {
      zoom = Math.max(minZoom, zoom - zoomFactor); // Zoom out
    } else {
      zoom = Math.min(maxZoom, zoom + zoomFactor); // Zoom in
    }

    // Get mouse pointer position
    const pointer = fabricCanvas.getPointer(opt.e, true);
    const zoomPoint = new fabric.Point(pointer.x, pointer.y);

    // Apply zoom centered at the mouse pointer
    fabricCanvas.zoomToPoint(zoomPoint, zoom);

    // Update viewport transform to reflect the new zoom
    fabricCanvas.requestRenderAll();
  });
}
