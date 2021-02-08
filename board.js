class Board {
    constructor(size) {
        this.size = size
        this.turn = 1
        this.moveNumber = 0
        this.hexes = []
        for (let q = -size+1; q < size; q ++) {
            this[q] = {}
            for (let r = -size+1; r < size; r ++) {
                let s = -q-r
                if (abs(s) < size) {
                    this[q][r] = new Hex(q, r, s)
                    this.hexes.push(this[q][r])
                }
            }
        }

        this.update(0, 0, 0, 2)

        // let H = this.randomEmpty()
        // this.update(H.q, H.r, 1, 1)

        // H = this.randomEmpty()
        // this.update(H.q, H.r, -1, 1)
    }

    contains(q, r, s = -r-q) {
        return (abs(q) < this.size &&
                abs(r) < this.size &&
                abs(s) < this.size)
    }

    update(Q, R, color, height) {
        let prevColor = this[Q][R].color
        let prevHeight = this[Q][R].height
        this[Q][R].color = color
        this[Q][R].height = height

        this.moveNumber ++

        for (let d of Hex.directions) {
            let [q, r] = [Q - d.q, R - d.r]
            let obscuredColor = 0
            while (this.contains(q, r) && !this[q][r].height) {
                q -= d.q
                r -= d.r
            }

            if (this.contains(q, r)) {
                obscuredColor = this[q][r].color
            }

            [q, r] = [Q, R]
            do {
                q += d.q
                r += d.r
                if (!this.contains(q, r)) break
                let H = this[q][r]
                H.los[color] ++
                H.los[prevColor] --
                if (height && !prevHeight) {
                    H.los[obscuredColor] --
                }
                if (!height && prevHeight) {
                    H.los[obscuredColor] ++
                }
                
            } while (!this[q][r].height)

        }
    }

    toString() {
        return this.hexes.map(H => H.toChar()).join('')
    }

    randomEmpty() {
        let H
        do {
            H = random(this.hexes)
        } while (H.height)
        return H
    }
    
}

function loadBoard(s) {
    let size = (3 + sqrt(12*s.length-3)) / 6
    console.log(size)
    let board = new Board(size)
    for (let i = 0; i < s.length; i ++) {
        let height = 'a.bcdefghijklmnopqrstuvwxyz'.indexOf(s[i])
        let color = height % 3
        height -= color
        height /= 3
        color -= 1
        let H = board.hexes[i]
        board.update(H.q, H.r, color, height)
    }
    return board
}