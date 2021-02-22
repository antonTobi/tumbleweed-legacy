class Board {
    constructor(size) {
        this.size = size
        this.turn = 1
        this.moveNumber = 0
        this.hexes = []
        this.moveHistory = []
        
        for (let q = -size+1; q < size; q ++) {
            this[q] = {}
            for (let r = -size+1; r < size; r ++) {
                if (this.contains(q, r)) {
                    this[q][r] = new Hex(q, r)
                    this.hexes.push(this[q][r])
                    for (let i = 0; i < 6; i ++) {
                        let direction = Hex.directions[i]
                        let H = new Hex(q, r).add(direction)
                        let distance = 0
                        while (this.contains(H.q, H.r)) {
                            distance ++
                            H = H.add(direction)
                        }
                        this[q][r].distances[i] = distance
                    }
                }
            }
        }

        this.stackCounts = {
            '1': 0,
            '0': 0,
            '-1': 0,
            null: this.hexes.length
        }

        if (!zeroStacks.checked()) this.update(0, 0, 0, 2, false)        
    }

    contains(q, r, s = -r-q) {
        return (abs(q) < this.size &&
                abs(r) < this.size &&
                abs(s) < this.size)
    }

    isLegal(H) {
        if (H[this.turn] <= H.height) return false
        if (H[this.turn] < H[-this.turn] && !suicides.checked()) return false
        return zeroStacks.checked() || !this.stackCounts[this.turn] || H[this.turn]
    }

    move(q, r) {
        let height = this[q][r][this.turn]
        if (!height && !zeroStacks.checked()) height = 1
        this.update(q, r, this.turn, height)
        this.turn = -this.turn
    }

    undo() {
        if (this.moveHistory.length) {
            let unMove = this.moveHistory.pop()
            if (unMove) this.update(...unMove, false)
            this.moveNumber --
            this.turn = -this.turn
        }
        
    }

    pass() {
        this.moveHistory.push(null)
        this.moveNumber ++
        this.turn = -this.turn
        
    }

    update(Q, R, color, height, record = true) {
        let U = this[Q][R]
        let prevColor = U.color
        let prevHeight = U.height

        this.stackCounts[prevColor] --
        this.stackCounts[color] ++

        if (record) {
            this.moveNumber ++
            this.moveHistory.push([
                Q,
                R,
                prevColor,
                prevHeight
            ])
        }
        

        U.color = color
        U.height = height

        for (let i = 0; i < 6; i ++) {
            let d = Hex.directions[i]
            let j = (i + 3) % 6
            let f = U.distances[i]
            let b = U.distances[j]

            let obscured = U.seen[j]
            let obscuredColor = 0

            if (obscured) {
                obscuredColor = obscured.color
            }

            for (let step = 1; step <= f; step ++) {
                let H = this[Q + step*d.q][R + step*d.r]
                H[color] ++
                H[prevColor] --
                if (color != null && prevColor == null) {
                    if (obscuredColor) H[obscuredColor] --
                    H.distances[j] = step
                    H.seen[j] = U
                }
                if (color == null && prevColor != null) {
                    if (obscuredColor) H[obscuredColor] ++
                    H.distances[j] = step + b
                    H.seen[j] = obscured
                }

                if (H.color) this.recalculateStrength(H)
            }

        }
        if (U.color) this.recalculateStrength(U)
    }

    toString() {
        let charList = []
        for (let hex of this.hexes) {
            charList.push(hex.toChar())
        }
        return charList.join('')
    }

    // randomEmpty() {
    //     let H
    //     do {
    //         H = random(this.hexes)
    //     } while (H.color != null)
    //     return H
    // }

    evaluate() {
        // let evaluation = 0
        let strength = 0
        let score = 0

        let stackCount = 0
        let territoryCount = 0
        let unseenCount = 0
        let contestedCount = 0

        for (let H of this.hexes) {
            if (H.color != null) stackCount ++
            if (H.color) {
                if (H[-H.color] > H.height && H[-H.color] >= H[H.color]) {
                    score -= H.color
                } else {
                    score += H.color
                }
                strength += H.color * H.strength
            } else {
                let ownership = H[1]-H[-1]
                if (ownership) {
                    score += Math.sign(ownership)
                    territoryCount ++
                } else {
                    if (H[1]) contestedCount ++
                    else unseenCount ++
                }
                
                // ownership += 2 * Math.sign(ownership)
                // evaluation += ownership
            }            
        }
        return (stackCount + territoryCount) * score + (unseenCount + contestedCount) * strength
    }

    negamax(depth, alpha, beta) {
        if (depth == 0) {
            return this.quiescence(4, alpha, beta)
        }
        
        let value = -Infinity
        let move = null
        let turn = this.turn
        let candidates = this.legalMoves().sort((a, b) => b.heuristic(turn) - a.heuristic(turn))
        if (candidates.length > 20) candidates.length = 20
        for (let H of candidates) {
            this.move(H.q, H.r)
            let newValue = -this.negamax(depth - 1, -beta, -alpha).value
            if (newValue > value) {
                value = newValue
                move = H
            }
            alpha = max(alpha, value)
            this.undo()
            if (alpha >= beta) break
        }
        return {value: value, move: move}
    }

    quiescence(depth, alpha, beta) {
        if (depth == 0) {
            return {value: this.turn*this.evaluate(), move: null}
        }
        
        let value = -Infinity
        let move = null
        let turn = this.turn
        let candidates = [...this.loudMoves()].sort((a, b) => b.heuristic(turn) - a.heuristic(turn))
        // if (candidates.length > 10) candidates.length = 10
        for (let H of candidates) {
            this.move(H.q, H.r)
            let newValue = -this.quiescence(depth - 1, -beta, -alpha).value
            if (newValue > value) {
                value = newValue
                move = H
            }
            alpha = max(alpha, value)
            this.undo()
            if (alpha >= beta) break
        }

        if (move == null) {
            return {value: this.turn*this.evaluate(), move: null}
        } else {
            return {value: value, move: move}
        }
    }

    legalMoves() {
        return this.hexes.filter(H => this.isLegal(H))
        // if (this.moveNumber < 2) {
        //     return this.hexes.filter(H => !H.height)
        // } else {
        //     return this.hexes.filter(H => H.playableFor(this.turn))
        // }
    }

    loudMoves() {
        let moves = new Set(this.hexes.filter(H => (H.color == -this.turn || H.color == 0) && H.playableFor(this.turn)))
        for (let H of this.hexes.filter(H => H.color == this.turn && H.playableFor(-this.turn))) {
            if (H.playableFor(this.turn)) moves.add(H)
            let margin = H[-this.turn] - H.height
            if (margin > 2) continue
            for (let i = 0; i < 6; i ++) {
                if (!H.seen[i] || H.seen[i].color != -this.turn) continue
                let d = Hex.directions[i]
                for (let step = 1; step <= H.distances[i]; step ++) {
                    let other = this[H.q + d.q * step][H.r + d.r * step]
                    if (other.playableFor(this.turn)) moves.add(other)
                }
            }

            
        }
        return moves
    }

    genmove(depth) {
        let H = this.negamax(depth, -Infinity, Infinity).move
        if (!H) {
            let legalMoves = this.legalMoves()
            if (legalMoves.length) {
                console.log("Making random move")
                H = random(this.legalMoves())
            } else {
                console.log("No legal moves, passing")
                this.pass()
                return
            }
        }
        
        this.move(H.q, H.r)
        
    }

    recalculateStrength(H) {
        H.strength = H.height + H[H.color] - 2*H[-H.color]
        H.strength += Math.sign(H.strength)
        for (let i = 0; i < 6; i ++) {
            let seen = H.seen[i]
            if (seen) {
                if (seen.color == H.color) {
                    H.strength += 3 * (seen.height + 3) / H.distances[i]
                }
                if (seen.color == -H.color) {
                    H.strength -= 3 * (seen.height + 3) / H.distances[i]
                }
            }
            H.strength += H.distances[i]

        }

        H.strength = max(H[H.color]-1, H.height) - H[-H.color]
    }
    
}

function loadBoard(s) {
    let size = ceil((3 + sqrt(12*s.length-3)) / 6)
    let board = new Board(size)
    for (let i = 0; i < s.length; i ++) {
        if (s[i] == '-') continue
        let color = 'abcdefghijklmnopqrstuvwxyz'.indexOf(s[i])
        let height = color % 8
        color -= height
        color /= 8  
        color -= 1
        let H = board.hexes[i]
        board.update(H.q, H.r, color, height, false)
    }
    board.moveNumber = 2
    return board
}