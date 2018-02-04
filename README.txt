This is an implementation of a Sudoku game in javascript. 
www.patrickholland.ca has a running version of this code.
The backbone of the program is a sudoku solver which will solve any partially solved puzzle given.
It can also 'solve' empty sudoku puzzles which is how the puzzles are generated.

Once a puzzle is 'formed', the solving algorithm will attempt to solve it in different ways multiple times to reduce the chances of
having a puzzle with multiple different solutions. If at any point, the solver is able to find a different solution then that puzzle is discarded.