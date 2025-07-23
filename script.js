const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const eraserBtn = document.getElementById('eraserBtn');
const undoBtn = document.getElementById('undoBtn');

let isDrawing = false;
let isErasing = false;
let undoStack = [];

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - document.querySelector('.toolbar').offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);
canvas.addEventListener('mousemove', draw);

function startDrawing(e) {
  isDrawing = true;
  saveState(); // Save before new stroke
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY - toolbarHeight());
}

function stopDrawing() {
  isDrawing = false;
  ctx.beginPath();
}

function draw(e) {
  if (!isDrawing) return;

  ctx.lineWidth = brushSize.value;
  ctx.lineCap = 'round';
  ctx.strokeStyle = isErasing ? '#ffffff' : colorPicker.value;

  ctx.lineTo(e.clientX, e.clientY - toolbarHeight());
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY - toolbarHeight());
}

// Helpers
function toolbarHeight() {
  return document.querySelector('.toolbar').offsetHeight;
}

function saveState() {
  undoStack.push(canvas.toDataURL());
  if (undoStack.length > 10) undoStack.shift(); // limit stack size
}

// Clear canvas
clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  undoStack = [];
});

// Save canvas
saveBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.toDataURL();
  link.click();
});

// Eraser toggle
eraserBtn.addEventListener('click', () => {
  isErasing = !isErasing;
  eraserBtn.style.backgroundColor = isErasing ? '#ddd' : '';
});

// Undo
undoBtn.addEventListener('click', () => {
  if (undoStack.length === 0) return;
  const imgData = undoStack.pop();
  const img = new Image();
  img.src = imgData;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
});
