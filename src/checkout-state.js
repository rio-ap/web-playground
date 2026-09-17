let shipping = null;
let payment = null;
let lastOrder = null;

export function setShipping(data) {
  shipping = data;
}

export function getShipping() {
  return shipping;
}

export function setPayment(data) {
  payment = data;
}

export function getPayment() {
  return payment;
}

export function setLastOrder(order) {
  lastOrder = order;
}

export function getLastOrder() {
  return lastOrder;
}

export function clearDraft() {
  shipping = null;
  payment = null;
}

export function reset() {
  shipping = null;
  payment = null;
  lastOrder = null;
}
