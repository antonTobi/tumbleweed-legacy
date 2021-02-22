// TODO: Better board.toString(), probably with run-length encoding.

// TODO: Save game history in board.toString() somehow.

// TODO: Come up with format for saving games + variations. Possibly just use sgf?

const letterCoordinates = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function setup() {
    textAlign(CENTER, CENTER)
    ellipseMode(RADIUS)

    createButton('New board').mousePressed(() => {
        let n = Number(boardSize.value())
        board = new Board(n)
        updateScores()
        storeItem('boardsize', n)
        windowResized()
    })

    boardSize = createSelect()

    for (let i = 3; i <= 10; i ++) {
        boardSize.option(i)
    }

    

    boardSize.selected(getItem('boardsize') || 8)

    boardSize.changed(() => {
        // let n = Number(boardSize.value())
        // board = new Board(n)
        // updateScores()
        storeItem('boardsize', boardSize.value())
        // windowResized()
    })

    createButton('Link').mousePressed(() => {
        let s = board.toString()
        history.pushState({}, '', '?board=' + s)
        storeItem('board', s)

    })

    defaults = {
        influence: false,
        lines: true,
        captures: true,
        lastMove: true,
        nextMove: true,
        coordinates: true,
        // autorespond: false,
        zeroStacks: false,
        suicides: false
    }

    displayNames = {
        influence: 'Influence',
        lines: 'Lines of sight',
        captures: 'Captures',
        lastMove: 'Last move',
        nextMove: 'Next move',
        coordinates: 'Coordinates',
        // autorespond: 'Autorespond',
        zeroStacks: '0-stacks',
        suicides: 'Suicides'
    }

    for (let option in defaults) {
        let value = getItem(option)
        if (value == null) value = defaults[option]
        window[option] = createCheckbox(displayNames[option], value).changed(() => {
            storeItem(option, window[option].checked())
            if (option == 'coordinates') windowResized()
        })
    }

    let boardString = getURLParams().board // || getItem('board')

    if (boardString) {
        board = loadBoard(boardString)
    } else {
        board = new Board(getItem('boardsize') || 8)
    }

    // createP('Size: ')

    windowResized()

    moveNumber = createP()

    createButton('Pass').mousePressed(() => {
        board.pass()
        updateScores()
    })
    createButton('Undo').mousePressed(() => {
        board.undo()
        updateScores()
    })
    // createButton('AI Move').mousePressed(genmove)
    scoreP = createP()
    // evaluation = createP()

    stackColors = {
        '1': color(240, 0, 0),
        '0': 'gray',
        '-1': 'white'
    }
    
    hexColors = {
        '0': '#FF8888',
        '-1': '#FFCCCC',
        '1': '#FF4444'
    }

    // colorPicker1 = createColorPicker('red').changed( () => {
    //     stackColors[1] = colorPicker1.color()
    // })
    // colorPicker2 = createColorPicker('white').changed( () => {
    //     stackColors[-1] = colorPicker2.color()
    // })

    createA('https://github.com/le4TC/tumbleweed', 'Help', '_blank')

    updateScores()
}

function genmove() {
    board.genmove(2)
    updateScores()
}

function updateScores() {
    let redScore = 0
    let whiteScore = 0
    for (let H of board.hexes) {
        if (H.color == 1) redScore ++
        else if (H.color == -1) whiteScore ++
        else if (H.color == null) {
            if (H[1] > H[-1]) redScore ++
            if (H[-1] > H[1]) whiteScore ++
        }
    }

    moveNumber.elt.innerHTML = 'Move ' + (board.moveNumber + 1) + ' (' + ((board.turn > 0) ? 'red' : 'white') + ' to play)'
    scoreP.elt.innerHTML = 'Score: ' + redScore + ' - ' + whiteScore
    // redScoreP.elt.innerHTML = 'Red score: ' + redScore
    // whiteScoreP.elt.innerHTML = 'White score: ' + whiteScore
    // evaluation.elt.innerHTML = 'Eval: ' + board.evaluate()
}

function draw() {
    clear()

    let N = board.size
    let number, letter

    // make temporary move
    let temp
    let M = L.pixelToHex(new Point(mouseX, mouseY)).round()
    if (board.contains(M.q, M.r)) {
        number = M.r + N
        letter = letterCoordinates[M.q + number - 1]
        M = board[M.q][M.r]
        if (nextMove.checked() && board.isLegal(M)) {
            temp = true
            board.move(M.q, M.r)
        }
    }

    if (coordinates.checked()) {
        push()
        textSize(R/2)
        noStroke()
        for (let q = 1; q < N+1; q ++) {
            let r = -N
            let H = new Hex(q, r, -q-r)
            let center = L.hexToPixel(H)
            noStroke()
            if (letterCoordinates[q-1] == letter) {
                fill('black')
            } else {
                fill(200)
            }
            text(letterCoordinates[q-1], center.x, center.y)
            push()
            translate(center.x, center.y)
            rotate(TAU/12)
            stroke(200)
            strokeWeight(medium)
            line(0, R/2, 0, R)
            pop()
        }

        for (let r = -N+1; r < 0; r ++) {
            let q = N
            let H = new Hex(q, r, -q-r)
            let center = L.hexToPixel(H)
            if (letterCoordinates[2*N + r - 1] == letter) {
                fill('black')
            } else {
                fill(200)
            }
            text(letterCoordinates[2*N + r - 1], center.x, center.y)
            push()
            translate(center.x, center.y)
            rotate(TAU/12)
            stroke(200)
            strokeWeight(medium)
            line(0, R/2, 0, R)
            pop()
        }

        for (let r = -N+1; r < N; r ++) {
            let q = max(-N-r, -N)
            let H = new Hex(q, r, -q-r)
            let center = L.hexToPixel(H)
            noStroke()
            if (r + N == number) {
                fill('black')
            } else {
                fill(200)
            }
            text(r+N, center.x, center.y)
            stroke(200)
            strokeWeight(medium)
            line(center.x + R/2, center.y, center.x + R, center.y)
        }
        pop()
    }


    

    // draw hexes
    for (let q = -N+1; q < N; q ++) {
        for (let r = -N+1; r < N; r ++) {
            let s = -q-r
            if (abs(s) < N) {
                let H = board[q][r]
                // let center = L.hexToPixel(H)
                if (H.color != null) {
                    // fill(hexColors[H.color])
                    // if (H.color && H[-H.color] > H.height) {
                    //     fill(stackColors[-H.color])
                    // }
                    if (H.color) fill(hexColors[H.color])
                    else fill(50)
                    // fill(50)
                    
                } else {
                    if (H[1] == 0 && H[-1] == 0) {
                        fill(50)
                    } else {
                        fill(hexColors[Math.sign(H[1]-H[-1])])
                    }
                    
                }
                
                if (!influence.checked()) fill('#EAC185')
                stroke('white')
                strokeWeight(thin)
                beginShape()
                for (let corner of L.polygonCorners(H)) {
                    vertex(corner.x, corner.y)
                }
                endShape(CLOSE)
            }
            
        }
    }

    // highlight marked hex
    if (board.contains(M.q, M.r)) {
        stroke('black')
        noFill()
        strokeWeight(medium)
        noStroke()
        fill(influence.checked() ? 255 : 0, 50)
        beginShape()
        for (let corner of L.polygonCorners(M)) {
            vertex(corner.x, corner.y)
        }
        endShape(CLOSE)
    }


    // draw lines
    if (temp && lines.checked() && board.moveHistory.length) {
        let [p, q, c, h] = board.moveHistory[board.moveHistory.length - 1]
        let M = board[p][q]
        let center = L.hexToPixel(M)
        for (let i = 0; i < 6; i ++) {
            let distance = M.distances[i]
            let direction = Hex.directions[i]
            if (distance) {
                let stack = board[M.q+distance*direction.q][M.r+distance*direction.r]
                if (stack.color) {
                    
                    let target = L.hexToPixel(stack)
                    // stroke('black')
                    // strokeWeight(round(0.2*stackR) + 2 * thin)
                    // line(center.x, center.y, target.x, target.y)
                    stroke(stackColors[stack.color])
                    stroke(0, 50)
                    
                    
                    strokeWeight(round(0.2*stackR))
                    line(center.x, center.y, target.x, target.y)
                }
            }
        }
    }


    // draw stacks
    for (let q = -N+1; q < N; q ++) {
        for (let r = -N+1; r < N; r ++) {
            let s = -q-r
            if (abs(s) < N) {
                let H = board[q][r]
                let center = L.hexToPixel(H)
                if (H.color != null) {
                    fill(stackColors[H.color])
                    
                    if (captures.checked()) {
                        strokeWeight(thick)
                        if (H.color) {
                            if (H.playableFor(-H.color)) {
                                stroke(stackColors[-H.color])
                            } else {
                                stroke('black')
                                strokeWeight(thin)
                            }
                        } else {
                            if (H.playableFor(1)) {
                                if (H.playableFor(-1)) {
                                    stroke(hexColors[0])
                                } else {
                                    stroke(stackColors[1])
                                }
                            } else {
                                if (H.playableFor(-1)) {
                                    stroke(stackColors[-1])
                                } else {
                                    stroke('black')
                                    strokeWeight(thin)
                                }
                            }
                        }
                    } else {
                        stroke('black')
                        strokeWeight(thin)
                    }
                    
                    circle(center.x, center.y, stackR)
                    strokeWeight(thin)
                    fill('black')
                    if (H.color == 1) {
                        fill(stackColors[-1])
                        // if (H.playableFor(-1)) {
                        //     fill(255, 127)
                        // }
                    }
                    if (H.color == -1) {
                        // if (H.playableFor(1)) {
                        //     fill(0, 127)
                        // }
                    }
                    if (H.color == 0) {
                        fill(50)
                    }
                    if (H.height > 6) {
                        noFill()
                    }
                    noStroke()

                    textSize(R)
                    text(H.height, center.x, center.y+1)


                    // show strength
                    // if (H.color) {
                    //     push()
                    //     textSize(R/4)
                    //     text(H.strength.toFixed(2), center.x, center.y + R/2)
                    //     pop()
                    // }
                    
                }
            }
        }
    }

    // last move indicator

    if (lastMove.checked()) {
        for (let i = board.moveHistory.length - 1; i >= 0 && (i > board.moveHistory.length - 2 - !!temp); i --) {
            push() 
            let move = board.moveHistory[i]
            if (move == null) continue
            let [q, r, c, h] = move

            let H = board[q][r]
            if (H.playableFor(-H.color)) continue
            if (H.color != null) {
                let center = L.hexToPixel(board[q][r])
                stroke('black')
                strokeWeight(thick)
                noFill()
                circle(center.x, center.y, stackR)
            }
            pop()
        }
    }


    // show loud moves
    // for (let H of board.loudMoves()) {
    //     let center = L.hexToPixel(H)
    //     push()
    //     stroke('black')
    //     strokeWeight(thick)
    //     noFill()
    //     circle(center.x, center.y, stackR)
    //     pop()
    // }

    if (temp) {
        board.undo()
    }

    // if (board.contains(M.q, M.r) && mouseIsPressed && mouseButton == RIGHT) {
    //     fill('black')
    //     noStroke()
    //     text(letter + number, 50, 50)
    // }

}

function mousePressed() {
    if (mouseButton == LEFT) {
        let H = L.pixelToHex(new Point(mouseX, mouseY)).round()
        if (board.contains(H.q, H.r, H.s)) {
            H = board[H.q][H.r]
            if (board.isLegal(H)) {
                board.move(H.q, H.r)
                updateScores()
                // if (autorespond.checked()) {
                //     setTimeout(genmove, 1)
                // }
                
            }
        }
    }
    
}

function keyPressed() {
    let color, height
    if (keyCode == BACKSPACE) {
        color = null
        height = -1
    } else {
        let i = ('asdfghjk' + 'zxcvbnm,' + 'qwertyui').indexOf(key)
        if (i == -1) return
        height = i % 8
        color = (i - height) / 8 - 1
    }
    let H = L.pixelToHex(new Point(mouseX, mouseY)).round()
    if (board.contains(H.q, H.r, H.s)) {
        H = board[H.q][H.r]
        if (height != H.height || color != H.color) {
            board.update(H.q, H.r, color, height)
            updateScores()
        }
        
    }
}

function windowResized() {
    let N = board.size + coordinates.checked()
    let Rx = windowWidth/(2*sqrt(3)*N)
    let Ry = windowHeight/(3*N)
    thin = 1
    medium = 2
    thick = 4
    R = floor(min(Rx, Ry))
    resizeCanvas(R*2*sqrt(3)*N, R*3*N)
    stackR = floor(R*sqrt(3)/2*0.9)
    textSize(R)
    strokeWeight(thin)
    L = new Layout(Layout.pointy, new Point(R, R), new Point(round(width/2), round(height/2)))
}