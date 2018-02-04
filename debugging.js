function printGrid(original) {
    var temp = "";
    for (var i = 0; i < 81; i++) {
        if (i != 0 && i % 9 != 0 && i % 3 == 0)
            temp+="|";

        if (i % 9 == 0 && i !== 0) {
            console.log(temp);
            temp = "";
        }
        if (original[i].getValue() > 0) {
            temp+=original[i].getValue();
        }
        else if (original[i].getValue === -1)
            temp+="_";
        else 
            temp+="*";
        if (i != 0 && i % 27 == 0)
            console.log("--- --- ---");
    }
    console.log(temp);
}  
function test(grid) {
    test1 = parseCells(grid);
    solver(test1);
    printGrid(test1);
    console.log("\n\n");
    printGrid(sudokugrid);
}
function loadToButtons(original) {
    var btns = document.getElementsByTagName("button");
    if (typeof original === "string")
        var grid = original;
    else 
        var grid = gridString(original);
    for (var i = 0; i < 81; i++) {
        if (grid[i] != 0)
            btns[i].textContent = grid[i];
        else
            btns[i].textContent = "";
    }
    for (var i = 81; i < 90; i++) {
        btns[i].textContent = (i-80);
    }
}
function testRandom(solved) {
    for (var i = 0; i < 20; i++) {
        var grid = parseCells(emptyGrid);
        solver(grid);
        
        var temp = remover(sudokugrid, solved);
        console.log(solvedInString(temp));
    }
}
function solutionsTest(grid) {
    var solutions = [];
    var cells = parseCells(grid);
    if (!solver(cells)){
        console.log("no solution");
        return false;
    }   
    var solution = gridString(sudokugrid);

    var i;
    
    for (i = 0, n = 60; i < n; i++) {
        if (i % 15 === 0) {
            console.log("solutionsTest()"+i*100/n);
        }
        cells = parseCells(grid);
        solver(cells);
        var temp = gridString(sudokugrid);
        if (solution !== temp) {
            //console.log("different");
            return "poly";
        }
        else {
            //console.log("same\n"+temp);
        }
    }
    return "unique";
}

grids = [];
gridStatus = [];
var btns;
function fillGrids() {
    for (var i = 0, n = 200; i < n; i++) {
        if (i % 15 === 0) {
            console.log("fillGrids()"+i*100/n);
        }
        var cells = solver(parseCells(emptyGrid));
        grids.push(remover(sudokugrid));
    }
}
function assessGrids() {
    // determine if each grid in grids is a unique grid
    var poly = 0;
    var unique = 0;
    
    for (var i = 0, n = grids.length; i < n; i++) {
        if (i % 15 === 0) {
            console.log("assessGrids()"+i*100/n);
        }
        var temp = solutionsTest(grids[i]);
        gridStatus.push(temp);
        if (temp === "poly")
            poly++;
        else if (temp === "unique")
            unique++;
        else {
            console.log('error at gridStatus['+gridStatus.length+'].');
        }
    }
}
var tds;
var btns;
var selected;
var solution;
var puzzle;
var highlighted = [];
var menus;
var strikes = 0;
function prepBtns() {
    var btnsA = document.getElementsByTagName('button');
    btns = [];
    tds = document.getElementsByTagName('td');
    for (var i = 0; i < 90; i++) {
        btns.push(btnsA[i]);
        btnsA[i].setAttribute('onclick','buttonClick('+i+')');
    }
    menus = document.getElementsByClassName('menu');
    menus[0].setAttribute('onclick','newGame()');
    document.addEventListener('keyup',function(evt) {
        if (selected !== -1) {
            switch (evt.keyCode) {
                case 97:
                case 49:
                    guessCell(1);
                    break;
                case 98:
                case 50:
                    guessCell(2);
                    break;
                case 99:
                case 51:
                    guessCell(3);
                    break;
                case 100:
                case 52:
                    guessCell(4);
                    break;
                case 101:
                case 53:
                    guessCell(5);
                    break;
                case 102:
                case 54:
                    guessCell(6);
                    break;
                case 103:
                case 55:
                    guessCell(7);
                    break;
                case 104:
                case 56:
                    guessCell(8);
                    break;
                case 105:
                case 57:
                    guessCell(9);
                    break;
                     
            }
        }
    });
}
function newGame() {
    menus[0].textContent = "Easy";
    menus[1].textContent = "Medium";
    menus[2].textContent = "Hard";
    menus[0].setAttribute('onclick','setupPuzzle(50)');
    menus[1].setAttribute('onclick','setupPuzzle(35)');
    menus[2].setAttribute('onclick','setupPuzzle(20)');

}
function buttonClick(index) {
    if (index < 81) {
        selected = index;
        highlightCells(index);
    }
    else if (index < 90) {
        if (selected >= 0) {
            if (puzzle[selected] === '0') {
                guessCell(index-80);
            }
            selected = -1;
        }
    }
}
function guessCell(guess) {
    if (solution[selected] == guess) {
        puzzle = puzzle.replaceAt(selected,guess);
        btns[selected].textContent = guess;
        checkCompleteDigit(guess);
        highlightCells(selected);
    }
    else {
        strikes++;
        tds[selected].style.backgroundColor = 'red';
        selected = -1;
        setTimeout(highlightCells, 700);
    }
    
}
String.prototype.replaceAt = function(index, letter) {
    return this.substring(0,index) + letter + this.substring(index+1);
};
function setupPuzzle(solved) {
    menus[0].setAttribute('onclick','newGame()');
    menus[1].setAttribute('onclick','');
    menus[2].setAttribute('onclick','');
    menus[0].textContent = "New Game";
    menus[1].textContent = "";
    menus[2].textContent = "";
    var cells = parseCells(emptyGrid);
    solver(cells);
    solution = gridString(sudokugrid);
    puzzle = remover(sudokugrid,solved);
    loadToButtons(puzzle);
    for (var i = 1; i < 10; i++)
        checkCompleteDigit(i);
}

function highlightCells(index) {
    for (var i = 0, n = highlighted.length; i < n; i++) {
        //tds[highlighted[i]].style.border = "solid thin";
        tds[highlighted[i]].style.backgroundColor = "white";
    }
    highlighted = [];
    if (index === -1) return;
    if (puzzle[index] === '0') {
        //tds[index].style.border = "solid medium";
        tds[index].style.backgroundColor = "#1ccfd6";
        highlighted.push(index);
        return;
    }
    for (var i = 0; i < 81; i++) {
        if (puzzle[i] === puzzle[index]) {
            //tds[i].style.border = "solid medium";
            tds[i].style.backgroundColor = "#1ccfd6";
            highlighted.push(i);
        }
    }
}
function checkCompleteDigit(digit) {
    var count = 0;
    for (var i = 0; i < 81; i++) {
        if (puzzle[i] == digit)
            count++;
    }
    if (count !== 9) 
        return;
    digit = digit + 80;
    btns[digit].textContent = "";
}

prepBtns();
