'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');


const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;



  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
            <div class="movements__type   movements__type--${type}">${i + 1}${type}</div>
           <div class="movements__value">${mov}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  })
};


const calcDisplayBalance = function (acc) {
  const balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${balance}€`;
};

const calcDisplaySummary = function (acc) {
  acc.balance = acc.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${acc.balance}€`;

  const out = acc.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements.filter(mov => mov > 0).map(deposit => deposit * acc.interestRate / 100).filter((int, i, arr) => {
    // console.log(arr);
    return int >= 1;
  }).reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

const creatUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner.toLowerCase().split(' ').map(name => name[0]).join('');
  });
};
creatUserNames(accounts);

const updateUi = function (currentAcount) {
  displayMovements(currentAcount.movements);
  calcDisplayBalance(currentAcount);
  calcDisplaySummary(currentAcount);
};

const startLogOutTimer = function(){
  const tick = function(){
    const min = Math.trunc(String(time / 60).padStart(2, 0));
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if(time === 0){
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    };

    time--;
  };
  let time = 300;

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

let currentAcount, timer;
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();//prevents submitting

  currentAcount = accounts.find(acc => acc.username === inputLoginUsername.value);
  console.log(currentAcount);

  if (currentAcount?.pin === Number(inputLoginPin.value)) {
    //display ui
    labelWelcome.textContent = `Welcome ${currentAcount.owner.split(' ')[0]}`;

    containerApp.style.opacity = 100;

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if(timer) clearInterval(timer);
    timer = startLogOutTimer();

    updateUi(currentAcount);

  };
});


btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
  console.log(amount, receiverAcc);

  if (amount > 0 && receiverAcc && currentAcount.balance >= amount && receiverAcc?.username !== currentAcount.username) {
    console.log('transfer valid');
    inputTransferAmount.value = inputTransferTo.value = '';

    currentAcount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    updateUi(currentAcount);

  };
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAcount.movements.some(mov => mov >= amount * 0.1)) {
    currentAcount.movements.push(amount);

    updateUi(currentAcount);
  };
  inputLoanAmount.value = '';
});



btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  console.log('delete');

  if (inputCloseUsername.value === currentAcount.username && Number(inputClosePin.value) === currentAcount.pin) {
    const index = accounts.findIndex(acc => acc.username === currentAcount.username);
    console.log(index);

    accounts.splice(index, 1);

    containerApp.style.opacity = 0;

  };

  inputCloseUsername.value = inputClosePin.value = '';

});

let sorted = false;//state var
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentAcount.movements, !sorted);
  sorted = !sorted;//switches sorted var in line 191
});