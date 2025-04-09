window.onload = function () {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    // Background Image
    const background = new Image();
    background.src = 'images/back.jpg';

    // Intruder Alarm Image
    const intruderalarm = new Image();
    intruderalarm.src = 'images/intruderalarm.png';

    // CCTV Image
    const cctv = new Image();
    cctv.src = 'images/cctv.png';

    // Fire Alarm Image
    const firealarm = new Image();
    firealarm.src = 'images/firealarm.png';

    // Access Image
    const access = new Image();
    access.src = 'images/access.png';

    // Panic Alarm Image
    const panicalarm = new Image();
    panicalarm.src = 'images/panicalarm.png';

    const templates = [
        { img: intruderalarm, x: canvas.width - 62.5, y: 10, width: 50, height: 50 },
        { img: cctv, x: canvas.width - 62.5, y: 70, width: 50, height: 50 },
        { img: firealarm, x: canvas.width - 62.5, y: 130, width: 50, height: 50 },
        { img: access, x: canvas.width - 62.5, y: 190, width: 50, height: 50 },
        { img: panicalarm, x: canvas.width - 62.5, y: 250, width: 50, height: 50 },
    ];

    let instances = [];
    let draggingItem = null;
    let selectedItem = null;

    function isInside(item, x, y) {
        return (
            x >= item.x && x <= item.x + item.width &&
            y >= item.y && y <= item.y + item.height
        );
    }

    canvas.addEventListener('mousedown', function (event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        selectedItem = null;

        // Check templates first
        for (let template of templates) {
            if (isInside(template, mouseX, mouseY)) {
                draggingItem = {
                    img: template.img,
                    x: mouseX - template.width / 2,
                    y: mouseY - template.height / 2,
                    width: template.width,
                    height: template.height,
                    dragging: true
                };
                instances.push(draggingItem);
                selectedItem = draggingItem;
                draw();
                return;
            }
        }

        // Check existing instances
        for (let i = instances.length - 1; i >= 0; i--) {
            if (isInside(instances[i], mouseX, mouseY)) {
                selectedItem = instances[i];
                draggingItem = selectedItem;
                selectedItem.dragging = true;
        
                // Bring to front by removing and pushing to the end
                instances.splice(i, 1);
                instances.push(selectedItem);
        
                draw();
                return;
            }
        }

        draw(); // Deselect if clicked on nothing
    });

    canvas.addEventListener('mouseup', function () {
        if (draggingItem) {
            draggingItem.dragging = false;
            draggingItem = null;
        }
    });

    canvas.addEventListener('mousemove', function (event) {
        if (!draggingItem) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        draggingItem.x = mouseX - draggingItem.width / 2;
        draggingItem.y = mouseY - draggingItem.height / 2;

        draw();
    });

    document.addEventListener('keydown', function (event) {
        if ((event.key === 'Delete' || event.key === 'Backspace') && selectedItem) {
            instances = instances.filter(item => item !== selectedItem);
            selectedItem = null;
            draw();
        }
    });

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(background, 0, 0, canvas.width - 75, canvas.height);

        // Draw templates
        templates.forEach(item => {
            context.drawImage(item.img, item.x, item.y, item.width, item.height);
        });

        // Draw instances
        instances.forEach(item => {
            context.drawImage(item.img, item.x, item.y, item.width, item.height);
            if (item === selectedItem) {
                context.strokeStyle = 'green';
                context.lineWidth = 5;
                context.strokeRect(item.x, item.y, item.width, item.height);
            }
        });
    }

    // Load all images before drawing
    let imagesLoaded = 0;
    function checkAllLoaded() {
        imagesLoaded++;
        if (imagesLoaded === 6) draw();
    }

    background.onload = checkAllLoaded;
    intruderalarm.onload = checkAllLoaded;
    cctv.onload = checkAllLoaded;
    firealarm.onload = checkAllLoaded;
    access.onload = checkAllLoaded;
    panicalarm.onload = checkAllLoaded;
};
