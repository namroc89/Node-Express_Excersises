let deckID;
const button = document.querySelector("button");
button.addEventListener("click", drawDeck);
newDeck();

async function singleCard() {
  let res = await axios.get(
    "https://deckofcardsapi.com/api/deck/new/draw/?count=1"
  );
  console.log(`${res.data.cards[0].value} of ${res.data.cards[0].suit}`);
}

async function twoCards() {
  try {
    let res1 = await axios.get(
      "https://deckofcardsapi.com/api/deck/new/draw/?count=1"
    );
    let deck = res1.data.deck_id;
    let res2 = await axios.get(
      `https://deckofcardsapi.com/api/deck/${deck}/draw/?count=1`
    );
    console.log(`${res1.data.cards[0].value} of ${res1.data.cards[0].suit}`);
    console.log(`${res2.data.cards[0].value} of ${res2.data.cards[0].suit}`);
  } catch (e) {
    console.log(`Error:${e}`);
  }
}

async function newDeck() {
  let res = await axios.get(
    "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
  );
  deckID = res.data.deck_id;
}

async function drawDeck() {
  try {
    let res = await axios.get(
      `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`
    );
    let list = document.querySelector("#cards");
    let newLi = document.createElement("li");
    newLi.innerText = `The ${res.data.cards[0].value} of ${res.data.cards[0].suit}`;

    list.append(newLi);
  } catch (e) {
    console.log(`Error:${e}`);
  }
}
