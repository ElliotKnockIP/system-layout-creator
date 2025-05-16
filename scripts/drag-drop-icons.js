import { addCameraCoverage } from "./camera-coverage-utils.js";

export function initDragDropIcons(fabricCanvas) {
  const icons = document.querySelectorAll(".system-icons img");

  icons.forEach((icon) => {
    icon.setAttribute("draggable", true);
    icon.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", e.target.src);
    });
  });

  const canvasElement = fabricCanvas.getElement();
  const canvasContainer = canvasElement.parentElement;

  canvasContainer.style.position = "relative";
  canvasContainer.style.zIndex = "10";

  canvasContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  canvasContainer.addEventListener("drop", (e) => {
    e.preventDefault();

    const imgSrc = e.dataTransfer.getData("text/plain");
    const rect = canvasElement.getBoundingClientRect();

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const vpt = fabricCanvas.viewportTransform;
    const zoom = fabricCanvas.getZoom();

    const canvasX = (clientX - vpt[4]) / zoom;
    const canvasY = (clientY - vpt[5]) / zoom;

    fabric.Image.fromURL(
      imgSrc,
      (img) => {
        img.set({
          left: canvasX - 15, // Adjusted to center smaller icon (30/2)
          top: canvasY - 15, // Adjusted to center smaller icon (30/2)
          scaleX: 30 / img.width,
          scaleY: 30 / img.height,
          selectable: true,
          hasControls: false,
          cornerSize: 8,
          cornerColor: "#FE8800",
          cornerStrokeColor: "#000000",
          cornerStyle: "circle",
          transparentCorners: false,
          borderColor: "#000000",
          borderScaleFactor: 2,
          hoverCursor: imgSrc.includes("camera") ? "move" : "default",
        });

        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);

        if (imgSrc.includes("camera3mm.png")) {
          addCameraCoverage(fabricCanvas, img, "triangle3mm");
        } else if (imgSrc.includes("camera4mm.png")) {
          addCameraCoverage(fabricCanvas, img, "triangle4mm");
        } else if (imgSrc.includes("camera6mm.png")) {
          addCameraCoverage(fabricCanvas, img, "triangle6mm");
        } else if (imgSrc.includes("camera12mm.png")) {
          addCameraCoverage(fabricCanvas, img, "triangle12mm");
        } else if (imgSrc.includes("cameracircle.png")) {
          addCameraCoverage(fabricCanvas, img, "circle");
        } else if (imgSrc.includes("camerapolygon.png")) {
          addCameraCoverage(fabricCanvas, img, "polygon");
        }

        fabricCanvas.renderAll();
      },
      { crossOrigin: "anonymous" }
    );
  });

  document.addEventListener("keydown", (e) => {
    if ((e.key === "Delete" || e.key === "Backspace") && fabricCanvas.getActiveObject()) {
      const activeObj = fabricCanvas.getActiveObject();
      if (activeObj.type === "image") {
        activeObj.fire("removed");
        fabricCanvas.remove(activeObj);
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();
      }
    }
  });
}
