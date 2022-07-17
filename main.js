// Cached Elements
const mainEl = document.querySelector('.container');
const prevLayoutsContainer = document.getElementById('prev-layouts');
const colorSelector = document.getElementById('color-selector');
const saveButton = document.getElementById('save-layout');
const clearButton = document.getElementById('clear');
const layoutNameInput = document.getElementById('layout-name');
const deleteRectBtn = document.getElementById('delete-rect');
const applyColorBtn = document.getElementById('apply-color');

window.addEventListener('click', closeModal);

// Event Listeners
function closeModal() {
  window.removeEventListener('click', closeModal);
  document.getElementById('modal').remove();
  mainEl.addEventListener('mousedown', handleMouseDown);
  mainEl.addEventListener('mousemove', handleMouseMove);
  mainEl.addEventListener('mouseup', handleMouseUp);
  mainEl.addEventListener('click', selectRectangle);
  saveButton.addEventListener('click', saveCurrentLayout);
  clearButton.addEventListener('click', clearLayout);
  prevLayoutsContainer.addEventListener('click', selectSavedLayout);
  deleteRectBtn.addEventListener('click', deleteRectangle);
  applyColorBtn.addEventListener('click', applyColor);
}

// State Variables
let selectedRect;
let currentRect;
let startX;
let startY;
let endX;
let endY;
let isMouseDown;
let isResizing;
let isDragging;
let layout = [];
let savedLayouts = [];

// Functions

// CREATE RECTANGLE
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



// SAVE & RENDER LAYOUTS
function saveCurrentLayout(evt) {
  if (!layout.length) return;
  const name = layoutNameInput.value;
  savedLayouts.push({layout, name});
  localStorage.setItem('layouts', JSON.stringify(savedLayouts));
  renderSavedLayouts();
}

function loadLayoutsFromLocalStorage() {
  let previousLayouts = localStorage.getItem('layouts');
  if (previousLayouts) {
    previousLayouts = JSON.parse(previousLayouts);
    savedLayouts.push(...previousLayouts);
    renderSavedLayouts();
  }
}
loadLayoutsFromLocalStorage(); // Invoke here to load layouts on page load.

function renderSavedLayouts() {
  prevLayoutsContainer.innerHTML = '';
  if (savedLayouts.length) {
    savedLayouts.forEach(function(layout) {
      const row = `
      <tr>
        <td>${layout.name}</td>
        <td><button id="${layout.name}" class="btn saved">View</button></td>
        <td><button id="${layout.name}" class="btn del">Del</button></td>
      </tr>
      `;
      prevLayoutsContainer.innerHTML += row;
    });
  } else {
    prevLayoutsContainer.innerHTML = `<h4 style="text-align: center;">Create and save some layouts to add to your list!</h4>`;
  }
}

function selectSavedLayout(evt) {
  if (evt.target.classList.contains('del')) return deleteLayout(evt);
  if (!evt.target.classList.contains('saved')) return;
  const selected = savedLayouts.find(layout => layout.name === evt.target.id);
  renderLayout(selected.layout);
  layout = [...selected.layout];
}

function renderLayout(layout) {
  clearLayout();
  layout.forEach(rectangle => {
    let rect = document.createElement('div');
    rect.id = rectangle.id;
    rect.classList.add('rectangle');
    rect.style.backgroundColor = rectangle.color;
    rect.style.left = `${rectangle.startX}px`;
    rect.style.top = `${rectangle.startY}px`;
    rect.style.width = `${rectangle.endX - rectangle.startX}px`;
    rect.style.height = `${rectangle.endY - rectangle.startY}px`;
    mainEl.appendChild(rect);
  });
}

function deleteLayout(evt) {
  const tr = evt.target.parentNode.parentNode;
  savedLayouts = savedLayouts.filter(layout => layout.name !== evt.target.id);
  tr.remove()
  localStorage.setItem('layouts', JSON.stringify(savedLayouts));
  renderSavedLayouts();
}



// EDIT LAYOUT
function clearLayout(evt) {
  mainEl.innerHTML = '';
  layout = [];
  isDragging = false;
  isResizing = false;
  isMouseDown = false;
  selectedRect = null;
}

function deleteRectangle() {
  if (!selectedRect) return;
  layout = layout.filter(r => r.id !== selectedRect.id);
  selectedRect.remove();
  selectedRect = null;
}

function applyColor() {
  if (!selectedRect) return;
  selectedRect.style.backgroundColor = colorSelector.value;
  const rect = layout.find(r => r.id === selectedRect.id);
  rect.color = colorSelector.value;
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