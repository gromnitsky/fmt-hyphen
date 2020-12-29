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
                + (idx === parts.length-1 ? '' : '\u2010'), // a Unicode hyphen
            leftover: parts.slice(idx+1).join``
        }
    }).reverse()
}

function fmt(width, paragraph) {
    width += 2
    let calc = (space_left, word, /* internal check */ _prev_word) => {
        const space_width = 1
        let parts = hyphenate(word)
        let small = parts.filter( v => (v.chunk.length + space_width) < space_left)[0]
        if (small) {            // fits in
            word = small.chunk
            space_left = space_left - (word.length + space_width)
            return { space_left, word, leftover: small.leftover }
        }

        // too big!

        // check if we are furiously trying to hyphenate an
        // unbreakable word
        if (_prev_word === word && word.length > width)
            return { space_left: width - word.length, word }

        return { space_left: width, word: "\n", leftover: word }
    }

    let fmt_paragraph = []
    let word, prev_word, words = paragraph.split(/\s+/).reverse()
    let Space_left = width
    while ( (word = words.pop())) {
        let r = calc(Space_left, word,  prev_word)
        Space_left = r.space_left
        fmt_paragraph.push(r.word)

        // put the 'leftover' of the hyphenated word into the
        // array-of-words to process it in the next iteration
        if (r.leftover) words.push(r.leftover)

        prev_word = word
    }

    return fmt_paragraph.join` `.replace(/\n /g, "\n")
}

async function main() {
    let idx = 0
    for await (const para of paragraphs()) {
        let p = fmt(35, para)
        if (idx++ && p.length) console.log("")
        console.log(p)
    }
}

main()
