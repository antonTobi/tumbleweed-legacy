const letterCoordinates = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function setup() {
    textAlign(CENTER, CENTER)
    textFont('Helvetica')
    ellipseMode(RADIUS)

    panelWidth = 150

    gameplay = QuickSettings.create(0, 0, 'Gameplay options')
        .setDraggable(false)
        .addButton('New empty board', newBoardPrompt)
        .addButton('Make AI move', genmove)
        .addBoolean('Autorespond', false)
        .addBoolean('Suicidal moves', false)
        .addBoolean('0-stacks', false)
        
        
        
        // .addButton('Pass', () => {board.pass(); update()})
        // .addButton('Undo', () => {board.undo(); update()})
        .saveInLocalStorage('gameplay')
        .setWidth(panelWidth)
        .addHTML('Links', `<a href="https://boardgamegeek.com/boardgame/318702/tumbleweed" target="_blank">Tumbleweed on BGG</a>
        <br><br> <a href="https://github.com/le4TC/tumbleweed#playing" target="_blank">Editor documentation</a>`)
        .hideTitle('Links')
        .addHTML('Game info', '')
        .hideTitle('Game info')

    visualization = QuickSettings.create(windowWidth-panelWidth, 0, 'Visualization options')
        .setDraggable(false)
        .setGlobalChangeHandler(update)
        .addBoolean('Influence', false)
        .addBoolean('Lines of sight', true)
        .addBoolean('Captures', true)
        .addBoolean('Last move', true)
        .addBoolean('Move preview', true)
        .addBoolean('Coordinates', false)
        // .addHTML('Controls', '<button type="button">Click Me!</button>')
        // .hideTitle('Controls')
        .saveInLocalStorage('visualization')
        .setWidth(panelWidth)

    // defaults = {
    //     influence: false,
    //     lines: true,
    //     captures: true,
    //     lastMove: true,
    //     nextMove: true,
    //     coordinates: true,
    //     // autorespond: false,
    //     zeroStacks: false,
    //     suicides: false
    // }

    // displayNames = {
    //     influence: 'Influence',
    //     lines: 'Lines of sight',
    //     captures: 'Captures',
    //     lastMove: 'Last move',
    //     nextMove: 'Move preview',
    //     coordinates: 'Coordinates',
    //     // autorespond: 'Autorespond',
    //     zeroStacks: '0-stacks',
    //     suicides: 'Suicides'
    // }

    // for (let option in defaults) {
    //     let value = getItem(option)
    //     if (value == null) value = defaults[option]
    //     window[option] = createCheckbox(displayNames[option], value).changed(() => {
    //         storeItem(option, window[option].checked())
    //         if (option == 'coordinates') windowResized()
    //     })
    // }

    // createP()
    // createDiv('Stack style:')
    // stackStyle = createSelect()
    // stackStyle.option('Hex')
    // stackStyle.option('Circle')

    buttonWidth = 50
    buttonHeight = 30
    undoButton = createButton('Undo')
        .mousePressed(() => {board.undo(); update()})
        .size(buttonWidth, buttonHeight)
    

    passButton = createButton('Pass')
        .mousePressed(() => {
            board.pass()
            update()
            if (gameplay.getValue('Autorespond')) setTimeout(genmove, 1)
        })
        .size(buttonWidth, buttonHeight)
    let boardString = getURLParams().board // || getItem('board')

    if (boardString) {
        board = loadBoard(boardString)
    } else {
        board = new Board(getItem('boardsize') || 8)
    }

    windowResized()

    // moveNumber = createP()

    // scoreP = createP()
    // evaluation = createP()

    stackColors = {
        '1': color(240, 0, 0),
        '0': 'gray',
        '-1': 'white'
    }

    strokeColors = {
        '1': color(200, 0, 0),
        '0': color(100),
        '-1': color(200)
    }
    
    hexColors = {
        '1': color(255, 0, 0, 127),
        '-1': color(255, 255, 255, 127),
        '0': color(255, 127, 127, 127),
        null: color(20)
    }

    boardColor = color('#EAD185')
    // boardColor = color(random(255), random(255), random(255))
    // boardStrokeColor = color(0, 100)
    
    // lastMoveColor = lerpColor(boardColor, color(0), 0.8)
    boardStrokeColor = lerpColor(boardColor, color(0), 0.2)

    // colorPicker1 = createColorPicker('red').changed( () => {
    //     stackColors[1] = colorPicker1.color()
    // })
    // colorPicker2 = createColorPicker('white').changed( () => {
    //     stackColors[-1] = colorPicker2.color()
    // })

    // createA('https://boardgamegeek.com/boardgame/318702/tumbleweed', 'Rules', '_blank')

    updateScores()

    // colorPickerA = createColorPicker('#ff0000')
}

function newBoardPrompt() {
    let size = prompt('Board size (2-11)', board.size)
    if (size) {
        size = Number(size)
        if (2 <= size && size <= 11) {
            board = new Board(size)
            update()
        }
    }
}

function genmove() {
    board.genmove(3)
    update()
}

function update() {
    updateScores()
    updateURL()
    windowResized()
}

function updateScores() {
    let redScore = 0
    let whiteScore = 0
    let neutralScore = 0
    for (let H of board.hexes) {
        if (H.color == 1) redScore ++
        else if (H.color == -1) whiteScore ++
        else if (H.color == 0) neutralScore ++
        else if (H.color == null) {
            if (H[1] > H[-1]) redScore ++
            else if (H[-1] > H[1]) whiteScore ++
            else neutralScore ++
        }
    }
    let s = ''
    s += 'Move ' + (board.moveNumber + 1) + ' (' + ((board.turn > 0) ? 'red' : 'white') + ' to play)'
    s += '<br>Red score: ' + redScore
    s += '<br>White score: ' + whiteScore
    s += '<br>Uncontrolled cells: ' + neutralScore
    gameplay.setValue('Game info', s)
}

function draw() {
    clear()

    let N = board.size
    let number, letter

    let lastMoveHex
    let move = board.moveHistory[board.moveHistory.length-1]
    if (visualization.getValue('Last move') && move && board.moveNumber > 2) {
        let [q, r, c, h] = move
        lastMoveHex = board[q][r]
    }

    // draw coordinates
    if (visualization.getValue('Coordinates')) {
        push()
        textSize(0.8*R)
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
            fill('black')
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
            fill('black')
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
            fill('black')
            text(r+N, center.x, center.y)
            stroke(200)
            strokeWeight(medium)
            line(center.x + R/2, center.y, center.x + R, center.y)
        }
        pop()
    }


    

    // draw empty hexes

    strokeWeight(thick)
    fill(boardColor)
    stroke(boardStrokeColor)
    for (let q = -N+1; q < N; q ++) {
        for (let r = -N+1; r < N; r ++) {
            if (abs(q+r) < N) {
                let H = board[q][r]
                let center = L.hexToPixel(H)
                regularPolygon(center.x, center.y, R, 6)                
            }
            
        }
    }

    


    if (visualization.getValue('Influence')) {
        for (let q = -N+1; q < N; q ++) {
            for (let r = -N+1; r < N; r ++) {
                if (abs(q+r) < N) {
                    let H = board[q][r]
                    let center = L.hexToPixel(H)
                    if (H[1] || H[-1]) {
                        fill(hexColors[Math.sign(H[1]-H[-1])])
                        // stroke(hexColors[null])
                        noStroke()
                        // strokeWeight(thin)
                        regularPolygon(center.x, center.y, R, 6)    
                    } else {
                        
                    }
                                
                }
                
            }
        }
        
    }


    // if (stackStyle.value() == 'Circle') {
    //     noStroke()
    //     let center = L.hexToPixel(board[0][0])
    //     regularPolygon(center.x, center.y, board.size * sqrt(3)*(R-1), 6, 0)

    //     strokeWeight(thick)
    //     stroke(boardStrokeColor)
    //     for (let q = -N+1; q < N; q ++) {
    //         for (let r = -N+1; r < N; r ++) {
    //             let s = -q-r
    //             if (abs(s) < N) {
    //                 let H = board[q][r]
    //                 let center = L.hexToPixel(H)
    //                 for (let d = 0; d < 6; d ++) {
    //                     let G = H.neighbor(d)
    //                     if (board.contains(G.q, G.r)) {
    //                         let target = L.hexToPixel(G)
    //                         line(center.x, center.y, target.x, target.y)
    //                     }
                        
    //                 }                
    //             }
    //         }
    //     }
    // }

    // make temporary move
    let temp
    let M = L.pixelToHex(new Point(mouseX, mouseY)).round()
    if (board.contains(M.q, M.r)) {
        number = M.r + N
        letter = letterCoordinates[M.q + number - 1]
        M = board[M.q][M.r]
        if (visualization.getValue('Move preview') && board.isLegal(M)) {
            temp = M
            board.move(M.q, M.r)
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
    if (visualization.getValue('Lines of sight') && board.moveHistory.length && temp) {
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
                    // noStroke()
                    // fill('black')
                    // circle(center.x+2, center.y+3, stackR)
                    fill(stackColors[H.color])
                    // stroke(boardStrokeColor)
                    // stroke(lerpColor(color(stackColors[H.color]), color(0), 0.3))
                    stroke(strokeColors[H.color])
                    if (H == lastMoveHex) {
                        stroke('black')
                    }
                    strokeWeight(medium*2)
                    if (visualization.getValue('Captures')) {
                        if (H.color) {
                            if (H.playableFor(-H.color)) {
                                stroke(stackColors[-H.color])
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
                                }
                            }
                        }
                    }
                    
                    // if (stackStyle.value() == 'Hex') {
                    //     regularPolygon(center.x, center.y, R-medium, 6)
                    // } else {
                    //     circle(center.x, center.y, stackR-medium)
                    // }
                    regularPolygon(center.x, center.y, R-medium, 6)

                    noStroke()
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
                        stroke(50)
                    }
                    if (H.height > 6) {
                        noFill()
                    }
                    noStroke()

                    centered(H.height, center.x, center.y, 1.1*R)

                    // drawDots(center.x, center.y, H.height)

                    // show strength
                    // if (H.color) {
                    //     push()
                    //     textSize(R/4)
                    //     text(H.strength.toFixed(2), center.x, center.y + R/2)
                    //     pop()
                    // }

                    if (H == temp) {
                        fill('#EAD18570')
                        noStroke()
                        // if (stackStyle.value() == 'Hex') {
                        //     regularPolygon(center.x, center.y, R, 6)
                        // } else {
                        //     circle(center.x, center.y, stackR)
                        // }
                        regularPolygon(center.x, center.y, R, 6)
                    }
                    
                }
            }
        }
    }

    if (board.contains(M.q, M.r) && keyIsDown(SHIFT)) {
        let center = L.hexToPixel(M)
        fill(0, 200)
        circle(center.x, center.y, 0.7*R)
        fill(255)
        centered(letter + number, center.x, center.y, 0.7*R)
    }

    // if (lastMoveHex) {
    //     let center = L.hexToPixel(lastMoveHex)
    //     stroke('black')
    //     strokeWeight(medium*2)
    //     noFill()
    //     circle(center.x, center.y, stackR-3*medium)
    // }


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
                update()
                if (gameplay.getValue('Autorespond')) {
                    setTimeout(genmove, 1)
                }
                
            }
        }
    }
    
}

function keyPressed() {
    let color, height
    if (key == ' ') {
        visualization.toggleVisibility()
        gameplay.toggleVisibility()
        return
    }
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
            update()
        }
        
    }
}

function windowResized() {
    let N = board.size + visualization.getValue('Coordinates')
    let Rx = windowWidth/(2*sqrt(3)*N)
    let Ry = (windowHeight-buttonHeight)/(3*N)
    thin = 1
    medium = 2
    thick = 4
    R = floor(min(Rx, Ry))
    resizeCanvas(R*2*sqrt(3)*N, R*3*N)
    stackR = floor(R*sqrt(3)/2)
    textSize(R)
    strokeWeight(thin)
    L = new Layout(Layout.pointy, new Point(R, R), new Point(round(width/2), round(height/2)))
    visualization.setPosition(windowWidth - panelWidth, 0)
    undoButton.position(windowWidth/2-buttonWidth, windowHeight - buttonHeight)
    passButton.position(windowWidth/2, windowHeight - buttonHeight)
}

function regularPolygon(x, y, r, n, offset = -TAU/4) {
    push()
    translate(x, y)
    beginShape()
    for (let i = 0; i < n; i ++) {
        let theta = i*TAU/n + offset
        vertex(r*cos(theta), r*sin(theta))
    }
    endShape(CLOSE)
    pop()
}

function drawDots(x, y, n) {
    if (n == 0) return
    let r = 0.1*R
    if (n == 1) {
        circle(x, y, r)
        return
    }

    for (let i = 0; i < n; i ++) {
        let theta = i*TAU/n - TAU/4
        circle(x + 0.4*R*cos(theta), y + 0.4*R*sin(theta), r)
    }
}


function centered(s, x, y, r) {
    textSize(r)
    text(s, x, y + 0.05*r)
}

function updateURL() {
    let s = board.toString()
    history.pushState({}, '', '?board=' + s)
    storeItem('board', s)
}