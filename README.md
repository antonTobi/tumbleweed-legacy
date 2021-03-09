### Playing
You can place alternating legal moves by clicking on the board. To pass or undo use the buttons to the left of the board.

### Editing

Use backspace to remove stacks, or any of these keys to place stacks of different heights and colors:

|       | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|-------|---|---|---|---|---|---|---|---|
| red   | q | w | e | r | t | y | u | i |
| white | a | s | d | f | g | h | j | k |
| gray  | z | x | c | v | b | n | m | , |

7-stacks behave identically as 6-stacks, but are shown as blank. This may be useful to create some diagrams.

### Sharing
To share an interactive board, simply copy the URL which encodes the current position (for now the URL does not contain any game history unfortunately).

To share an image of the board, right click the white area to the lower right of the board and choose "Copy image". Then you can Ctrl+V in Discord or Facebook to attach the board diagram to a message.

### Visualization options
- Influence: shows which player has more control over each empty hex.
- Lines of sight: draws lines from the move you're about to place to the other stacks it can see (only if "Next move" is enabled)
- Captures: indicates stacks that can be captured with a red/white border.
- Last move: marks the last move made with a black border.
- Move preview: shows what move you will make if you click right now.

If you change "Stack style" to "Circle" you get circular stacks on a go-style grid. This style doesn't really work with the influence option and is buggy in some other ways.

### Gameplay options
- 0-stacks: Allows placement where you have no lines of sight.
- Suicides: Allows suicidal moves.

Note that suicides are never good moves, so I recommend having them disabled normally. This setting also affects how the capture visualization works: a 1-stack that can be captured, but only with a suicidal move, is not shown as capturable when suicides are disabled.

0-stacks are *not* allowed in the official rules.

### Other tips and tricks
Hold down shift when hovering over a hex to display the coordinates of that hex.

### Contact
If you have questions/bug reports/feature suggestions, let me know in the #computer-implementations channel of the [Tumbleweed discord](https://discord.gg/PxHMNNCsa4)!


<!-- ### AI
There is a basic weak AI built into the editor. Click the "AI move" button to make the AI play a move. Check "Autorespond" to make the AI respond to all your moves. -->
