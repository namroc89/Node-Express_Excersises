// axios
//   .get("https://deckofcardsapi.com/api/deck/new/draw/?count=1")
//   .then((res1) => {
//     let deck = res1.data.deck_id;
//     console.log(`${res1.data.cards[0].value} of ${res1.data.cards[0].suit}`);
//     return axios.get(
//       `https://deckofcardsapi.com/api/deck/${deck}/draw/?count=1`
//     );
//   })
//   .then((res2) => {
//     console.log(`${res2.data.cards[0].value} of ${res2.data.cards[0].suit}`);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

let deckID;

const button = document.querySelector("button");
button.addEventListener("click", getCard);

axios
  .get("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
  .then((res) => {
    deckID = res.data.deck_id;
  })
  .catch((err) => {
    console.log(err);
  });

function getCard() {
  axios
    .get(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`)
    .then((res) => {
      let list = document.querySelector("#cards");
      let newLi = document.createElement("li");
      newLi.innerText = `The ${res.data.cards[0].value} of ${res.data.cards[0].suit}`;

      list.append(newLi);
    })
    .catch((err) => {
      console.log(err);
    });
}
