const world = document.getElementById("world");
const loaderArm = document.getElementById("loaderArm");
const loaderForks = document.getElementById("loaderForks");

function startDriving() {
    world.classList.add("driving");
}

function stopDriving() {
    world.classList.remove("driving");
}


const message = document.getElementById("message");

message.textContent = "Let's go!";
startDriving();

setTimeout(() => {
    stopDriving();
    message.textContent = "We're here!";
}, 5000);

const dumpsters = document.querySelectorAll(".dumpster");

dumpsters.forEach(dumpster => {

    dumpster.addEventListener("click", () => {

        const answer = dumpster.dataset.answer;

        console.log("Orion picked:", answer);

        if (answer === "7") {

            //Hide the wrong dumpsters
            dumpsters.forEach(otherDumpster => {
                if (otherDumpster !== dumpster) {
                    otherDumpster.classList.add("wrongChoice");
                }
            });

            const dumpsterRect =
                dumpster.getBoundingClientRect();

            const pickupRect =
                document.getElementById("pickupPoint")
                        .getBoundingClientRect();

            const dumpsterCenterX =
                dumpsterRect.left + dumpsterRect.width / 2;

            const dumpsterCenterY =
                dumpsterRect.top + dumpsterRect.height / 2;

            const pickupCenterX =
                pickupRect.left + pickupRect.width / 2;

            const pickupCenterY =
                pickupRect.top + pickupRect.height / 2;

            const moveX =
                pickupCenterX - dumpsterCenterX;

            const moveY =
                pickupCenterY - dumpsterCenterY;

            dumpster.style.setProperty(
                "--move-x",
                moveX + "px"
            );

            dumpster.style.setProperty(
                "--move-y",
                moveY + "px"
            );

            dumpster.classList.add("selected");

            // Wait until dumpster finishes moving to truck
            dumpster.addEventListener("animationend", () => {

                console.log("Dumpster arrived at truck");

                // Listen BEFORE starting the forks
                loaderForks.addEventListener("transitionend", () => {

                    console.log("Forks are under the dumpster!");

                    const dumpsterRect =
                        dumpster.getBoundingClientRect();

                    const forksRect =
                        loaderForks.getBoundingClientRect();

                    // Make dumpster a child of the forks
                    loaderForks.appendChild(dumpster);

                    dumpster.classList.remove("selected");

                    dumpster.style.position = "absolute";

                    dumpster.style.left =
                        (dumpsterRect.left - forksRect.left) + "px";

                    dumpster.style.top =
                        (dumpsterRect.top - forksRect.top) + "px";

                    dumpster.style.transform = "none";

                    console.log("Dumpster attached to forks!");

       
    function armReachedTop(event) {

        // Ignore events coming from child elements
        if (event.target !== loaderArm ||
            event.propertyName !== "transform") {
            return;
        }

        // Remove listener only after the ARM finishes
        loaderArm.removeEventListener(
            "transitionend",
            armReachedTop
        );

        console.log("Loader reached the top!");

        // Listen for the forks to finish tipping
        function forksFinishedTipping(event) {

            if (event.target !== loaderForks ||
                event.propertyName !== "transform") {
                return;
            }

            loaderForks.removeEventListener(
                "transitionend",
                forksFinishedTipping
            );

            console.log("Dumpster finished tipping!");

            dumpNumber(dumpster);
        }

        loaderForks.addEventListener(
            "transitionend",
            forksFinishedTipping
        );

        // Tip the dumpster
        loaderForks.classList.add("dumping");
    }

    loaderArm.addEventListener(
        "transitionend",
        armReachedTop
    );

                loaderArm.classList.add("lifting");
                }, { once: true }); // Forks extended

                // Start extending the forks
                loaderArm.classList.add("forksOut");

            }, { once: true }); // Dumpster arrived

        } // End if answer === "7"

    }); // End click listener

}); // End dumpsters.forEach

function dumpNumber(dumpster) {

    console.log("Dumping number!");

    const number = document.createElement("div");

    number.className = "dumpedNumber";
    number.textContent = dumpster.dataset.answer;

    // Hide the original number in the dumpster
    dumpster.style.color = "transparent";

    // Find the dumpster's current position
    const rect = dumpster.getBoundingClientRect();

    // Put the falling number in the world
    world.appendChild(number);

    const worldRect = world.getBoundingClientRect();

    number.style.left =
        (rect.left + rect.width / 2 - worldRect.left) + "px";

    number.style.top =
        (rect.top - worldRect.top) + "px";

number.addEventListener("animationend", () => {

    console.log("Number landed in truck!");

    number.remove();

    // Wait for the arm to reach the bottom
    function armReachedBottom(event) {

        if (event.target !== loaderArm ||
            event.propertyName !== "transform") return;

        loaderArm.removeEventListener(
            "transitionend",
            armReachedBottom
        );

        console.log("Loader reached the bottom!");

    }

    // Listen BEFORE lowering
    loaderArm.addEventListener(
        "transitionend",
        armReachedBottom
    );

    // Now lower the arm
    loaderArm.classList.remove("lifting");

        // Return forks from 30° to 0°
        loaderForks.classList.remove("dumping");

    }, { once: true });

}

//const loaderArm = document.getElementById("loaderArm");

//setTimeout(() => {
//    loaderArm.classList.add("lifting");
//        loaderArm.classList.add("forksOut");
//}, 2000);