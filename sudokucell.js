function formUnitlists() {
    /*
     * This method is for setting up the unitlist.
     * The unitlist is a 27x9 2d array which represents all of the 'brotherhoods' of cells within a sudoku game.
     * Each row, each column, and each 3x3 square are each different brotherhoods.
     */
    var unitlist = [];
    for (var i = 0; i < 27; i++) {
        unitlist[i] = [];
        for (var j = 0; j < 9; j++) 
            unitlist[i].push(-1);
    }
    
    for (var i = 0, list = 18; i < 9; i++) { // rows
        for (var j = 0; j < 9; j++)
            unitlist[list][j] = (i*9)+j;
        list++;
    }
    for (var i = 0, list = 9; i < 9; i++) { // columns
        for (var j = 0; j < 9; j++)
            unitlist[list][j] = i + (j*9);
        list++;
    }
    for (var i = 0, list = 0, outerOffset = 0; i < 27; i+=3) { // 3x3 squares
        if (i % 9 == 0 && i != 0)
            outerOffset += 18;
        for (var j = 0, offset = 0; j < 9; j++) {
            if (j % 3 == 0 && j != 0)
                offset += 6;
            unitlist[list][j] = i + j + offset + outerOffset;
        }
        list++;
    }
    
    return unitlist;
}

function formUnitlists2() {
    /*
     * This method is for setting up the unitlist.
     * The unitlist is a 27x9 2d array which represents all of the 'brotherhoods' of cells within a sudoku game.
     * Each row, each column, and each 3x3 square are each different brotherhoods.
     */
    var unitlist = [];
    for (var i = 0; i < 27; i++) {
        unitlist[i] = [];
        for (var j = 0; j < 9; j++) 
            unitlist[i].push(false);
    }
    
    return unitlist;
}

var unitlists = formUnitlists();

var unitlists2 = formUnitlists2();

function SudokuCell(cellNum, cellValue) {
    this.cellNumber = cellNum;
    this.value = (parseInt(cellValue)+1 || 0);
    this.potentialValues = [];
    this.brothersFixed = false; // boolean to represent if it's value has been removed from its unitlist brothers
    
    if (cellValue != -1) {
        for (var i = 0; i < 9; i++) {
            if (i == cellValue)
                this.potentialValues.push(true);
            else this.potentialValues.push(false);
        }
    }
    else {
        for (var i = 0; i < 9; i++)
            this.potentialValues.push(true);
    }
    
    // this block returns an array of 3 ints representing which unitlists this cell is part of.
    this.unitlistIndexes = [];
    for (var u = 0; u < 27; u++)
        for (var cell = 0; cell < 9; cell++)
            if (unitlists[u][cell] === this.cellNumber)
                this.unitlistIndexes.push(u); 
}

SudokuCell.prototype.getValue = function() {
    var temp = [];
    for (var i = 0; i < 9; i++) {
        if (this.potentialValues[i] === true)
            temp.push(i+1);
    }
    if (temp.length === 0) {
        //console.log("cell "+this.cellNumber+" has no potentialValues");
        return -1;
    }
    if (temp.length === 1)
        return temp[0];
    else return 0;
};

SudokuCell.prototype.hasValue = function(value) {
    if (this.potentialValues[value-1])
        return true;
    return false;
};

SudokuCell.prototype.fill = function() {
    for (var i = 0; i < 9; i++)
        this.potentialValues[i] = true;
    this.brothersFixed = false;
    this.value = 0;
};

SudokuCell.prototype.replaceWith = function(value) {
    for (var i = 0; i < 9; i++)
        this.potentialValues[i] = false;
    if (value == 0) {
        this.value = 0;
        return;
    }
    this.value = value;
    this.potentialValues[value-1] = true;
};

SudokuCell.prototype.remove = function(value) {
    this.potentialValues[value-1] = false;
};

SudokuCell.prototype.add = function(value) {
    this.potentialValues[value-1] = true;
};

SudokuCell.prototype.sharedUnitList = function(cell2, exempt) {
    // returns index of shared unitlist between this cell and cell2. 
    // not including the exempt unitlist. return -1 if none.
    for (var u1 = 0; u1 < 3; u1++)
        for (var u2 = 0; u2 < 3; u2++)
            if (this.unitlistIndexes[u1] !== exempt && this.unitlistIndexes[u1] === cell2.unitlistIndexes[u2])
                return this.unitlistIndexes[u1];
    return -1;
};