class StateCoffeeMachine {
    WAITING = 'WAITING';
    PAYING = 'PAYING';
    ERROR = 'ERROR';
    PREPARING = 'PREPARING';
    FINISHED = 'FINISHED';
    CHANGE = 'CHANGE';

    SIG_BUTTON= 'SIG_BUTTON';
    SIG_TIMER= 'SIG_TIMER';
    SIG_CANCEL = 'SIG_CANCEL';

    sum = 0;

    constructor(itemDiv){
        this.itemDiv = itemDiv;
        this.price = parseInt(itemDiv.value);
        this.name = itemDiv.name;
    }



    sm = [
        {from: this.WAITING,      by: this.SIG_BUTTON,    to: this.PAYING},
        {from: this.PAYING,       by: this.SIG_BUTTON,    to: this.PREPARING},
        {from: this.PAYING,       by: this.SIG_CANCEL,    to: this.ERROR},
        {from: this.ERROR,        by: this.SIG_TIMER,     to: this.WAITING},
        {from: this.ERROR,        by: this.SIG_BUTTON,     to: this.WAITING},
        {from: this.PREPARING,    by: this.SIG_TIMER,     to: this.FINISHED},
        {from: this.FINISHED,     by: this.SIG_BUTTON,    to: this.CHANGE},
        {from: this.CHANGE,       by: this.SIG_BUTTON,    to: this.WAITING},
        {from: this.CHANGE,       by: this.SIG_TIMER,    to: this.WAITING},
    ];

    #currentState = this.WAITING;
    #currentTimers = [];

    clearTimers() {
        this.#currentTimers.forEach( t => clearTimeout(t));
        this.#currentTimers = [];
    }

    process(sig){
        console.log(`SM processing signal ${sig}`);
        let nextState = this.sm.filter( x => (x.from === this.#currentState && x.by === sig));
        if(nextState.length){
            console.log(`SM switched from ${this.#currentState} by ${sig} to ${nextState[0].to}`)
            this.#currentState = nextState[0].to;
            this.clearTimers();
            this.processState(this.#currentState)
        }
    }

    AllLightsOff(){
        osnova.style.display = 'none';
    }

    processState() {
        let alert = document.getElementsByClassName('alert')[0];
        let qrPayButton = document.querySelector('.pay-button');
        let coins = document.querySelectorAll('.coin');
        let totalCoin = document.querySelector('.total');
        let totalQR = document.querySelector('.payment-amount');
        let cup = document.querySelector('.cup');
        let changeBtn = document.querySelector('.return-button');
        let coinTray = document.querySelector('.coin-tray');
        let coins_change = document.querySelector('.coins_change');
        let progress = 0;
        let intID;
        

        switch(this.#currentState){
            case this.WAITING:
                this.AllLightsOff();
                osnova.style.display = 'flex';
                alert.textContent = 'Кофе машина готова к использованию: ';
                setTimeout(() => osnova.style.display = 'none', 3000);
                pickButtons.forEach( button => {button.classList.add('anime')})
            break;
            case this.PAYING :
                this.AllLightsOff();
                osnova.style.display = 'flex';
                pickButtons.forEach( button => {button.classList.remove('anime')})
                alert.textContent = 'Оплатите заказ =>';
                totalCoin.classList.add('blink-yellow-red');
                totalQR.classList.add('blink-yellow-red');
                alert.textContent = `Ваш ${this.name} стоит ${this.price} тенге, оплатите. Внесенная сумма: ${this.sum} тенге`;
    
                qrPayButton.addEventListener('click', () => {
                    if (this.#currentState === this.PAYING) {
                        this.sum += this.price;
                        
                        if(this.sum >= this.price){
                            alert.textContent = `Ваш ${this.name} стоит ${this.price} тенге, оплатите. Внесенная сумма: ${this.sum} тенге`;
                            totalQR.classList.add('blink-green');
                            totalQR.textContent = `${this.price} тенге`;
                            this.process(this.SIG_BUTTON);
                        }
                    }
                });
                    
                coins.forEach(coin => {
                    coin.addEventListener('click', () => {
                      if (this.#currentState === this.PAYING) {
                        const valueOfCoin = parseInt(coin.getAttribute('value'));
                        this.sum += valueOfCoin;

                        totalCoin.textContent = `${this.sum} тенге`;
                          alert.textContent = `Ваш ${this.name} стоит ${this.price} тенге, оплатите. Внесенная сумма: ${this.sum} тенге`;
                          if (this.sum >= this.price) {
                          totalCoin.classList.add('blink-green');
                          totalCoin.classList.remove('blink-yellow-red');
                          this.process(this.SIG_BUTTON);
                        } 
                      }
                    });
                    
                  });
                
            this.#currentTimers.push(setTimeout(() => this.process(this.SIG_CANCEL), 8000));
            break;
            case this.ERROR:
                this.AllLightsOff();
                osnova.style.display = 'flex';
                if(parseInt(totalCoin.textContent) > 0){
                    alert.textContent = `Ваш ${this.name} стоит ${this.price} тенге, оплатите. Внесенную сумму: ${this.sum} тенге можете забрать в приемнике для сдачи. Недостаточно денег для оплаты. Пожалуйста, внесите достаточную сумму.`;
                    totalCoin.textContent = `${0} тенге`;
                    totalCoin.classList.remove('blink-yellow-red');
                    totalQR.classList.remove('blink-yellow-red');

                    coinTray.textContent = `${this.sum} тенге`;
                    coinTray.classList.add('blink-green');

                    changeBtn.addEventListener('click', () => {
                        coinTray.textContent = `${0} тенге`;
                        this.process(this.SIG_BUTTON);
                        coinTray.classList.remove('blink-green');
                    })

                } else {
                    
                        alert.textContent = `Ваш ${this.name} стоит ${this.price} тенге. Недостаточно денег для оплаты. Пожалуйста, внесите достаточную сумму.`;
                        this.#currentTimers.push(setTimeout(() => this.process(this.SIG_TIMER), 10000));
                }

                document.querySelectorAll('.item').forEach(box => {
                    box.classList.remove('animate');  
                });
                
            break;
            case this.PREPARING:
                this.AllLightsOff();
                osnova.style.display = 'flex';
                
                if (this.#currentState === this.PREPARING) {
                    intID = setInterval(() => {
                        progress++;
                        alert.innerHTML = `Ожидайте приготовления ${this.name}!  <br /> ${progress} %`; 
                    }, 150);

                }
                
                totalCoin.classList.remove('blink-yellow-red');
                totalCoin.classList.remove('blink-green');
                totalQR.classList.remove('blink-yellow-red');
                totalQR.classList.remove('blink-green');

                cup.style.display = 'block';
                cup.classList.add('cup_inter');

                this.#currentTimers.push(setTimeout( () =>{
                    clearInterval(intID);
                    this.process(this.SIG_TIMER)
                } , 15000) );
            break;
            case this.FINISHED:
                this.AllLightsOff();
                
                osnova.style.display = 'flex';
                alert.innerHTML = `Готово, забирайте:  <br />`; 

                cup.classList.remove('cup_inter');
                cup.classList.add('coffee_ready');
    
                cup.addEventListener('click', () => {
                    this.process(this.SIG_BUTTON);
                    cup.style.display = 'none';
                    cup.classList.remove('coffee_ready');
                });
            break;
            case this.CHANGE:
                this.AllLightsOff();
                osnova.style.display = 'flex';
                totalCoin.textContent = `${0} тенге`;
                totalQR.textContent = `${0} тенге`;
                if((this.sum - this.price) > 0){
                    alert.textContent = `Ваша сдача ${this.sum - this.price} тенге. Заберите в приемнике для сдачи. Хорошего дня!`;
                    coinTray.textContent = `${this.sum - this.price} тенге`;
                    coinTray.classList.add('blink-green');
                    coins_change.style.display = 'block';

                    changeBtn.addEventListener('click', () => {
                        coinTray.textContent = `${0} тенге`;
                        coinTray.classList.remove('blink-green');
                        coins_change.style.display = 'none';

                        this.process(this.SIG_BUTTON);
                    })

                } else {
                    alert.textContent = `Хорошего дня!`;
                    this.#currentTimers.push(setTimeout(() => this.process(this.SIG_TIMER), 3000));
                }

                document.querySelectorAll('.item').forEach(box => {
                    box.classList.remove('animate');
                });

            break;
        }
    }


}



class CoffeeItem {
    constructor(name, price) {
        this.name = name;
        this.price = price;
      
        //Создала div общий с классом item. В конструкторе обозначен this.element
        this.element = document.createElement('div');
        this.element.className = 'item';
        this.element.classList.add(name);
        this.element.name = name;
        this.element.value = price;
        //this.element.setAttribute('value', `${this.price}`);

        //Картинку, вставила в this.element (див item)
        this.imageElement = document.createElement('img');
        this.element.append(this.imageElement);

        //div для информации с классом info. В конструкторе обозначен this.infoElement. 
        //Вставила в this.element (див item)
        this.infoElement = document.createElement('div');
        this.infoElement.className = 'info';
        this.element.append(this.infoElement);
      
        //h2 для названия товара. В конструкторе обозначен this.nameElement. 
        //Вставила в this.infoElement (див info)
        this.nameElement = document.createElement('h2');
        this.nameElement.textContent = name;
        this.nameElement.className = name;
        this.infoElement.append(this.nameElement);
      
        //p для цены товара с классом price. В конструкторе обозначен this.priceElement. 
        //Вставила в this.infoElement (див info)
        this.priceElement = document.createElement('p');
        this.priceElement.className = 'price';
        this.priceElement.textContent = price;
        this.infoElement.append(this.priceElement);
      
        //button для кнопки купить с классами btn и red. В конструкторе обозначен this.buyButton. 
        //Вставила в this.infoElement (див info)
        this.buyButton = document.createElement('button');
        this.buyButton.className = 'btn';
        this.buyButton.classList.add('red');
        this.buyButton.classList.add('anime');
        this.buyButton.textContent = 'Выбрать';
        this.infoElement.append(this.buyButton);

    }
    
    setImage(url) {
        this.url = url;
        this.imageElement.src = url;
    }

  }


  let espresso = new CoffeeItem('Espresso', '600тг');
  let americano = new CoffeeItem('Americano', '600тг');
  let cappuccino = new CoffeeItem('Cappuccino', '550тг');
  let latte = new CoffeeItem('Latte', '550тг');
  let mocha = new CoffeeItem('Mocha', '450тг');
  let macchiato = new CoffeeItem('Macchiato', '450тг');

  espresso.setImage('espresso.png');
  americano.setImage('americano.png');
  cappuccino.setImage('cappuccino.png');
  latte.setImage('latte.png');
  mocha.setImage('mocha.png');
  macchiato.setImage('macchiato.png');

let divBase = document.querySelector('.display');
divBase.appendChild(espresso.element);
divBase.appendChild(americano.element);
divBase.appendChild(cappuccino.element);
divBase.appendChild(latte.element);
divBase.appendChild(mocha.element);
divBase.appendChild(macchiato.element);

let divItems = document.querySelectorAll('.item');
console.log(divItems);

let pickButtons = document.querySelectorAll('.red');

pickButtons.forEach(button => {
    button.addEventListener('click', () => {

        // Получаем родительский-родительский див кнопки
        // closest('.item') метод ищет близжайщего предка соответсвующего css-селектору
        const parent = button.closest('.item');
        let coffeeMachine = new StateCoffeeMachine(parent);
        coffeeMachine.process(coffeeMachine.SIG_BUTTON);

        // Добавляем класс "animate" только для родительского дива текущей кнопки
        parent.classList.add('animate');
        parent.classList.add('active');

    })
})

let display = document.querySelector('.display');
window.onload = modalWindow('Кофе машина готова к использованию');
let osnova = document.querySelector('.osnova');
setTimeout(() => osnova.style.display = 'none', 2000);

function modalWindow(message){
    let baseDiv = document.createElement('div');
    baseDiv.className = 'osnova';
    let alert = document.createElement('div');
    alert.className = 'alert';
    alert.innerHTML = message;

	baseDiv.appendChild(alert);
	display.appendChild(baseDiv);
}
