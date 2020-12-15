function findMean(arr) {
  let total = 0;
  if (arr.length === 0) {
    return total;
  } else {
    for (num of arr) {
      total += num;
    }

    return total / arr.length;
  }
}

function findMedian(arr) {
  arr.sort(function (a, b) {
    return a - b;
  });

  let half = Math.floor(arr.length / 2);

  if (arr.length % 2) return arr[half];
  else return (arr[half - 1] + arr[half]) / 2.0;
}

function createFrequencyCounter(arr) {
  return arr.reduce(function (acc, next) {
    acc[next] = (acc[next] || 0) + 1;
    return acc;
  }, {});
}

function findMode(arr) {
  let freqCounter = createFrequencyCounter(arr);

  let count = 0;
  let mostFrequent;

  for (let key in freqCounter) {
    if (freqCounter[key] > count) {
      mostFrequent = key;
      count = freqCounter[key];
    }
  }
  if (count <= 1) {
    return "No Mode";
  }

  return Number(mostFrequent);
}

module.exports = {
  createFrequencyCounter,
  findMean,
  findMedian,
  findMode,
};
