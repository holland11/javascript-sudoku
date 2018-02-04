var test1;
var sudokugrid;

// Patrick Holland patrickeholland@gmail.com

function parseCells(grid) {
    if (grid.length !== 81) {
        console.log("grid length must be 81 (@parseCells)");
        return false;
    }
    unitlists2 = formUnitlists2();
    var cells = [];
    for (var i = 0; i < 81; i++) {
        cells.push(new SudokuCell(i, grid[i]-1));
    }
    return cells;
}

function fixBrothers(original) {
    // find cells which have a specific value and haven't already removed that value from its unitlist brothers
    
    var shuffledNum = [];
    for (var i = 0; i < 81; i++)
        shuffledNum.push(i);
    shuffle(shuffledNum);
    
    for (var i = 0; i < 81; i++) {
        let temp = original[shuffledNum[i]].getValue();
        if (temp > 0 && original[shuffledNum[i]].brothersFixed === false) {
            fixBrothers2(original, temp, shuffledNum[i]);
            original[shuffledNum[i]].value = temp;
            original[shuffledNum[i]].brothersFixed = true;
        }
    }
}

function fixBrothers2(original, value, cell) {
    // original: array of sudokucells, value: number to be removed, cell: cellIndex with the value
    // iterate through each of cell's unitlist brothers and set its potentialValues[value] = false
    var tempList = original[cell].unitlistIndexes;
    for (var u = 0; u < 3; u++) {
        for (var c = 0; c < 9; c++) {
            if (unitlists[tempList[u]][c] === cell)
                continue;
            let x = original[unitlists[tempList[u]][c]];
            if (x.potentialValues[value-1] === true) {
                x.potentialValues[value-1] = false;
            }
        }
    }
}
              

function uniqueBrother(original) {
    /* This function will iterate through 1 unitlist at a time, 1 digit at a time (between 1-9)
    looking for cases where only 1 cell within that unitlist still has that digit.
    This signifies that this cell must be that value.
    */
    for (var u = 0; u < 27; u++)
        for (var d = 0; d < 9; d++) {
            if (unitlists2[u][d] === true)
                continue;
            var tempArray = [];
            for (var c = 0; c < 9; c++) {
                if (original[unitlists[u][c]].potentialValues[d] === true)
                    tempArray.push(unitlists[u][c]);
            }
            if (tempArray.length === 1) {
                let x = original[tempArray[0]];
                x.replaceWith(d+1);
                for (var i = 0; i < 3; i++)
                    unitlists2[x.unitlistIndexes[i]][d] = true;
            }
            if (tempArray.length === 0) {
                //console.log("unique brothers finding unitlist["+u+"] has 0 cells with potentialValues["+d+"] true");
            }
        }
}

function sharedBrothers(original) {
    /*
     * Find when two or three cells within a unitlist are the only original within that unitlist which
     * have a specific digit AND they all also share another unitlist. The original within the second shared
     * unitlist will have digit removed from them.
     */
    for (var u = 0; u < 27; u++)
        for (var d = 0; d < 9; d++) {
            var count = 0;
            var tempList = [];
            for (var c = 0; c < 9; c++)
                // add every cell within unitlist[u] that has digit in its set into list1, keep count as well
                if (original[unitlists[u][c]].potentialValues[d] === true) {
                    tempList.push(unitlists[u][c]);
                    count++;
                    if (count > 3) break;
                }
            if (count === 2 || count === 3)
                // send list of original who are the only ones within unitlist[u] that can be d.
                //console.log("entering sharedBrothers2 with count: "+count+", list1: "+tempList+", u: "+u+", d: "+d);
                sharedBrothers2(original, count, tempList, u, d);
        }
}

function sharedBrothers2(original, count, tempList, uOrig, d) {
    /*
     * Check list1 to see if each of its member original also share another unitlist besides unitlist[u]
     * check list1 original 1 at a time
     * Currently only removing 
     */
    for (var u = 0; u < count; u++) {
        var tempInt = -2;
        for (var u2 = 0; u2 < count; u2++) {
            if (u === u2)
                continue;
            var sharedListIndex = original[tempList[u]].sharedUnitList(original[tempList[u2]], uOrig);
            if (sharedListIndex !== -1 && count === 2) {
                // handles first match when list1 is only 2 original since all you need is 1 match that isn't origU
                //remove d from every cell within unitlist[sharedListIndex] that isn't list1[u] or list1[u2].
                //console.log("entering sharedBrothers3_2 with list1[u]: "+tempList[u]+", list1[u2]: "+tempList[u2]+", sharedListIndex: "+sharedListIndex+", d: "+d);
                sharedBrothers3_2(original, tempList[u], tempList[u2], sharedListIndex, d);
                return;
            }
            if (sharedListIndex !== -1) {
                if (tempInt === sharedListIndex) {
                    //console.log("entering sharedBrothers3_3 with list1[0]: "+tempList[0]+", list1[1]: "+tempList[1]+", list1[2]: "+tempList[2]+", sharedListIndex: "+sharedListIndex+", d: "+d);
                    sharedBrothers3_3(original, tempList[0], tempList[1], tempList[2], sharedListIndex, d);
                    return;
                }
                else tempInt = sharedListIndex;
                // set tempInt to the matched unitlist. that way, if it gets matched again before it's reset, the if statement above will catch that it's the second match.
            }
        }
    }
}

function sharedBrothers3_2(original, cell1, cell2, unit, digit) {
    /*
     * Gets called when cell1 and cell2 are the only original within a unitlist that
     * still have digit left in them AND they are also together in unitlist[unit].
     * This method will go into unitlist[unit], ignoring cell1 and cell2, and remove digit each.
     */
    for (var c = 0; c < 9; c++) {
        if (unitlists[unit][c] === cell1 || unitlists[unit][c] === cell2)
            continue;
        let x = original[unitlists[unit][c]];
        if (x.potentialValues[digit] === true) 
            x.potentialValues[digit] = false;
    }
}

function sharedBrothers3_3(original, cell1, cell2, cell3, unit, digit) {
    /*
     * Gets called when cell1, cell2 and cell3 are the only original within a unitlist that
     * still have digit left in them AND they are also together in unitlist[unit].
     * This method will go into unitlist[unit], ignoring cell1, cell2 and cell3 and remove digit from each.
     */
    for (var c = 0; c < 9; c++) {
        if (unitlists[unit][c] === cell1 || unitlists[unit][c] === cell2 || unitlists[unit][c] === cell3)
            continue;
        if (original[unitlists[unit][c]].potentialValues[digit] === true) {
            let x = original[unitlists[unit][c]];
            if (x.potentialValues[digit] === true)
                x.potentialValues[digit] = false;
        }
    }
}

function countTotalPotentials(original) {
    var count = 0;
    for (var i = 0; i < 81; i++) {
        for (var j = 0; j < 9; j++) {
            if (original[i].potentialValues[j] === true)
                count++;
        }
    }
    return count;
}

function countSolved(original) {
    var count = 0;
    for (var i = 0; i < 81; i++) {
        if (original[i].value !== 0)
            count++;
    }
    return count;
}

function solvingAlgorithms(original) {
    var count;

    
    do {
        count = countTotalPotentials(original);
        var temp = (Math.random() * 5);
        if (temp < 1) {
            fixBrothers(original);
            uniqueBrother(original);
            sharedBrothers(original);
        }
        else if (temp < 2) {
            uniqueBrother(original);
            sharedBrothers(original);
            fixBrothers(original);
        }
        else if (temp < 3) {
            sharedBrothers(original);
            fixBrothers(original);
            uniqueBrother(original);
        }
        else if (temp < 4) {
            fixBrothers(original);
            sharedBrothers(original);
            uniqueBrother(original);
        }
        else {
            uniqueBrother(original);
            fixBrothers(original);
            sharedBrothers(original);
        }

    } while (count !== countTotalPotentials(original));
}

function gridString(original) {
    var result = "";
    for (var i = 0; i < 81; i++) {
        result += original[i].value;
    }
    return result;
}

function solver(original) {
    /*
     * What we want here is for the solving methods to run until they are no longer making a difference.
     * This signifies that we need to guess a cell's value. We could get higher probability of guessing
     * correctly if we only guess cells with the lowest number of current potentialValues. (guessing one with 5 values, vs 2 values is 1/5 vs 1/2)
     * We then need to run the solving methods on this newly guessed grid and see if the grid remains valid. 
     * If it's invalid, backtrack and try guessing a different number. If it's valid and solved, return true. 
     * If it's valid but incomplete, make run through the guesses again.
     * This will require recursion and there will be a smart way to organize that.
     */
    
    var shuffledNum = [];
    for (var i = 0; i < 81; i++)
        shuffledNum.push(i);
    shuffle(shuffledNum);
    
    solvingAlgorithms(original);
    if (countSolved(original) === 81) {
        sudokugrid = original;
        return true;
    }      
    for (var i = 0; i < 81; i++)
        if (original[shuffledNum[i]].value === 0) {
            var tempList = [];
            for (var b = 0; b < 9; b++) 
                if (original[shuffledNum[i]].potentialValues[b] === true)
                    tempList.push(b);
            shuffle(tempList);
            for (var k = 0; k < tempList.length; k++) {
                var d = tempList[k];
                var temporiginal = _.cloneDeep(original);
                var tempunitlists2 = _.cloneDeep(unitlists2);
                original[shuffledNum[i]].replaceWith(d+1);
                
                solvingAlgorithms(original);
                if (!is_valid(original) || !is_valid2(original)) {
                    unitlists2 = _.cloneDeep(tempunitlists2);
                    original = _.cloneDeep(temporiginal);
                    continue;
                }
                if (solver(original)) {
                    return true;
                }
                else {
                    unitlists2 = _.cloneDeep(tempunitlists2);
                    original = _.cloneDeep(temporiginal);
                }
            }
            return false;
        }
    return true;
}

function is_valid(original) {
    for (var i = 0; i < 81; i++)
        if (original[i].getValue() === -1)
            return false;
    return true;
}

function is_valid2(original) {
    for (var u = 0; u < 27; u++) 
        for (var d = 0; d < 9; d++) {
            var countSolved = 0;
            var countPot = 0;
            for (var c = 0; c < 9; c++) {
                if (original[unitlists[u][c]].value === d+1)
                    countSolved++;
                else if (original[unitlists[u][c]].potentialValues[d] === true)
                    countPot++;
            }
            if (countSolved === 0 && countPot === 0)
                return false;
            if (countSolved > 1)
                return false;
            if (countSolved === 1 && countPot > 1)
                return false;
        }
    return true;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

function remover(original, solved) {
    // create an array of the numbers between 0-80 then shuffle it
    var shuffledNum = [];
    for (var i = 0; i < 81; i++)
        shuffledNum.push(i);
    shuffle(shuffledNum);
    
    var tempCells;
    var originalSolution = gridString(original);
    for (var i = 0; i < 81; i++) {
        if (solved === 81)
            break;
        tempCells = parseCells(gridString(original));
        
        tempCells[shuffledNum[i]].fill();
        unitlists2 = formUnitlists2();
        
        solvingAlgorithms(tempCells);
        if (originalSolution === gridString(tempCells)) {
            original[shuffledNum[i]].fill();
            solved++;
        }
        else {
            console.log();
        }
        
    }
    unitlists2 = formUnitlists2();
    return gridString(original);
}

function solvedInString(grid) {
    var count = 0;
    for (var i = 0; i < 81; i++) {
        if (grid[i] != 0)
            count++;
    }
    return count;
}