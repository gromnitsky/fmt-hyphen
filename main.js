let readline = require('readline')

function lines() {              // return an async generator
    return readline.createInterface({
        input: process.stdin,
        crlfDelay: Infinity
    })
}

async function* paragraphs() {
    let p = []
    for await (let line of lines()) {
        if (/^\s*$/.test(line)) {
            yield p.join` `
            p = []
            continue
        }
        p.push(line)
    }
    yield p.join` `
}

// SpaceLeft := LineWidth
// for each Word in Text
//     if (Width(Word) + SpaceWidth) > SpaceLeft
//         insert line break before Word in Text
//         SpaceLeft := LineWidth - Width(Word)
//     else
//         SpaceLeft := SpaceLeft - (Width(Word) + SpaceWidth)
function fmt(width, para) {
    let space_left = width
    let space_width = 1
    let p = []
    for (let word of para.split(/\s+/)) {
        if ((word.length + space_width) > space_left) {
            if (p.length) p.push("\n")
            space_left = width - word.length
        } else {
            space_left = space_left - (word.length + space_width)
        }
        p.push(word)
    }

    return p.join` `.replace(/\n /g, "\n")
}

async function main() {
    let idx = 0
    for await (const para of paragraphs()) {
        let p = fmt(40, para)
        if (idx++ && p.length) console.log("")
        console.log(p)
    }
}

main()
