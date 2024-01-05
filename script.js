///////////////////////////////////////////////////////////////////////
let movesCount = 0,
  fieldSizeInPx = 600,
  firstStart = true,
  disabled = true;

const menuItems = [ "New Game", "Best Scores", "Rules", "Settings" ];
const statsItems = [ "Time", "Moves", "Pause Game" ];
const bestScoresItems = [ "Date", "Moves", "Size", "Time" ];
const pathToPicture = 'assets/';
const pictureArray = ['1.jpg', '2.jpg','3.jpg','4.jpg','5.jpg','6.jpg','7.jpg','8.jpg'];

size = getSize();
let count = Math.pow(size, 2) - 1;
let numbers = [];
let bestScores = getBestScores();
let savedGame = getSavedGame();

const timer = {
  sec: 0,
  min: 0,
  tick: null,
};
const cellSizes = {
  "3x3": 200,
  "4x4": 150,
  "5x5": 120,
  "6x6": 100,
  "7x7": 85.8,
  "8x8": 75,
};
const empty = {
  value: Math.pow(size, 2),
  left: size - 1,
  top: size - 1,
};
const settings = {
  sound: true,
  type: 'numbers'
}

let cells = [];
cells.push(empty);
//////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////
const img = document.createElement('img');
img.width = 450;
img.style.cssText = `position: fixed;
                     top: 100px;
                     left: 100px;
                     border-radius: 5px;`;
img.classList.add('img--hidden');
document.body.append(img);

const movingCell = document.createElement("audio");
movingCell.setAttribute("src", "move-cell.mp3");
movingCell.setAttribute("data", "cell");
document.body.append(movingCell);

const pushButton = document.createElement("audio");
pushButton.setAttribute("src", "menu-sound.mp3");
document.body.append(pushButton);

const winGame = document.createElement("audio");
winGame.setAttribute("src", "win-sound.mp3");
document.body.append(winGame);

const stats = document.createElement("div");
stats.classList.add("stats-board");
stats.appendChild(createStatsItems());
document.body.appendChild(stats);

const field = document.createElement("div");
field.classList.add("game-board");
document.body.appendChild(field);

const overlay = document.createElement("div");
overlay.classList.add("overlay");
field.append(overlay);

const menu = document.createElement("div");
menu.className = "menu";
menu.appendChild(createMenuItems());
overlay.append(menu);

const bestScoresPage = document.createElement("div");
bestScoresPage.classList.add("best-scores", "object--hidden");

const settingsPage = document.createElement("div");
settingsPage.classList.add("settings", "object--hidden");
settingsPage.appendChild(createSettingsItems());
overlay.append(settingsPage);

const rulesPage = document.createElement("div");
rulesPage.classList.add("rules", "object--hidden");
rulesPage.appendChild(createRulesItems());
overlay.append(rulesPage);

const confirmWindow = document.createElement("div");
confirmWindow.classList.add("confirm-window", "object--hidden");
confirmWindow.appendChild(createConfirmItems());
overlay.append(confirmWindow);

const winCard = document.createElement('div');
winCard.classList.add("win-card", "object--hidden");

const imgSaveButton = document.createElement('img');
imgSaveButton.className = 'save-button';
imgSaveButton.src = 'assets/save.png';
imgSaveButton.width = 60;
overlay.append(imgSaveButton);

const imgOpenSavedGame = document.createElement('img');
imgOpenSavedGame.src = 'assets/enter.png';
imgOpenSavedGame.classList.add('img--hidden', 'open-button')
imgOpenSavedGame.width = 60;
overlay.append(imgOpenSavedGame);

//////////////////////////////////////////////////////////////////


/////////////////////////////////////////////
function getSize(){
  const sizeFromStorage = (localStorage.getItem('size') === null) ? 4 : localStorage.getItem('size');
  return sizeFromStorage;
}

function getSelectedValue(){
  const selectedValue = document.querySelector('.select').value;
  const options = document.querySelectorAll('.option');
  options.forEach(item =>{
    if(item.innerHTML === selectedValue){
      item.selected = true;
    }
  })
  localStorage.setItem('size', selectedValue);
}

function getBestScores(){
  const bestScoresArray = (localStorage.getItem('bestScores') === null) ? [] : JSON.parse(localStorage.getItem('bestScores'));
  return bestScoresArray;
}

function getSavedGame(){
  if(localStorage.getItem('savedGame') !== null){
    imgOpenSavedGame.classList.toggle('img--hidden');
    return JSON.parse(localStorage.getItem('savedGame'));
  }
}
/////////////////////////////////////////////


/////////////////////////////////////////////
function createStatsItems() {
  let fragment = new DocumentFragment();
  statsItems.forEach((item) => {
    const statsItem = document.createElement("div");
    switch (item) {
      case "Time":
        describeElement(statsItem, `Time ${addZero(timer.min)}<span>:</span>${addZero(timer.sec)}`, 'time');
        break;

      case "Moves":
        describeElement(statsItem, `Moves ${movesCount}`, 'moves');
        break;
    
      case "Pause Game":
        describeElement(statsItem, 'Pause Game', 'pause-button');
        statsItem.addEventListener("click", () => {
            playSound('pause');
          if (statsItem.innerHTML === "Resume Game") {
            changeVisibility(overlay);
            changeVisibility(menu);
            resumeTimer();
            statsItem.innerHTML = "Pause Game";
            if(settings.type === 'pictures'){
              img.classList.toggle('img--hidden');
            }
          } 
          else {
            changeVisibility(overlay);
            changeVisibility(menu);
            statsItem.innerHTML = "Resume Game";
            stopTimer();
            if(settings.type === 'pictures'){
              img.classList.toggle('img--hidden');
            }          }
        });
        break;
    }
    fragment.appendChild(statsItem);
  });
  return fragment;
}

function createMenuItems() {
  let fragment = new DocumentFragment();
  menuItems.forEach((item) => {
    const menuItem = document.createElement("button");
    switch (item) {
      case "New Game":
        describeElement(menuItem, item, 'menu__item');
        menuItem.addEventListener("click", () => {
            size = getSize();
            count = (size * size) - 1;
            numbers = [...Array(count).keys()]
                .sort(() => Math.random() - 0.5);
          playSound("menu");
          if(firstStart){
            img.classList.add('img--hidden');
            startTimer();
            const elements = document.querySelectorAll(".cell");
            elements.forEach((item) => {
              item.remove();
            });
            changeVisibility(menu);
            changeVisibility(overlay);
            fillArea(size);
            toggleBeginning();
          }
          else{
            changeVisibility(confirmWindow);
            changeVisibility(menu);
          }
          if(disabled){
            disabled = !disabled;
            stats.style.cssText = "pointer-events: all;";
          }
          if(settings.type === 'pictures'){
            img.classList.toggle('img--hidden');
          }
        });
        break;
  
      case "Best Scores":
        describeElement(menuItem, item, 'menu__item');
        menuItem.addEventListener("click", () => {
          const title = document.querySelector('.best-scores>div');
          const table = document.querySelector('.best-scores>table');
          const button = document.querySelector('.best-scores>button');
          if(title !== null && table !== null && button !== null){
            title.remove();
            table.remove();
            button.remove();
          }
          bestScoresPage.appendChild(createBestScoresItems());
          overlay.append(bestScoresPage);
          playSound("menu");
          changeVisibility(bestScoresPage);
          changeVisibility(menu);
        });
        break;

      case "Rules":
        describeElement(menuItem, item, 'menu__item');
        menuItem.addEventListener("click", () => {
          playSound("menu");
          changeVisibility(rulesPage);
          changeVisibility(menu);
        });
        break;

      case "Settings":
        describeElement(menuItem, item, 'menu__item');
        menuItem.addEventListener("click", () => {
          playSound("menu");
          changeVisibility(settingsPage);
          changeVisibility(menu);
        });
        break;
    }

    fragment.appendChild(menuItem);
  });

  return fragment;
}
/////////////////////////////////////////////


/////////////////////////////////////////////
function createBestScoresItems() {
  let fragment = new DocumentFragment();
  const bestScoresTitle = document.createElement("div");
  describeElement(bestScoresTitle, 'Best Scores', 'scores-title');

  const table = document.createElement("table");
  table.className = "table";
  const tr = document.createElement("tr");
  bestScoresItems.forEach((item) => {
    const th = document.createElement("th");
    describeElement(th, item, 'scores-attribute');
    tr.append(th);
    table.append(tr);
  });
  if(bestScores !== null){
    bestScores.sort((a, b) => +a.time.replace(':', '') > +b.time.replace(':', '') ? 1 : -1);
    bestScores.forEach(el => {
      const tr = document.createElement("tr");
      for(item in el){
        const td = document.createElement("td");
        describeElement(td, el[item], 'scores-value');
        tr.append(td);
      }
      table.append(tr);
    })
    if(bestScores.length >= 10){
      bestScores = bestScores.slice(0, 10);
    }
    localStorage.setItem('bestScores', JSON.stringify(bestScores));
  }

  const navButton = document.createElement("button");
  describeElement(navButton, 'Go Back', 'nav-button');
  navButton.addEventListener("click", () => {
    playSound("menu");
    changeVisibility(menu);
    changeVisibility(bestScoresPage);
  });

  fragment.appendChild(bestScoresTitle);
  fragment.appendChild(table);
  fragment.appendChild(navButton);

  return fragment;
}

function createRulesItems() {
  let fragment = new DocumentFragment();
  const rulesTitle = document.createElement("div");
  describeElement(rulesTitle, 'Rules of Gem Puzzle', 'rules-title');
  const description = document.createElement("div");

  const p_first = document.createElement("p");
  describeElement(p_first, 'The object of the puzzle is to place the tiles in order by making sliding moves that use the empty space.','paragraph-first')

  const p_second = document.createElement("p");
  describeElement(p_second, 'You can save your game and load it later. Or you can just use pause button. Also you can choose game field size of color in Settings', 'paragraph-second');

  const navButton = document.createElement("button");
  describeElement(navButton, 'Go Back', 'nav-button');
  navButton.addEventListener("click", () => {
    playSound("menu");
    changeVisibility(menu);
    changeVisibility(rulesPage);
  });

  description.append(p_first);
  description.append(p_second);

  fragment.appendChild(rulesTitle);
  fragment.appendChild(description);
  fragment.appendChild(navButton);

  return fragment;
}

function createSettingsItems() {
  let fragment = new DocumentFragment();
  const settingsTitle = document.createElement("div");
  describeElement(settingsTitle, 'Settings', 'settings-title');

  const fieldSizeContainer = document.createElement('div');
  fieldSizeContainer.className = 'size-container';
  const fieldSize = document.createElement("div");
  describeElement(fieldSize, 'Field Size', 'field-size')
  const select = document.createElement("select");
  select.onchange = getSelectedValue;
  select.className = "select";
  for (item in cellSizes) {
    const option = document.createElement("option");
    describeElement(option, item, 'option');
    option.setAttribute('value', +item[0].toString());
    if(+size === +item[0].toString()){
      option.selected = true;
    }
    select.append(option);
  }
  fieldSizeContainer.append(fieldSize);
  fieldSizeContainer.append(select);

  const soundContainer = document.createElement('div');
  soundContainer.className = 'sound-container';
  const soundText = document.createElement('div');
  describeElement(soundText, 'Sound', 'sound');
  const soundButton = document.createElement('button');
  soundButton.style.cssText = `background-color: white;
  color: black;`;
  describeElement(soundButton, 'On', 'sound-button');
  soundButton.addEventListener('click', ()=>{
    playSound('menu');
    if(soundButton.innerHTML === 'On'){
      toggleSound();
      soundButton.innerHTML = 'Off';
      soundButton.style.cssText = `background-color: black;
      color: white;`;
      localStorage.setItem('sound', settings.sound);
    }
    else{
      toggleSound();
      soundButton.style.cssText = `background-color: white;
      color: black;`;
      localStorage.setItem('sound', settings.sound);
      soundButton.innerHTML = 'On';
    }
  })
  soundContainer.append(soundText);
  soundContainer.append(soundButton);

  const typeContainer = document.createElement('div');
  typeContainer.className = 'type-container';
  const typeText = document.createElement('div');
  describeElement(typeText, 'Type', 'type');
  const typeButton = document.createElement('button');
  describeElement(typeButton, 'Numbers', 'type-button');
  typeButton.style.cssText = `background-color: white;
  color: black;`;
  typeButton.addEventListener('click', ()=>{
    playSound('menu');
    if(typeButton.innerHTML === 'Numbers'){
      typeButton.innerHTML = 'Pictures';
      typeButton.style.cssText = `background-color: black;
      color: white;`;
      toggleType();
      localStorage.setItem('type', settings.type);
    }
    else{
      typeButton.innerHTML = 'Numbers';
      toggleType();
      typeButton.style.cssText = `background-color: white;
      color: black;`;
      localStorage.setItem('type', settings.type);
    }
  })
  typeContainer.append(typeText);
  typeContainer.append(typeButton);

  const navButton = document.createElement("button");
  describeElement(navButton, 'Go Back', 'nav-button');
  navButton.addEventListener("click", () => {
    playSound("menu");
    changeVisibility(menu);
    changeVisibility(settingsPage);
  });

  fragment.appendChild(settingsTitle);
  fragment.appendChild(fieldSizeContainer);
  fragment.appendChild(soundContainer);
  fragment.appendChild(typeContainer);
  fragment.appendChild(navButton);

  return fragment;
}

function createConfirmItems(){
    let fragment = new DocumentFragment();
    const confirmMessage = document.createElement('div');
    describeElement(confirmMessage, 'Do You Really Want To Start New Game?', 'confirm-title');

    const buttonOK = document.createElement('button');
    describeElement(buttonOK, 'OK', 'confirm-button');
    buttonOK.addEventListener('click', ()=>{
        size = getSize();
        count = (size * size) - 1;
        numbers = [...Array(count).keys()]
            .sort(() => Math.random() - 0.5);
        let pauseButton = document.querySelector('.pause-button');
        if(pauseButton.innerHTML === 'Resume Game'){
          pauseButton.innerHTML = 'Pause Game';
        }
        playSound('menu');
        startTimer();
        movesCount = 0;
        let movesContainer = document.querySelector(".moves");
        movesContainer.innerHTML = `Moves ${movesCount}`;
        const children = document.querySelectorAll('.win-card>div');
        const children_second = document.querySelector('.win-card>button');
        if(children_second !== null){
          children_second.remove();
        }
        if(children !== null){
          children.forEach(item=>{
            item.remove();
          });
        }
        const cellsForDelete = document.querySelectorAll(".cell");
        cellsForDelete.forEach((item) => {
          item.remove();
        });
        empty.left = size - 1;
        empty.top = size - 1;
        cells = [];
        cells.push(empty);
        fillArea(size);
        changeVisibility(confirmWindow);
        changeVisibility(overlay);
    });

    const buttonCancel = document.createElement('button');
    describeElement(buttonCancel, 'Cancel', 'confirm-button');
    buttonCancel.addEventListener('click', ()=>{
        playSound('menu');
        changeVisibility(confirmWindow);
        changeVisibility(menu);
    });

    fragment.appendChild(confirmMessage);
    fragment.appendChild(buttonOK);
    fragment.appendChild(buttonCancel);

    return fragment;
}

function createWinCardItems(){
  let fragment = new DocumentFragment();
  const winTitle = document.createElement('div');
  describeElement(winTitle, 'Congratulations!!!', 'win-title');

  const winStats = document.createElement('div');
  describeElement(winStats, `You won in ${addZero(timer.min)}<span>:</span>${addZero(timer.sec)} and ${movesCount} moves`, 'win-stats');

  const winButton = document.createElement('button');
  describeElement(winButton, 'Confirm', 'confirm-button');
  winButton.addEventListener('click', ()=>{
    changeVisibility(menu);
    changeVisibility(winCard);
  })

  fragment.appendChild(winTitle);
  fragment.appendChild(winStats);
  fragment.appendChild(winButton);

  return fragment;
}
/////////////////////////////////////////////


/////////////////////////////////////////////
function fillArea(size) {
  let randomPicture = getRandomInt(0, size);
  for (let i = 0; i < (size*size) - 1; i++) {
    const cell = document.createElement("div");
    const value = numbers[i] + 1;
    cell.draggable = true;
    cell.className = "cell";
    const left = i % size;
    const top = (i - left) / size;
    if(settings.type === 'numbers'){
      cell.style.cssText = `width: ${fieldSizeInPx/size}px; height: ${fieldSizeInPx/size}px`;
      cell.innerHTML = value;
    }
    else if(settings.type === 'pictures'){
      img.src = `${pathToPicture}${pictureArray[randomPicture]}`;
      cell.style.cssText = `width: ${fieldSizeInPx/size}px;
                            height: ${fieldSizeInPx/size}px;
                            background-image: url(${pathToPicture}${pictureArray[randomPicture]});
                            background-size: 600px;
                            background-position: ${top * cellSizes[`${size}x${size}`]}px ${left * cellSizes[`${size}x${size}`]}px`;
                            console.log(left + ' ' + top);
    }
    cells.push({
      value: value,
      left: left,
      top: top,
      element: cell,
    });

    cell.style.left = `${left * cellSizes[`${size}x${size}`]}px`;
    cell.style.top = `${top * cellSizes[`${size}x${size}`]}px`;

    field.append(cell);

    cell.addEventListener("click", () => {
      moveCell(i + 1);
    });
  }
}

function fillDefault(size) {
  for (let i = 0; i < (size*size) - 1; i++) {
    const cell = document.createElement("div");
    cell.style.cssText = `width: ${fieldSizeInPx/size}px; height: ${fieldSizeInPx/size}px`;
    const value = i + 1;
    cell.className = "cell";
    cell.innerHTML = value;

    const left = i % size;
    const top = (i - left) / size;

    cell.style.left = `${left * cellSizes[`${size}x${size}`]}px`;
    cell.style.top = `${top * cellSizes[`${size}x${size}`]}px`;

    field.append(cell);
  }
}

function moveCell(index) {
  const cell = cells[index];

  const leftDiff = Math.abs(empty.left - cell.left);
  const topDiff = Math.abs(empty.top - cell.top);
  if (leftDiff + topDiff > 1) {
    return;
  }
  cell.element.style.left = `${empty.left * cellSizes[`${size}x${size}`]}px`;
  cell.element.style.top = `${empty.top * cellSizes[`${size}x${size}`]}px`;

  const emptyLeft = empty.left;
  const emptyTop = empty.top;
  empty.left = cell.left;
  empty.top = cell.top;
  cell.left = emptyLeft;
  cell.top = emptyTop;

  const isFinished = cells.every(cell => {
    return cell.value === cell.top * size + cell.left + 1;
  });

  movesCount++;
  let movesContainer = document.querySelector(".moves");
  movesContainer.innerHTML = `Moves ${movesCount}`;
  if (isFinished) {
    winCard.appendChild(createWinCardItems());
    overlay.append(winCard);
    playSound("win");
    changeVisibility(winCard);
    changeVisibility(overlay);
    stopTimer();

    addBestScoresItem(getWinDate(), movesCount, getWinSize(), getWinTime());
    let stringifyData = JSON.stringify(bestScores);
    localStorage.setItem('bestScores', stringifyData);
  }

  playSound("cell");
}
////////////////////////////////////////////


////////////////////////////////////////////
function startTimer() {       
   timer.sec = 0;
   timer.min = 0;
   let timeContainer = document.querySelector(".time");
   timeContainer.innerHTML = `Time ${addZero(timer.min)}<span>:</span>${addZero(timer.sec)}`;
   timer.tick = setInterval(tick,1000);
}

function resumeTimer(){
  timer.tick = setInterval(tick,1000);
}

function tick() {
  let timeContainer = document.querySelector(".time");
  if (timer.sec + 1 === 60) {
    timer.sec = 0;
    timer.min++;
  } else {
    timer.sec++;
  }
  timeContainer.innerHTML = `Time ${addZero(timer.min)}<span>:</span>${addZero(timer.sec)}`;
}

function stopTimer() {
  clearInterval(timer.tick);
}
///////////////////////////////////////////


///////////////////////////////////////////
function toggleBeginning(){
  firstStart = !firstStart;
}

function toggleSound(){
  settings.sound = !settings.sound;
}

function toggleType(){
  if(settings.type === 'numbers'){
    settings.type = 'pictures';
  }
  else{
    settings.type = 'numbers';
  }
}
///////////////////////////////////////////


///////////////////////////////////////////
function playSound(item) {
  const audio = new Audio();
  audio.currentTime = 0;
  switch (item) {
    case "menu":
      audio.src = "menu-sound.mp3";
      break;
    case "cell":
      audio.src = "move-cell.mp3";
      break;
    case "win":
      audio.src = "win-sound.mp3";
      break;
    case 'pause':
      audio.src = "pause.mp3";
  }
  if(settings.sound){
    audio.play()
  }
}

function addZero(n) {
  return (parseInt(n, 10) < 10 ? "0" : "") + n;
}

function changeVisibility(element){
  element.classList.toggle('object--hidden');
}

function describeElement(element, innerHTML, className){
  element.innerHTML = innerHTML;
  element.className = className;
}

function addBestScoresItem(date, moves, size, time){
  bestScores.push({
    date: date,
    moves: moves,
    size: size,
    time: time,
  });
}

function setSavedGame(moves, size, time, cells){
  savedGame.push({
    moves: moves,
    size: size,
    time: time,
    cells: cells,
  })
}

function getWinDate(){
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${year}.${month}.${day}`;
}

function getWinTime(){
  return `${addZero(timer.min)}:${addZero(timer.sec)}`;
}

function getWinSize(){
  return `${size}x${size}`;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function dragStart(){
  setTimeout(() =>{
    this.classList.add('img--hidden');
  },0)
}
///////////////////////////////////////////

window.addEventListener("DOMContentLoaded", ()=>{
  fillDefault(size);
});
