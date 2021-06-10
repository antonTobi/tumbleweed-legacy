### Playing
You can place alternating legal moves by clicking on the board. To pass or undo use the buttons below the board.

### Editing

To edit the current position freely, hover with the mouse over the cell you want to change and press the corresponding key from this table:

|       | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 (blank) |
|-------|---|---|---|---|---|---|---|---|
| red   | q | w | e | r | t | y | u | i |
| white | a | s | d | f | g | h | j | k |
| gray  | z | x | c | v | b | n | m | , |

To make a cell empty, use backspace.

7-stacks behave identically as 6-stacks, but are shown as blank. This may be useful to create some diagrams.

### Sharing
To share an interactive board, simply copy the URL which encodes the current position (for now the URL does not contain any game history unfortunately).

To share an image of the board, right click the white area to the lower right of the board and choose "Copy image". Then you can Ctrl+V in Discord or Facebook to attach the board diagram to a message.

### Visualization options
- Influence: shows which player has more control over each empty hex.
- Lines of sight: draws lines from the move preview to the other stacks it can see (only if "Move preview" is enabled).
- Captures: indicates stacks that can be captured with a red/white border.
- Last move: marks the last move made with a black border.
- Move preview: shows what move you will make if you click right now.

<!-- If you change "Stack style" to "Circle" you get circular stacks on a go-style grid. This style doesn't really work with the influence option and is buggy in some other ways. -->

### Gameplay options
- Suicidal moves: Allows moves that can be immediately captured.
- 0-stacks: Allows placement where you have no lines of sight.


Note that suicides are never good moves, so I recommend having them disabled normally. This setting also affects how the capture visualization works: a 1-stack that can be captured, but only with a suicidal move, is not shown as capturable when suicides are disabled.

0-stacks are *not* allowed in the official rules. Playing with them is equivalent to the variant *Rumbleweed*. One advantage of this variant is that you can start playing from an empty board, so if you create a new board while 0-stacks are enabled the editor will not automatically place a neutral 2-stack.

The score display counts stacks + controlled empty cells for each side.

### AI
Click the "AI move" button to make the AI play one move. Check "Autorespond" to make the AI respond to all your moves. Note that the AI is very weak at the moment!

### Other tips and tricks
Hold down shift when hovering over a hex to display the coordinates of that hex.

Hold down control to display secure territories (these are cells which will definitely be controlled by one player at the end of the game).

Double click panel titles to collaps/expand them.

Press space to hide panels completely.

### Contact
If you have questions/bug reports/feature suggestions, let me know in the #computer-implementations channel of the [Tumbleweed discord](https://discord.gg/PxHMNNCsa4)!



