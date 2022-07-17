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
mainEl.addEventListener('click', selectRectangle);

// State Variables
let currentRect;
let startX;
let startY;
let endX;
let endY;
let isMouseDown;
let isResizing;
let isDragging;
let layout = [];



// Functions
function handleMouseDown(evt) {
  if (evt.target.classList.contains('rectangle') || isDragging || isResizing) return;
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
  if (!isMouseDown || isDragging || isResizing) return;
  endX = evt.pageX;
  endY = evt.pageY;
  currentRect.style.width = `${endX - startX}px`;
  currentRect.style.height = `${endY - startY}px`;
}

function handleMouseUp(evt) {
  if (!isMouseDown || isDragging || isResizing) return;
  let rect = {id: currentRect.id, startX, startY, endX, endY, color: colorSelector.value};
  layout.push(rect);
  isMouseDown = false;
  currentRect = null;
}







// SELECT & DRAG RECTANGLE
function selectRectangle(evt) {
  if (!evt.target.classList.contains('rectangle')) return;
  selectedRect = evt.target;
  selectedRect.classList.add('selected');
  const allRectangles = document.querySelectorAll('.rectangle');
  allRectangles.forEach(rect => {
    if (rect.id !== evt.target.id) {
      rect.classList.remove('selected');
      rect.innerHTML = '';
    }
  });
  selectedRect.addEventListener('mousedown', handleMouseDownDRAG);
  selectedRect.innerHTML = `
    <div class="resizer ne"></div>
    <div class="resizer nw"></div>
    <div class="resizer se"></div>
    <div class="resizer sw"></div>`;

  const resizers = document.querySelectorAll('.resizer');
  let currentResizer;
  
  resizers.forEach(resizer => {
    resizer.addEventListener('mousedown', handleMouseDown);
  
    function handleMouseDown(evt) {
      isResizing = true;
      currentResizer = evt.target;
  
      let prevX = evt.pageX;
      let prevY = evt.pageY;
  
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
  
      function handleMouseMove(evt) {
        const rect = selectedRect.getBoundingClientRect();
  
        if (currentResizer.classList.contains('se')) {
          selectedRect.style.width = `${rect.width - (prevX - evt.pageX)}px`;
          selectedRect.style.height = `${rect.height - (prevY - evt.pageY)}px`;
        } 
        else if (currentResizer.classList.contains('sw')) {
          selectedRect.style.width = `${rect.width + (prevX - evt.pageX)}px`;
          selectedRect.style.height = `${rect.height - (prevY - evt.pageY)}px`;
          selectedRect.style.left = `${rect.left - (prevX - evt.pageX)}px`;
        } 
        else if (currentResizer.classList.contains('ne')) {
          selectedRect.style.width = `${rect.width - (prevX - evt.pageX)}px`;
          selectedRect.style.height = `${rect.height + (prevY - evt.pageY)}px`;
          selectedRect.style.top = `${rect.top - (prevY - evt.pageY)}px`;
        } 
        else if (currentResizer.classList.contains('nw')) {
          selectedRect.style.width = `${rect.width + (prevX - evt.pageX)}px`;
          selectedRect.style.height = `${rect.height + (prevY - evt.pageY)}px`;
          selectedRect.style.left = `${rect.left - (prevX - evt.pageX)}px`;
          selectedRect.style.top = `${rect.top - (prevY - evt.pageY)}px`;
        }
        prevX = evt.pageX;
        prevY = evt.pageY;
      }
  
      function handleMouseUp() {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        isResizing = false;
      }
    }
  });
  

  function handleMouseDownDRAG(evt) {
    mainEl.removeEventListener('mouseup', handleMouseUp);
    if (isResizing) return;
    isDragging = true;
    // We are adding these event listeners to the entire window, because sometimes
    // our mouse might not be dragging on top of the div.
    window.addEventListener('mousemove', handleMouseMoveDRAG);
    window.addEventListener('mouseup', handleMouseUpDRAG);
  
    // evt.pageX/Y is the location of the mouse on the X/Y axis
    let prevX = evt.pageX;
    let prevY = evt.pageY;
  
    function handleMouseMoveDRAG(evt) {
      if (!isDragging) return;
      let newX = prevX - evt.pageX;
      let newY = prevY - evt.pageY;
  
      const rect = selectedRect.getBoundingClientRect();
      const conRect = mainEl.getBoundingClientRect();
      const newLeft = rect.left - newX;
      const newTop = rect.top - newY;
      if (
        newLeft === conRect.left ||
        newTop === conRect.top
        ) {
          return handleMouseUpDRAG();
        }
  
      selectedRect.style.left = `${newLeft}px`; // 200 - (-1) = 201   MOVED RIGHT
      selectedRect.style.top = `${newTop}px`;   // 150 - 1 = 149      MOVED UP 
      prevX = evt.pageX;
      prevY = evt.pageY;
    }
  
    function handleMouseUpDRAG(evt) {
      window.removeEventListener('mousemove', handleMouseMoveDRAG);
      window.removeEventListener('mouseup', handleMouseUpDRAG);
      mainEl.addEventListener('mouseup', handleMouseUp);
      isDragging = false;
    }
  }
}