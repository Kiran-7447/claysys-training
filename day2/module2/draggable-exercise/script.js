function makeDraggable(element, boundary = null) {

    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;

    element.addEventListener("mousedown", function (e) {
        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        element.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", function (e) {
        if (!isDragging) return;

        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        if (boundary) {
            const rect = boundary.getBoundingClientRect();
            const elemRect = element.getBoundingClientRect();

            if (newX < rect.left) newX = rect.left;
            if (newY < rect.top) newY = rect.top;
            if (newX + elemRect.width > rect.right)
                newX = rect.right - elemRect.width;
            if (newY + elemRect.height > rect.bottom)
                newY = rect.bottom - elemRect.height;
        }

        element.style.left = newX + "px";
        element.style.top = newY + "px";
    });

    document.addEventListener("mouseup", function () {
        isDragging = false;
        element.style.cursor = "grab";
    });
}

makeDraggable(
    document.getElementById("boxInside"),
    document.getElementById("relativeContainer")
);

makeDraggable(
    document.getElementById("boxWindow")
);