const letterCoordinates = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

mode = 'default';

function setup() {
    canvas = createCanvas(100, 100)
    canvas.mouseClicked(clickHandler);
    textAlign(CENTER, CENTER);
    textFont('Helvetica');
    ellipseMode(RADIUS);
    noLoop();

    panelWidth = 150;

    gameplay = QuickSettings.create(0, 0, 'Gameplay options')
        .setDraggable(false)
        .addButton('New empty board', newBoardPrompt)
        .addButton('Make random pie', makeRandomPie)
        // .addButton('Make random problem', () => {board = randomProblem(2); update()})
        .addButton('Load random problem', loadRandomProblem)
        .addButton('Make capture problem', generateCaptureProblem)
        .addButton('Make AI move', genmove)
        .addBoolean('Autorespond', false)
        .addBoolean('Suicidal moves', false)
        .addBoolean('0-stacks', false)

        // .addButton('Pass', () => {board.pass(); update()})
        // .addButton('Undo', () => {board.undo(); update()})
        .saveInLocalStorage('gameplay')
        .setWidth(panelWidth)
        .addHTML(
            'Links',
            `<a href="https://boardgamegeek.com/boardgame/318702/tumbleweed" target="_blank">Tumbleweed on BGG</a>
        <br><br> <a href="https://github.com/le4TC/tumbleweed#playing" target="_blank">Editor documentation</a>`
        )
        .hideTitle('Links')
        .addHTML('Game info', '')
        .hideTitle('Game info');

    visualization = QuickSettings.create(
        windowWidth - panelWidth,
        0,
        'Visualization options'
    )
        .setDraggable(false)
        .setGlobalChangeHandler(update)
        .addBoolean('Influence', false)
        .addBoolean('Lines of sight', true)
        .addBoolean('Captures', true)
        .addBoolean('Last move', true)
        .addBoolean('Move preview', true)
        .addBoolean('Coordinates', false)
        .addBoolean('Winner outline', true)
        // .addHTML('Controls', '<button type="button">Click Me!</button>')
        // .hideTitle('Controls')
        .saveInLocalStorage('visualization')
        .setWidth(panelWidth);

    buttonWidth = 50;
    buttonHeight = 30;
    undoButton = createButton('Undo')
        .mousePressed(undo)
        .size(buttonWidth, buttonHeight);
    passButton = createButton('Pass')
        .mousePressed(pass)
        .size(buttonWidth, buttonHeight);

    let boardString = getURLParams().board;

    if (boardString) {
        board = loadBoard(boardString);
    } else {
        // board = new Board(6)
        board = new Board(getItem('boardsize') || 6);
    }

    stackColors = {
        1: color(240, 0, 0),
        0: 'gray',
        '-1': 'white',
    };

    strokeColors = {
        1: color(200, 0, 0),
        0: color(100),
        '-1': color(200),
    };

    hexColors = {
        1: color(255, 0, 0, 127),
        '-1': color(255, 255, 255, 127),
        0: color(255, 127, 127, 127),
        null: color(20),
    };

    boardColor = color('#EAD185');
    boardStrokeColor = lerpColor(boardColor, color(0), 0.2);

    update();
}

function newBoardPrompt() {
    let size = prompt('Board size (2-11)', board.size);
    if (size) {
        size = Number(size);
        if (2 <= size && size <= 11) {
            storeItem('boardsize', size);
            board = new Board(size);
            update();
        }
    }
}

function genmove() {
    board.genmove(4);
    update();
}

function pass() {
    board.pass();
    update();
    if (gameplay.getValue('Autorespond')) setTimeout(genmove, 1);
}

function undo() {
    board.undo();
    if (gameplay.getValue('Autorespond')) board.undo();
    update();
}

function update() {
    updateURL();
    windowResized();
    board.checkSecurePoints();
    updateScores();
    redraw();
}

function updateScores() {
    let score = [0, 0];
    score[-1] = 0;
    for (let H of board.hexes) {
        if (H.eventualOwner) {
            score[H.eventualOwner]++;
        } else if (H.color != null) {
            score[H.color]++;
        } else {
            score[Math.sign(H[1] - H[-1])]++;
        }
    }
    gameplay.setValue(
        'Game info',
        `
    Move ${board.moveNumber + 1} (${board.turn > 0 ? 'red' : 'white'
        } to play)<br>
    Red score: ${score[1]}<br>
    White score: ${score[-1]}<br>
    Uncontrolled cells: ${score[0]}`
    );
    return score[1] - score[-1];
}

function draw() {
    clear();

    let N = board.size;
    let number, letter;

    let lastMoveHex;
    let move = board.moveHistory[board.moveHistory.length - 1];
    if (visualization.getValue('Last move') && move && board.moveNumber > 2) {
        let [q, r, c, h] = move;
        lastMoveHex = board[q][r];
    }

    // background
    if (visualization.getValue('Winner outline') && board.winner) {
        fill(strokeColors[board.winner]);
        noStroke();
        let center = L.hexToPixel(board[0][0]);
        regularPolygon(
            center.x,
            center.y,
            (board.size - 0.5) * R * sqrt(3),
            6,
            0
        );
    }

    // draw coordinates
    if (visualization.getValue('Coordinates')) {
        push();
        textSize(0.8 * R);
        noStroke();
        for (let q = 1; q < N + 1; q++) {
            let r = -N;
            let H = new Hex(q, r, -q - r);
            let center = L.hexToPixel(H);
            noStroke();
            if (letterCoordinates[q - 1] == letter) {
                fill('black');
            } else {
                fill(200);
            }
            fill('black');
            text(letterCoordinates[q - 1], center.x, center.y);
            push();
            translate(center.x, center.y);
            rotate(TAU / 12);
            stroke(200);
            strokeWeight(medium);
            line(0, R / 2, 0, R);
            pop();
        }

        for (let r = -N + 1; r < 0; r++) {
            let q = N;
            let H = new Hex(q, r, -q - r);
            let center = L.hexToPixel(H);
            if (letterCoordinates[2 * N + r - 1] == letter) {
                fill('black');
            } else {
                fill(200);
            }
            fill('black');
            text(letterCoordinates[2 * N + r - 1], center.x, center.y);
            push();
            translate(center.x, center.y);
            rotate(TAU / 12);
            stroke(200);
            strokeWeight(medium);
            line(0, R / 2, 0, R);
            pop();
        }

        for (let r = -N + 1; r < N; r++) {
            let q = max(-N - r, -N);
            let H = new Hex(q, r, -q - r);
            let center = L.hexToPixel(H);
            noStroke();
            if (r + N == number) {
                fill('black');
            } else {
                fill(200);
            }
            fill('black');
            text(r + N, center.x, center.y);
            stroke(200);
            strokeWeight(medium);
            line(center.x + R / 2, center.y, center.x + R, center.y);
        }
        pop();
    }

    // draw empty hexes
    strokeWeight(thick);
    fill(boardColor);
    stroke(boardStrokeColor);
    for (let H of board.hexes) {
        let center = L.hexToPixel(H);
        regularPolygon(center.x, center.y, R, 6);
    }

    if (visualization.getValue('Influence')) {
        for (let H of board.hexes) {
            let center = L.hexToPixel(H);
            if (H[1] || H[-1]) {
                fill(hexColors[Math.sign(H[1] - H[-1])]);
                noStroke();
                regularPolygon(center.x, center.y, R, 6);
            }
        }
    }

    // make temporary move
    let temp;
    let M = L.pixelToHex(new Point(mouseX, mouseY)).round();
    if (board.contains(M.q, M.r)) {
        number = M.r + N;
        letter = letterCoordinates[M.q + number - 1];
        M = board[M.q][M.r];
        if (visualization.getValue('Move preview') && board.isLegal(M)) {
            temp = M;
            board.move(M.q, M.r);
        }
    }

    // highlight marked hex
    // if (board.contains(M.q, M.r)) {
    //     stroke('black')
    //     noFill()
    //     strokeWeight(medium)
    //     noStroke()
    //     fill(influence.checked() ? 255 : 0, 50)
    //     beginShape()
    //     for (let corner of L.polygonCorners(M)) {
    //         vertex(corner.x, corner.y)
    //     }
    //     endShape(CLOSE)
    // }

    // draw lines
    if (
        visualization.getValue('Lines of sight') &&
        board.moveHistory.length &&
        temp
    ) {
        let [p, q, c, h] = board.moveHistory[board.moveHistory.length - 1];
        let M = board[p][q];
        let center = L.hexToPixel(M);
        for (let i = 0; i < 6; i++) {
            let distance = M.distances[i];
            let direction = Hex.directions[i];
            if (distance) {
                let stack =
                    board[M.q + distance * direction.q][
                    M.r + distance * direction.r
                    ];
                if (stack.color) {
                    let target = L.hexToPixel(stack);
                    stroke(stackColors[stack.color]);
                    stroke(0, 50);

                    strokeWeight(round(0.2 * stackR));
                    line(center.x, center.y, target.x, target.y);
                }
            }
        }
    }

    // draw stacks
    for (let H of board.hexes) {
        let center = L.hexToPixel(H);
        if (H.color != null) {
            fill(stackColors[H.color]);
            stroke(strokeColors[H.color]);
            if (H == lastMoveHex && !keyIsDown(CONTROL)) {
                stroke('black');
            }
            strokeWeight(medium * 2);
            if (visualization.getValue('Captures')) {
                if (H.color) {
                    if (H.playableFor(-H.color)) {
                        stroke(stackColors[-H.color]);
                    }
                } else {
                    if (H.playableFor(1)) {
                        if (H.playableFor(-1)) {
                            stroke(hexColors[0]);
                        } else {
                            stroke(stackColors[1]);
                        }
                    } else {
                        if (H.playableFor(-1)) {
                            stroke(stackColors[-1]);
                        }
                    }
                }
            }

            regularPolygon(center.x, center.y, R - medium, 6);

            noStroke();

            // show stack height
            if (H.height != 7) {
                noStroke();
                if (H.color == 1) fill('white');
                if (H.color == -1) fill('black');
                if (H.color == 0) fill(50);
                centered(H.height, center.x, center.y, 1.1 * R);
            }

            // show strength
            // if (H.color) {
            //     push()
            //     textSize(R/4)
            //     text(H.strength.toFixed(2), center.x, center.y + R/2)
            //     pop()
            // }

            if (H == temp) {
                fill('#EAD18570');
                noStroke();
                regularPolygon(center.x, center.y, R, 6);
            }
        }
    }

    if (keyIsDown(CONTROL)) {
        strokeWeight(medium * 2);
        for (let H of board.hexes) {
            let center = L.hexToPixel(H);
            if (H.eventualOwner) {
                fill(stackColors[H.eventualOwner]);
                stroke(strokeColors[H.eventualOwner]);
                regularPolygon(center.x, center.y, R - medium, 6);
                regularPolygon(center.x, center.y, R - medium * 5, 6);
                // regularPolygon(center.x, center.y, R-medium*9, 6)
            }
        }
    }

    if (board.contains(M.q, M.r) && keyIsDown(SHIFT)) {
        let center = L.hexToPixel(M);
        fill(0, 200);
        circle(center.x, center.y, 0.7 * R);
        fill(255);
        centered(letter + number, center.x, center.y, 0.7 * R);
        // centered(M.q + ", " + M.r, center.x, center.y, 0.5 * R);
    }

    // show loud moves
    // for (let H of board.loudMoves()) {
    //     let center = L.hexToPixel(H)
    //     push()
    //     stroke(0, 127)
    //     strokeWeight(thick)
    //     noFill()
    //     regularPolygon(center.x, center.y, 0.8*R, 6)
    //     pop()
    // }

    if (temp) {
        board.undo();
    }

    // if (board.contains(M.q, M.r) && mouseIsPressed && mouseButton == RIGHT) {
    //     fill('black')
    //     noStroke()
    //     text(letter + number, 50, 50)
    // }
}

function getHexFromCoordinates(x, y) {
    let H = L.pixelToHex(new Point(x, y)).round();
    if (board.contains(H.q, H.r)) return board[H.q][H.r];
    return false;
}

oldM = false;

function mouseMoved() {
    newM = getHexFromCoordinates(mouseX, mouseY);
    if (newM != oldM) {
        oldM = newM;
        redraw();
    }
}

function clickHandler() {
    if (mouseButton == LEFT) {
        let H = L.pixelToHex(new Point(mouseX, mouseY)).round();
        if (board.contains(H.q, H.r, H.s)) {
            if (mode == "capture" && board.moveNumber) {
                undo();
                return;
            }
            H = board[H.q][H.r];
            if (board.isLegal(H)) {
                board.move(H.q, H.r);
                update();
                if (gameplay.getValue('Autorespond')) {
                    if (mode == "capture") {
                        for (let H of board.legalMoves()) {
                            board.move(H.q, H.r);
                            if (board.captureAvailable()) {
                                board.undo();
                            } else {
                                update();
                                return;
                            }
                        }
                        generateCaptureProblem();
                    } else {
                        setTimeout(genmove, 1);
                    }

                }
            }
        }
    }
    return;
}

function keyPressed() {
    redraw();
    if (keyIsDown(CONTROL)) {
        if (key == 'i') {
            board.invertColors();
            update();
            return;
        }
    }
    if (key == ' ') {
        visualization.toggleVisibility();
        gameplay.toggleVisibility();
        return;
    }
    if (key == 'p') {
        pass();
    }
    let color, height;
    if (keyCode == BACKSPACE) {
        color = null;
        height = -1;
    } else {
        let i = ('asdfghjk' + 'zxcvbnm,' + 'qwertyui').indexOf(key);
        if (i == -1) return;
        height = i % 8;
        color = (i - height) / 8 - 1;
    }
    let H = L.pixelToHex(new Point(mouseX, mouseY)).round();
    if (board.contains(H.q, H.r, H.s)) {
        H = board[H.q][H.r];
        if (height != H.height || color != H.color) {
            board.update(H.q, H.r, color, height, false);
            update();
        }
    }
}

function keyReleased() {
    redraw();
}

function windowResized() {
    let N = board.size + visualization.getValue('Coordinates');
    let w = window.innerWidth;
    let h = window.innerHeight;
    let Rx = w / (2 * sqrt(3) * N);
    let Ry = (h - buttonHeight) / (3 * N);
    thin = 1;
    medium = 2;
    thick = 4;
    R = floor(min(Rx, Ry));
    resizeCanvas(R * 2 * sqrt(3) * N, R * 3 * N);
    stackR = floor((R * sqrt(3)) / 2);
    textSize(R);
    strokeWeight(thin);
    L = new Layout(
        Layout.pointy,
        new Point(R, R),
        new Point(round(width / 2), round(height / 2))
    );
    visualization.setPosition(w - panelWidth, 0);
    undoButton.position(w / 2 - buttonWidth, h - buttonHeight);
    passButton.position(w / 2, h - buttonHeight);
    redraw();
}

function regularPolygon(x, y, r, n, offset = -TAU / 4) {
    push();
    translate(x, y);
    beginShape();
    for (let i = 0; i < n; i++) {
        let theta = (i * TAU) / n + offset;
        vertex(r * cos(theta), r * sin(theta));
    }
    endShape(CLOSE);
    pop();
}

// fix to center text properly
function centered(s, x, y, r) {
    textSize(r);
    text(s, x, y + 0.05 * r);
}

function updateURL() {
    let s = board.toString();
    history.replaceState({}, '', '?board=' + s);
    storeItem('board', s);
}

function loadRandomProblem() {
    board = loadBoard(random(problems), true);
    update();
}

function generateCaptureProblem() {
    board = randomCaptureIn2Puzzle(board.size);
    mode = "capture";
    update();
}

// function makeRandomPie() {
//     do {
//         board = new Board(max(board.size, 4))
//         let redQ = 0
//         let redR = -floor(random(1, board.size))
//         let redS = -redQ-redR
//         board.move(redQ, redR)
//         let whiteQ, whiteR, whiteS
//         do {
//             whiteQ = -floor(random(1, board.size-1))
//             whiteR = floor(random(-board.size + 2 - whiteQ, board.size-1))
//             whiteS = -whiteQ-whiteR
//         } while (whiteR == redR || whiteS == redS || whiteR == 0 || whiteS == 0)
//         board.move(whiteQ, whiteR)
//     } while (updateScores() >= 0)

//     update()
// }


function makeRandomPie() {
    do {
        board = new Board(max(board.size, 6));
        let R = random(board.hexes.filter(H => H.height == -1));
        board.move(R.q, R.r);
        let W = random(board.hexes.filter(H => H.height == -1 && H[1] == 0));
        board.move(W.q, W.r);
    } while (updateScores() >= -(2 * board.size - 6));

    update();
}