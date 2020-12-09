let baseURL = "http://numbersapi.com";
const ul1 = document.querySelector("#list1");
const ul2 = document.querySelector("#list2");

axios
  .get(`${baseURL}/1,2,3,4`)
  .then((res) => {
    for (num in res.data) {
      console.log(num);
      let newLi = document.createElement("li");
      newLi.setAttribute("id", num);
      newLi.innerText = res.data[num];
      ul1.append(newLi);
    }
  })
  .catch((err) => {
    console.log(`You encountered an error: (${err})`);
  });

axios
  .get(`${baseURL}/3`)
  .then((r1) => {
    console.log(r1.data);
    let newLi = document.createElement("li");
    newLi.innerText = r1.data;
    ul2.append(newLi);
    return axios.get(`${baseURL}/3`);
  })
  .then((r2) => {
    console.log(r2.data);
    let newLi = document.createElement("li");
    newLi.innerText = r2.data;
    ul2.append(newLi);
    return axios.get(`${baseURL}/3`);
  })
  .then((r3) => {
    console.log(r3.data);
    let newLi = document.createElement("li");
    newLi.innerText = r3.data;
    ul2.append(newLi);
    return axios.get(`${baseURL}/3`);
  })
  .then((r4) => {
    console.log(r4.data);
    let newLi = document.createElement("li");
    newLi.innerText = r4.data;
    ul2.append(newLi);
  })
  .catch((err) => {
    console.log(`You encountered an error: (${err})`);
  });
