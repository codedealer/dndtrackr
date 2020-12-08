export default function strToBool (str) {
  if (str === true || str === false) return str;
  let flag = str.trim().toLowerCase();
  return flag !== 'no';
};