const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");
const clearBtn = document.getElementById("clear");
const saveBtn = document.getElementById("save");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");

let drawing = false;
let history = [];
let redoStack = [];

// Apply default brush settings
ctx.strokeStyle = colorPicker.value;
ctx.lineWidth = brushSize.value;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - document.querySelector(".toolbar").offsetHeight;
  const bg = getComputedStyle(document.body).getPropertyValue("--bg").trim();
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function startDraw(e) {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}

function endDraw() {
  if (!drawing) return;
  drawing = false;
  ctx.closePath();
  saveHistory();
}

// Mouse events
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("mouseout", endDraw);

// History management
function saveHistory() {
  history.push(canvas.toDataURL());
  if (history.length > 50) history.shift(); // limit history to 50
  redoStack = [];
}

function restore(dataURL) {
  const img = new Image();
  img.src = dataURL;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
}

undoBtn.onclick = () => {
  if (history.length > 0) {
    redoStack.push(history.pop());
    const last = history[history.length - 1];
    if (last) restore(last);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

redoBtn.onclick = () => {
  const redoItem = redoStack.pop();
  if (redoItem) {
    history.push(redoItem);
    restore(redoItem);
  }
};

clearBtn.onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  saveHistory();
};

saveBtn.onclick = () => {
  const link = document.createElement("a");
  link.download = "drawing.png";
  link.href = canvas.toDataURL();
  link.click();
  showToast("Saved!");
};

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  resizeCanvas();
  restore(history[history.length - 1]); // reapply drawing after theme change
};

// Update brush settings when user changes inputs
colorPicker.addEventListener("input", () => {
  ctx.strokeStyle = colorPicker.value;
});
brushSize.addEventListener("change", () => {
  ctx.lineWidth = brushSize.value;
});

// Toast message
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// Initialize
saveHistory();
