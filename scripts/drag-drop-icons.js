import { addCameraCoverageTriangle } from './camera-coverage-triangle.js';
import { addCameraCoveragePolygon } from './camera-coverage-polygon.js';
import { addCameraCoverageCircle } from './camera-coverage-circle.js';

export function initDragDropIcons(fabricCanvas) {
    const icons = document.querySelectorAll('.system-icons img');

    icons.forEach((icon) => {
        icon.setAttribute('draggable', true);
        icon.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.src);
        });
    });

    const canvasElement = fabricCanvas.getElement();
    const canvasContainer = canvasElement.parentElement;

    canvasContainer.style.position = 'relative';
    canvasContainer.style.zIndex = '10';

    canvasContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    canvasContainer.addEventListener('drop', (e) => {
        e.preventDefault();

        const imgSrc = e.dataTransfer.getData('text/plain');
        const rect = canvasElement.getBoundingClientRect();
        const scaleX = fabricCanvas.getWidth() / rect.width;
        const scaleY = fabricCanvas.getHeight() / rect.height;
        const left = (e.clientX - rect.left) * scaleX;
        const top = (e.clientY - rect.top) * scaleY;

        fabric.Image.fromURL(imgSrc, (img) => {
            img.set({
                left: left - 30,
                top: top - 30,
                scaleX: 60 / img.width,
                scaleY: 60 / img.height,
                selectable: true,
                hasControls: false,
                cornerSize: 8,
                cornerColor: '#FE8800',
                cornerStrokeColor: '#000000',
                cornerStyle: 'circle',
                transparentCorners: false,
                borderColor: '#000000',
                borderScaleFactor: 2
            });

            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);

            // Check if the dropped icon is the camera icon (based on the src)
            if (imgSrc.includes('camera.png')) {
                addCameraCoverageTriangle(fabricCanvas, img);
            } else if (imgSrc.includes('camera2.png')) {
                addCameraCoveragePolygon(fabricCanvas, img);
            } else if (imgSrc.includes('camera3.png')) {
                addCameraCoverageCircle(fabricCanvas, img);
            }

            fabricCanvas.renderAll();
        }, {
            crossOrigin: 'anonymous'
        });
    });

    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && fabricCanvas.getActiveObject()) {
            fabricCanvas.remove(fabricCanvas.getActiveObject());
            fabricCanvas.discardActiveObject();
            fabricCanvas.renderAll();
        }
    });
}