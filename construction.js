const viewport = document.getElementById("viewport");
const world = document.getElementById("world");

console.log("Papa T's Construction World is ready!");
console.log("World height:", world.offsetHeight);
console.log("Viewport height:", viewport.clientHeight);

viewport.addEventListener("scroll", () => {
    console.log("Scroll position:", viewport.scrollTop);
});


const excavator = document.getElementById("excavator");

let dragging = false;
let grabX = 0;
let grabY = 0;

excavator.addEventListener("pointerdown", (event) => {
    dragging = true;

    // Remember where the finger grabbed the excavator.
    const rect = excavator.getBoundingClientRect();

    grabX = event.clientX - rect.left;
    grabY = event.clientY - rect.top;

    excavator.setPointerCapture(event.pointerId);

    console.log("Picked up excavator!");
});

excavator.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const worldRect = world.getBoundingClientRect();

    // Convert screen coordinates into world coordinates.
    const x = event.clientX - worldRect.left - grabX;
    const y = event.clientY - worldRect.top - grabY;

    excavator.style.left = x + "px";
    excavator.style.top = y + "px";
});

excavator.addEventListener("pointerup", () => {
    dragging = false;
    console.log("Excavator parked!");
});

excavator.addEventListener("pointercancel", () => {
    dragging = false;
});
