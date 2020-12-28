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

let Hypher = require('hypher')
let lang = require('hyphenation.en-us')
let h_engine = new Hypher(lang)

function hyphenate(word) {
    let parts = h_engine.hyphenate(word)
    return parts.map( (v, idx) => {
        return {
            chunk: parts.slice(0, idx).join`` + v
                + (idx === parts.length-1 ? '' : '-'),
            leftover: parts.slice(idx+1).join``
        }
    }).reverse()
}

function fmt(width, paragraph) {
    let Space_left = width
    const space_width = 1

    let calc = (space_left, word) => {
        let parts = hyphenate(word)
        let small = parts.filter( v => (v.chunk.length + space_width) < space_left)[0]
        if (small) {            // fits in
            word = small.chunk
            space_left = space_left - (word.length + space_width)
            return { space_left, word, leftover: small.leftover }
        }
        // too big
        return { space_left: width - word.length, word: "\n"+word }
    }

    let fmt_paragraph = []
    let word, words = paragraph.split(/\s+/).reverse()
    while ( (word = words.pop())) {
        let r = calc(Space_left, word)
        Space_left = r.space_left
        fmt_paragraph.push(r.word)

        // put the 'leftover' of the hyphenated word into the
        // array-of-words to process it in the next iteration
        if (r.leftover) words.push(r.leftover)
    }

    return fmt_paragraph.join` `.replace(/\n /g, "\n").trim()
}

async function main() {
    let idx = 0
    for await (const para of paragraphs()) {
        let p = fmt(20, para)
        if (idx++ && p.length) console.log("")
        console.log(p)
    }
}

main()
