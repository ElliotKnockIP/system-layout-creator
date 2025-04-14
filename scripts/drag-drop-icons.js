export function initDragDropIcons(fabricCanvas) {
    console.log('Initializing drag-drop-icons');

    const icons = document.querySelectorAll('.system-icons img');
    console.log(`Found ${icons.length} icons`);

    icons.forEach((icon, index) => {
        icon.setAttribute('draggable', true);
        console.log(`Icon ${index}: ${icon.src}`);

        icon.addEventListener('dragstart', (e) => {
            console.log('Drag started for:', e.target.src);
            e.dataTransfer.setData('text/plain', e.target.src);
        });
    });

    const canvasElement = fabricCanvas.getElement();
    const canvasContainer = canvasElement.parentElement;
    console.log('Canvas container:', canvasContainer);

    canvasContainer.style.position = 'relative';
    canvasContainer.style.zIndex = '10';

    canvasContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        console.log('Drag over canvas');
    });

    canvasContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        console.log('Drop event triggered');

        const imgSrc = e.dataTransfer.getData('text/plain');
        console.log('Dropped image src:', imgSrc);

        const rect = canvasElement.getBoundingClientRect();
        const scaleX = fabricCanvas.getWidth() / rect.width;
        const scaleY = fabricCanvas.getHeight() / rect.height;
        const left = (e.clientX - rect.left) * scaleX;
        const top = (e.clientY - rect.top) * scaleY;
        console.log(`Drop position: left=${left}, top=${top}`);

        fabric.Image.fromURL(imgSrc, (img) => {
            console.log('Image loaded:', img);

            img.set({
                left: left - 30,
                top: top - 30,
                scaleX: 60 / img.width,
                scaleY: 60 / img.height,
                selectable: true,
                hasControls: true,
                cornerSize: 12,
                cornerColor: '#ff0000',
                cornerStrokeColor: '#000000',
                cornerStyle: 'rect',
                transparentCorners: false,
                borderColor: '#0000ff',
                borderScaleFactor: 2
            });

            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();
            console.log('Image added to canvas');
        }, {
            crossOrigin: 'anonymous'
        });
    });

    // Enable deletion of selected objects with the Delete or Backspace key
    document.addEventListener('keydown', function (e) {
        if ((e.key === 'Delete' || e.key === 'Backspace') && fabricCanvas.getActiveObject()) {
            fabricCanvas.remove(fabricCanvas.getActiveObject());
            fabricCanvas.discardActiveObject(); // Deselect the object after removal
            fabricCanvas.renderAll(); // Re-render the canvas
            console.log('Selected object deleted');
        }
    });
}