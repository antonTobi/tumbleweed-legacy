function setup() {
    textAlign(CENTER, CENTER)
    
    ellipseMode(RADIUS)

    let boardString = getURLParams().board

    if (boardString) {
        board = loadBoard(boardString)
    } else {
        board = new Board(8)
    }

    windowResized()

    createButton('6').mousePressed(() => {
        board = new Board(6)
        windowResized()
    })
    createButton('8').mousePressed(() => {
        board = new Board(8)
        windowResized()
    })
    createButton('10').mousePressed(() => {
        board = new Board(10)
        windowResized()
    })
    createButton('Link').mousePressed(() => {
        history.pushState({}, '', '?board=' + board.toString())
    })
    influence = createCheckbox('Influence', getItem('influence') || false).changed(() => {
        storeItem('influence', influence.checked())
    })

    redScoreP = createP()
    whiteScoreP = createP()

    updateScores()
}

function updateScores() {
    let redScore = 0
    let whiteScore = 0
    for (let H of board.hexes) {
        if (H.color == 1) redScore ++
        else if (H.color == -1) whiteScore ++
        else if (H.height == 0) {
            if (H.los[1] > H.los[-1]) redScore ++
            if (H.los[-1] > H.los[1]) whiteScore ++
        }
    }

    redScoreP.elt.innerHTML = 'Red score: ' + redScore
    whiteScoreP.elt.innerHTML = 'White score: ' + whiteScore
}

stackColors = {
    '1': 'red',
    '0': 'gray',
    '-1': 'white'
}

hexColors = {
    '0': '#FF8888',
    '-1': '#FFCCCC',
    '1': '#FF4444'
}

'0123456789abcdef'

function draw() {
    // background(150)
    clear()
    let N = board.size
    for (let q = -N+1; q < N; q ++) {
        for (let r = -N+1; r < N; r ++) {
            let s = -q-r
            if (abs(s) < N) {
                let H = board[q][r]
                let center = L.hexToPixel(H)
                let corners = L.polygonCorners(H)
                if (H.height) {
                    // fill(hexColors[H.color])
                    // if (H.color && H.los[-H.color] > H.height) {
                    //     fill(stackColors[-H.color])
                    // }
                    if (H.color) fill(hexColors[H.color])
                    else fill(50)
                    // fill(50)
                    
                } else {
                    if (H.los[1] == 0 && H.los[-1] == 0) {
                        fill(50)
                    } else {
                        fill(hexColors[Math.sign(H.los[1]-H.los[-1])])
                    }
                    
                }
                
                if (!influence.checked()) fill('#EAC185')
                stroke('black')
                beginShape()
                for (let corner of corners) {
                    vertex(corner.x, corner.y)
                }
                endShape(CLOSE)
            }
            
        }
    }
    push()
    for (let q = -N+1; q < N; q ++) {
        for (let r = -N+1; r < N; r ++) {
            let s = -q-r
            if (abs(s) < N) {
                let H = board[q][r]
                let center = L.hexToPixel(H)
                if (H.height) {
                    fill(stackColors[H.color])
                    stroke('black')
                    // strokeWeight(4)
                    circle(center.x, center.y, stackR)
                    fill('black')
                    noStroke()
                    text(H.height, center.x, center.y+1)
                }
            }
        }
    }
    pop()

    
    let H = L.pixelToHex(new Point(mouseX, mouseY)).round()
    if (board.contains(H.q, H.r, H.s)) {
        H = board[H.q][H.r]
        if (H.playableFor(board.turn)) {
            fill(stackColors[board.turn])
            let center = L.hexToPixel(H)
            circle(center.x, center.y, stackR)
            fill('black')
            noStroke()
            text(H.los[board.turn], center.x, center.y+1)
        }
    }
}

function mousePressed() {
    let H = L.pixelToHex(new Point(mouseX, mouseY)).round()
    if (board.contains(H.q, H.r, H.s)) {
        H = board[H.q][H.r]
        if (H.playableFor(board.turn)) {
            board.update(H.q, H.r, board.turn, H.los[board.turn])
            updateScores()
            board.turn = -board.turn
        }
    }
}

function keyPressed() {
    let i = 'ytrewq0123456+'.indexOf(key)
    if (i == -1) return
    let color, height
    if (i == 13) {
        color = 0
        height = 2
    } else {
        i -= 6
        color = Math.sign(i)
        height = abs(i)
    }
    let H = L.pixelToHex(new Point(mouseX, mouseY)).round()
    if (board.contains(H.q, H.r, H.s)) {
        H = board[H.q][H.r]
        board.update(H.q, H.r, color, height)
        updateScores()
    }
}

function windowResized() {
    let Rx = windowWidth/(2*sqrt(3)*board.size)
    let Ry = windowHeight/(3*board.size)
    R = min(Rx, Ry)
    resizeCanvas(R*2*sqrt(3)*board.size, R*3*board.size)
    stackR = R*sqrt(3)/2*0.9
    textSize(R)
    strokeWeight(1 + (R > 30))
    L = new Layout(Layout.pointy, new Point(R, R), new Point(width/2, height/2))
}