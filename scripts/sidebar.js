const toggleButton = document.getElementById("toggle-btn");
const sidebar = document.getElementById("sidebar");

function toggleSidebar() {
  sidebar.classList.toggle("close");
  toggleButton.classList.toggle("rotate");

  closeAllSubMenus();
}

function toggleSubMenu(button) {
  if (!button.nextElementSibling.classList.contains("show")) {
    closeAllSubMenus();
  }

  button.nextElementSibling.classList.toggle("show");
  button.classList.toggle("rotate");

  if (sidebar.classList.contains("close")) {
    sidebar.classList.toggle("close");
    toggleButton.classList.toggle("rotate");
  }
}

function closeAllSubMenus() {
  Array.from(sidebar.getElementsByClassName("show")).forEach((ul) => {
    ul.classList.remove("show");
    ul.previousElementSibling.classList.remove("rotate");
  });
}

// Camera Search Bar
// Manufacturer and Model Data
const cameraModels = {
  ACTi: ["A71", "B55", "E97"],
  "Al Base": ["AL-100", "AL-200"],
  "ALIBI Security": ["ALI-IPV", "ALI-DOME"],
  Ajax: ["CAM-10", "CAM-20"],
  Amcrest: ["IP5M-T1179EW", "IP8M-2496EB"],
  Annke: ["NC800", "C800"],
  Avigilon: ["H4A-B", "H5A-PTZ"],
};

// Track selected manufacturer
let selectedManufacturer = null;

// Existing toggleSidebar, toggleSubMenu, closeAllSubMenus functions remain unchanged...

// Manufacturer Search
function manufacturerSearch() {
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById("camera-search");
  filter = input.value.toUpperCase();
  ul = document.getElementById("camera-manufacturer-options");
  li = ul.getElementsByTagName("li");
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function toggleList() {
  var ul = document.getElementById("camera-manufacturer-options");
  ul.style.display = ul.style.display === "block" ? "none" : "block";
}

// Select Manufacturer
function selectManufacturer(manufacturer) {
  selectedManufacturer = manufacturer;
  document.getElementById("camera-search").value = manufacturer;
  document.getElementById("camera-manufacturer-options").style.display = "none";
  document.getElementById("model-search").disabled = false; // Enable model search
  populateModelOptions(manufacturer);
}

// Populate Model Options
function populateModelOptions(manufacturer) {
  const ul = document.getElementById("camera-model-options");
  ul.innerHTML = ""; // Clear existing options
  const models = cameraModels[manufacturer] || [];
  models.forEach((model) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = model;
    a.onclick = () => selectModel(model);
    li.appendChild(a);
    ul.appendChild(li);
  });
}

// Select Model
function selectModel(model) {
  document.getElementById("model-search").value = model;
  document.getElementById("camera-model-options").style.display = "none";
}

// Model Search
function modelSearch() {
  if (!selectedManufacturer) return;
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById("model-search");
  filter = input.value.toUpperCase();
  ul = document.getElementById("camera-model-options");
  li = ul.getElementsByTagName("li");
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function toggleModelList() {
  if (!selectedManufacturer) return;
  var ul = document.getElementById("camera-model-options");
  ul.style.display = ul.style.display === "block" ? "none" : "block";
}

// Hide lists when clicking outside
document.addEventListener("click", function (event) {
  var manufacturerInput = document.getElementById("camera-search");
  var manufacturerUl = document.getElementById("camera-manufacturer-options");
  var modelInput = document.getElementById("model-search");
  var modelUl = document.getElementById("camera-model-options");

  if (!manufacturerInput.contains(event.target) && !manufacturerUl.contains(event.target)) {
    manufacturerUl.style.display = "none";
  }
  if (!modelInput.contains(event.target) && !modelUl.contains(event.target)) {
    modelUl.style.display = "none";
  }
});

// Reset model search when manufacturer search is cleared
document.getElementById("camera-search").addEventListener("input", function () {
  if (!this.value) {
    selectedManufacturer = null;
    document.getElementById("model-search").disabled = true;
    document.getElementById("model-search").value = "";
    document.getElementById("camera-model-options").innerHTML = "";
  }
});
