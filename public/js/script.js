



/*console.log("Script Loaded");

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {

        navLinks.classList.toggle("active");
        menuToggle.classList.toggle("active");

        if (navLinks.classList.contains("active")) {
            menuToggle.innerHTML = "✖";
        } else {
            menuToggle.innerHTML = "☰";
        }

    });

    // Link click hone par menu band ho jayega
    document.querySelectorAll(".nav-links a").forEach(link => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("active");
            menuToggle.classList.remove("active");
            menuToggle.innerHTML = "☰";

        });

    });

} */


//     console.log("Script Loaded");

// const menuToggle = document.querySelector(".menu-toggle");
// const navLinks = document.querySelector(".nav-links");
// const overlay = document.querySelector(".nav-overlay");

// if (menuToggle && navLinks && overlay) {

//     menuToggle.addEventListener("click", () => {

//         navLinks.classList.toggle("active");
//         overlay.classList.toggle("active");

//         if (navLinks.classList.contains("active")) {
//             menuToggle.innerHTML = "✖";
//         } else {
//             menuToggle.innerHTML = "☰";
//         }

//     });

//     // Link click
//     document.querySelectorAll(".nav-links a").forEach(link => {

//         link.addEventListener("click", () => {

//             navLinks.classList.remove("active");
//             overlay.classList.remove("active");
//             menuToggle.innerHTML = "☰";

//         });

//     });

//     // Outside click
//     overlay.addEventListener("click", () => {

//         navLinks.classList.remove("active");
//         overlay.classList.remove("active");
//         menuToggle.innerHTML = "☰";

//     });

// }


console.log("Script Loaded");

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const overlay = document.querySelector(".nav-overlay");

if (menuToggle && navLinks && overlay) {

    // Toggle Menu
    menuToggle.addEventListener("click", () => {

        navLinks.classList.toggle("active");
        overlay.classList.toggle("active");

        menuToggle.innerHTML =
            navLinks.classList.contains("active") ? "✖" : "☰";

    });

    // Close on Link Click
    document.querySelectorAll(".nav-links a").forEach(link => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("active");
            overlay.classList.remove("active");
            menuToggle.innerHTML = "☰";

        });

    });

    // Close on Overlay Click
    overlay.addEventListener("click", () => {

        navLinks.classList.remove("active");
        overlay.classList.remove("active");
        menuToggle.innerHTML = "☰";

    });

}