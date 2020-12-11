/** Textual markov chain generator */

class MarkovMachine {
  /** build markov machine; read in text.*/

  constructor(text) {
    let words = text.split(/[ \r\n]+/);
    this.words = words.filter((c) => c !== "");
    this.makeChains();
  }

  /** set markov chains:
   *
   *  for text of "the cat in the hat", chains will be
   *  {"the": ["cat", "hat"], "cat": ["in"], "in": ["the"], "hat": [null]} */

  makeChains() {
    let chains = {};
    let last = this.words[0];
    for (let i = 1; i < this.words.length; i++) {
      if (last in chains) {
        chains[last].push(this.words[i]);
        last = this.words[i];
      } else {
        chains[last] = [this.words[i]];
        last = this.words[i];
      }
    }
    if (chains[this.words[this.words.length - 1]] in chains) {
      chains[this.words[this.words.length - 1]].push(null);
    } else {
      chains[this.words[this.words.length - 1]] = [null];
    }
    this.chains = chains;
  }

  /** return random text from chains */

  makeText(numWords = 100) {
    let keys = Object.keys(this.chains);
    let key = keys[Math.floor(Math.random() * Math.floor(keys.length))];
    let textArray = [];

    while (textArray.length < numWords && key !== null) {
      textArray.push(key);
      key = this.chains[key][
        Math.floor(Math.random() * Math.floor(this.chains[key].length))
      ];
    }
    return textArray.join(" ");
  }
}
module.exports = {
  MarkovMachine,
};
