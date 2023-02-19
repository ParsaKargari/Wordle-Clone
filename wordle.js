
// Initializing the variables that are going to be used globally
var dict = null;
const darkButton = document.getElementById('dark-button');
const body = document.body;
const infoButton = document.getElementById('info-button');
const questionButton = document.getElementById('question-button');
const winBox = document.getElementById('win-box');
const hintDisplay = document.getElementById('hint-bar');
const loseBox = document.getElementById('lose-box');
const startOver = document.getElementById('start-over-button-click');

// Initializing the CURRENT state of the game.
// Want to update it throughout the game to have a cursor at any point in time.
const CurrentState = {
  guess_word: '',
  hint_word: '',
  grid: Array(4)
    .fill()
    .map(() => Array(4).fill('')),
  currentRow: 0,
  currentCol: 0,
};

// Fetching the data from the API
// Start Over button is disabled until the data is fetched
async function fetchData(){
  if (dict == null){
    startOver.disabled = true;
    startOver.innerHTML = 'Loading...';
  const res = await fetch("https://api.masoudkf.com/v1/wordle", {
    headers: {
      "x-api-key": "sw0Tr2othT1AyTQtNDUE06LqMckbTiKWaVYhuirv",  // API Key
    },
  });
  const data = await res.json();
  dict = data;
  startOver.disabled = false;
  startOver.innerHTML = 'Start Over'
  console.log('Data Fetched from API');
  }}


// Getting the word and hint from the API, set it to the current state
async function wordAndHint(){
  fetchData().then(() =>{
  apiWordAndHint = dict['dictionary'][Number.parseInt(Math.random() * dict['dictionary'].length)] // Getting a random word and hint from the API
  CurrentState.guess_word = apiWordAndHint['word'].toLowerCase()
  CurrentState.hint_word = apiWordAndHint['hint']
})}


// Initializing the board, creating the grid 
// The grid will be a 4x4 grid, with each cell being a div. It will keep on creating/updating the grid as the user types.
function createGrid(){
  for(let i = 0; i < 4; i++){
    for(let j = 0; j < 4 ; j++){
      const cell = document.getElementById(`box${i}${j}`);
      cell.textContent = CurrentState.grid[i][j];
    }
  }
}


// Adding three event listeners to the buttons (Dark Mode, How to Play, and Question Mark)
darkButton.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  
});

infoButton.addEventListener('click', () => {
    body.classList.toggle('how-to-play');
    
});

questionButton.addEventListener('click', () => {
  body.classList.add('question-css');
  hintDisplay.textContent = 'Hint: ' + CurrentState.hint_word;
});

// Listening to the user's keypresses.
// Three possibilities: Enter, Backspace, and VALID letter
function getKeyPress(){
  
  // Highlight the first cell of the grid
  var cell = document.getElementById(`box${CurrentState.currentRow}0`);
  cell.classList.add('highlight')

  // Listening to the user's keypresses
  document.body.onkeyup = (e) => {

    const userKey = e.key;

    // If the user presses a valid letter, then add it to the grid
    if (userKey.match(/[a-z]/i) && userKey.length === 1) {
      if (CurrentState.currentCol !== 3 && CurrentState.currentCol !== 4) {
        var cell = document.getElementById(`box${CurrentState.currentRow}${CurrentState.currentCol + 1}`);
        var prevCell = document.getElementById(`box${CurrentState.currentRow}${CurrentState.currentCol}`);
        prevCell.classList.remove('highlight')
        cell.classList.add('highlight')
      }
      if (CurrentState.currentCol !== 4) {
      CurrentState.grid[CurrentState.currentRow][CurrentState.currentCol] = userKey.toLowerCase();
      CurrentState.currentCol++;
      
    }
    }

    // If the user presses enter, then check if the word is correct
    if(userKey === 'Enter') {
        if (CurrentState.currentCol === 4){
          const word = CurrentState.grid[CurrentState.currentRow].join('');
          fixWord(word);
          CurrentState.currentRow++;
          CurrentState.currentCol = 0;
          var cell = document.getElementById(`box${CurrentState.currentRow}${CurrentState.currentCol}`);
          var prevCell = document.getElementById(`box${CurrentState.currentRow - 1}3`);
          cell.classList.add('highlight')
          prevCell.classList.remove('highlight')
        } else {
          alert('You must complete the word first')
        }
    }

    // If the user presses backspace, then remove the previous letter from the grid
    if (userKey === 'Backspace') {
      if (CurrentState.currentCol !== 0) {
        CurrentState.grid[CurrentState.currentRow][CurrentState.currentCol - 1] = '';
        CurrentState.currentCol--;
      }
      if (CurrentState.currentCol !== 3 && CurrentState.currentCol !== 4) {
      var afterCell = document.getElementById(`box${CurrentState.currentRow}${CurrentState.currentCol + 1}`);
      var cell = document.getElementById(`box${CurrentState.currentRow}${CurrentState.currentCol}`);
      cell.classList.add('highlight')
      afterCell.classList.remove('highlight')
      }
    }
    // Update the grid at the end of the function
    createGrid();
  };
}

// Checks the word, and returns true if the letter is in the word
function fixWord(input) {

  // Getting the current row and column, and the word that the user has typed
  const currentRow = CurrentState.currentRow;
  const currentCol = CurrentState.currentCol;
  const wordCheckTrue = CurrentState.guess_word === input;
  const endGame = currentRow === 3;  // If the user has reached the last row, then endGame is set to true

  for (let i = 0; i < 4; i++){
    const cell = document.getElementById(`box${currentRow}${i}`);
    const letter = cell.textContent;

    // Checks the letter one-by-one and adds the appropriate class to the cell
    // Colors are the same RGB as the Official Wordle game
    if (letter === CurrentState.guess_word[i]) {
      cell.classList.add('right'); // Green
    } else if (CurrentState.guess_word.includes(letter)) {
      cell.classList.add('wrong'); // Yellow
    } else {
      cell.classList.add('empty'); // Gray
    }
  }

  // If the user has won the game, then display the win page
  if (wordCheckTrue) {
    body.classList.add('winner-page');
    body.classList.remove('question-css');
    winBox.innerHTML = 'You have won the game! The correct word was: ' + CurrentState.guess_word.bold().toUpperCase().toString();

  // If the user has reached the end of the game, then display the lose page
  } else if (endGame) {
    body.classList.add('loser-page');
    body.classList.remove('question-css');
    loseBox.innerHTML = 'You have reached the end of the game :( The correct word was: ' + CurrentState.guess_word.bold().toUpperCase().toString();
  }
}

// Resets the game state, and starts the game over
function resetGameState() {
  // Remove the win/lose page and the previous hint
  body.classList.remove('winner-page');
  body.classList.remove('question-css');
  body.classList.remove('loser-page');
  
  // Fills the grid with empty strings, and resets the current row and column
  CurrentState.grid = Array(4).fill().map(() => Array(4).fill(''));
  CurrentState.currentRow = 0;
  CurrentState.currentCol = 0;

  // Removes all the classes from the cells, so that the grid is empty using a nested for loop
  for(let i = 0; i < 4; i++){
    for(let j = 0; j < 4 ; j++){
      const cell = document.getElementById(`box${i}${j}`);

      // Removes all the classes from the cell (Green, Yellow, Gray, and Highlight Cursor)
      cell.classList.remove('right');
      cell.classList.remove('wrong');
      cell.classList.remove('empty');
      cell.classList.remove('highlight');
    }
  }
  main();

}

// Event listener for the start over button. Calls the function resetGameState() when clicked
const startOverButton = document.getElementById('start-over-button-click');
startOverButton.addEventListener('click', () => {
  resetGameState();
});


// Main function that calls all the other functions
// This concept is a recursion function, where the main function starts the game from point A
// However, the reset game button calls the main function again, which starts the game from point A
function main(){
  wordAndHint();
  getKeyPress();
  createGrid();
}

main();