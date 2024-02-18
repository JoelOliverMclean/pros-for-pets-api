const isInteger = (n) => {
  return n >>> 0 === parseFloat(n);
};

const retrieveCost = (num) => {
  return (num / 100).toFixed(2);
};

const storeCost = (num) => {
  return num * 100;
};

module.exports = { isInteger, storeCost, retrieveCost };
