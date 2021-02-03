function setup() {
    createCanvas(1000, 900)
    textAlign(CENTER, CENTER)
    strokeWeight(2)
    textSize(20)

    R = 30
    stackR = R*sqrt(3)/2*0.9
    ellipseMode(RADIUS)

    let boardString = getURLParams().board

    if (boardString) {
        board = loadBoard(boardString)
    } else {
        board = new Board(8)
    }

    

    L = new Layout(Layout.pointy, new Point(R, R), new Point(width/2, height/2))

    createButton('6').mousePressed(() => {
        board = new Board(6)
    })
    createButton('8').mousePressed(() => {
        board = new Board(8)
    })
    createButton('10').mousePressed(() => {
        board = new Board(10)
    })
    createButton('Link').mousePressed(() => {
        history.pushState({}, '', '?board=' + board.toString())
    })
    influence = createCheckbox('Influence', false)
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
                    fill(hexColors[H.color])
                    if (H.color && H.los[-H.color] > H.height) {
                        fill(stackColors[-H.color])
                    }
                } else {
                    if (H.los[1] == 0 && H.los[-1] == 0) {
                        fill(50)
                    } else {
                        fill(hexColors[Math.sign(H.los[1]-H.los[-1])])
                    }
                    
                }
                
                if (!influence.checked()) fill('#EAC185')
                beginShape()
                for (let corner of corners) {
                    vertex(corner.x, corner.y)
                }
                endShape(CLOSE)

                if (H.height) {
                    fill(stackColors[H.color])
                    circle(center.x, center.y, stackR)
                    textSize(40)
                    fill('black')
                    text(H.height, center.x, center.y+1)
                } else {
                    // fill('black')
                    // textSize(20)
                    // fill('red')
                    // text(H.los[1], center.x, center.y-14)
                    // fill('white')
                    // text(H.los[-1], center.x, center.y+16)
                }
                
            }
            
        }
    }
    
    let H = L.pixelToHex(new Point(mouseX, mouseY)).round()
    if (board.contains(H.q, H.r, H.s)) {
        H = board[H.q][H.r]
        if (H.playableFor(board.turn)) {
            fill(stackColors[board.turn])
            let center = L.hexToPixel(H)
            circle(center.x, center.y, stackR)
            textSize(40)
            fill('black')
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
    }
}