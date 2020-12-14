function findMean(arr) {
  let total = 0;
  for (num of arr) {
    total += num;
  }
  return total / arr.length;
}

function findMedian(arr) {
  arr.sort(function (a, b) {
    return a - b;
  });

  let half = Math.floor(arr.length / 2);

  if (arr.length % 2) return arr[half];
  else return (arr[half - 1] + arr[half]) / 2.0;
}
