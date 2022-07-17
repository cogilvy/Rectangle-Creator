// Cached Elements
const mainEl = document.querySelector('.container');
const prevLayoutsContainer = document.getElementById('prev-layouts');
const colorSelector = document.getElementById('color-selector');
const saveButton = document.getElementById('save-layout');
const clearButton = document.getElementById('clear');
const layoutNameInput = document.getElementById('layout-name');
const deleteRectBtn = document.getElementById('delete-rect');
const applyColorBtn = document.getElementById('apply-color');

// Event Listeners
mainEl.addEventListener('mousedown', handleMouseDown);
mainEl.addEventListener('mousemove', handleMouseMove);
mainEl.addEventListener('mouseup', handleMouseUp);

// State Variables
let currentRect;
let startX;
let startY;
let endX;
let endY;
let isMouseDown;
let layout = [];


// Functions
function handleMouseDown(evt) {
  if (evt.target.classList.contains('rectangle')) return;
  const idNum = document.querySelectorAll('.rectangle').length+1;
  isMouseDown = true;
  startX = evt.pageX;
  startY = evt.pageY;
  currentRect = document.createElement('div');
  currentRect.id = `r-${idNum}`;
  currentRect.classList.add('rectangle');
  currentRect.style.backgroundColor = colorSelector.value;
  currentRect.style.left = `${startX}px`;
  currentRect.style.top = `${startY}px`;
  mainEl.appendChild(currentRect);
}
  
function handleMouseMove(evt) {
  if (!isMouseDown) return;
  endX = evt.pageX;
  endY = evt.pageY;
  currentRect.style.width = `${endX - startX}px`;
  currentRect.style.height = `${endY - startY}px`;
}

function handleMouseUp(evt) {
  if (!isMouseDown) return;
  let rect = {id: currentRect.id, startX, startY, endX, endY, color: colorSelector.value};
  layout.push(rect);
  isMouseDown = false;
  currentRect = null;
  console.log(layout);
}