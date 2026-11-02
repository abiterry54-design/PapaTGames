const viewport = document.getElementById("viewport");
const world = document.getElementById("world");

console.log("Papa T's Construction World is ready!");
console.log("World height:", world.offsetHeight);
console.log("Viewport height:", viewport.clientHeight);

class Equipment {
    constructor(element, world) {
        this.element = element;
        this.world = world;
    }

    moveTo(x, y) {
        // Keep the equipment inside the world boundaries.
        const maxX = Math.max(
            0,
            this.world.clientWidth - this.element.offsetWidth
        );

        const maxY = Math.max(
            0,
            this.world.clientHeight - this.element.offsetHeight
        );

        this.x = Math.max(0, Math.min(x, maxX));
        this.y = Math.max(0, Math.min(y, maxY));

        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";
    }
}

class EquipmentManager {
    constructor() {
        this.machines = new Map();
    }

    add(machine) {
        const id = machine.element.id;
        this.machines.set(id, machine);
    }

    get(id) {
        return this.machines.get(id);
    }

    count() {
        return this.machines.size;
    }
}



class WorldController {
    constructor(viewport, world) {
        this.activePointerId = null;
        this.viewport = viewport;
        this.world = world;

        // The machine currently being dragged
        this.activeEquipment = null;

        // Finger position
        this.fingerX = 0;
        this.fingerY = 0;

        // Where the finger grabbed the machine
        this.grabX = 0;
        this.grabY = 0;

        // Scrolling settings
        this.edgeZone = 80;
        this.maxScrollSpeed = 7;
        this.scrollAnimation = null;
    }

    moveActiveEquipment() {
        if (!this.activeEquipment) return;

        const worldRect = this.world.getBoundingClientRect();

        const x = this.fingerX - worldRect.left - this.grabX;
        const y = this.fingerY - worldRect.top - this.grabY;

        this.activeEquipment.moveTo(x, y);
    }

    startDrag(equipment, event) {
        if (this.activeEquipment) return;

        this.activeEquipment = equipment;
        this.activePointerId = event.pointerId;

        const rect = equipment.element.getBoundingClientRect();

        this.grabX = event.clientX - rect.left;
        this.grabY = event.clientY - rect.top;

        this.fingerX = event.clientX;
        this.fingerY = event.clientY;

        equipment.element.setPointerCapture(event.pointerId);

        this.scrollAnimation = requestAnimationFrame(
            () => this.autoScroll()
        );

        console.log("Picked up equipment!");
    }

    drag(event) {
        if (!this.activeEquipment ||
            event.pointerId !== this.activePointerId) return;

        this.fingerX = event.clientX;
        this.fingerY = event.clientY;

        this.moveActiveEquipment();
    }

    stopDrag(event) {
        if (!this.activeEquipment ||
            event.pointerId !== this.activePointerId) return;

        this.activeEquipment = null;
        this.activePointerId = null;

        if (this.scrollAnimation !== null) {
            cancelAnimationFrame(this.scrollAnimation);
            this.scrollAnimation = null;
        }

        console.log("Equipment parked!");
    }

    autoScroll() {
        if (!this.activeEquipment) {
            this.scrollAnimation = null;
            return;
        }

        const rect = this.viewport.getBoundingClientRect();

        const distanceFromTop = this.fingerY - rect.top;
        const distanceFromBottom = rect.bottom - this.fingerY;

        let speed = 0;

        if (distanceFromTop < this.edgeZone) {
            speed = -this.maxScrollSpeed *
                (1 - Math.max(0, distanceFromTop) / this.edgeZone);
        }
        else if (distanceFromBottom < this.edgeZone) {
            speed = this.maxScrollSpeed *
                (1 - Math.max(0, distanceFromBottom) / this.edgeZone);
        }

        if (speed !== 0) {
            this.viewport.scrollTop += speed;
            this.moveActiveEquipment();
        }

        this.scrollAnimation = requestAnimationFrame(
            () => this.autoScroll()
        );
    }

}

const controller = new WorldController(viewport, world);
const equipmentManager = new EquipmentManager();

async function loadEquipment() {
    try {
        const response = await fetch("equipment.json");

        if (!response.ok) {
            throw new Error("Unable to load equipment.json");
        }

        const data = await response.json();

for (const item of data.equipment) {
        for (let i = 1; i <= item.count; i++) {

            const img = document.createElement("img");

            img.id = `${item.type}${i}`;
            img.className = "equipment";
            img.src = item.image;
            img.alt = item.type;
            img.draggable = false;
            img.style.width = item.width + "px";

            world.appendChild(img);

            const machine = new Equipment(img, world);
            equipmentManager.add(machine);

            // Wait until the image dimensions are available.
            await img.decode();

            // Random position anywhere in the world.
            const maxX = Math.max(0, world.clientWidth - img.offsetWidth);
            const maxY = Math.max(0, world.clientHeight - img.offsetHeight);

            const x = Math.random() * maxX;
            const y = Math.random() * maxY;

            machine.moveTo(x, y);

            img.addEventListener("pointerdown", event => {
                controller.startDrag(machine, event);
            });

            img.addEventListener("pointermove", event => {
                controller.drag(event);
            });

            img.addEventListener("pointerup", event => {
                controller.stopDrag(event);
            });

            img.addEventListener("pointercancel", event => {
                controller.stopDrag(event);
            });
        }
}

        console.log("Equipment loaded:", equipmentManager.count());

        console.log(
            "Papa T Construction fleet:",
            equipmentManager.count(),
            "machines ready!"
        );

    } catch (error) {
        console.error("Equipment loading failed:", error);
    }
}

loadEquipment();

