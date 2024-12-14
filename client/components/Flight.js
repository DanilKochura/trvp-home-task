import Passenger from './Passenger';
import axios from "axios";
import AppModel from "../model/AppModel.js";

export default class Flight {
    #passengers = [];
    #flightDate = '';
    #flightDestination = '';
    #flightPlane = '';
    #flightId = '';

    constructor({
                    id = null,
                    date,
                    destination,
                    plane,
                    // onMoveTask,
                    onDropTaskInTasklist,
                    onEditTask,
                    onDeleteTask,
                    onDeleteFlight,
                    onFlightEditSubmit = {}, onEditFlightPress = {},


                }) {
        this.#flightDate = date;
        this.#flightDestination = destination;
        this.#flightPlane = plane;
        this.#flightId = id || crypto.randomUUID();
        // this.onMoveTask = onMoveTask;
        this.onDropTaskInTasklist = onDropTaskInTasklist;
        this.onEditTask = onEditTask;
        this.onDeleteTask = onDeleteTask;
        this.onDeleteFlight = onDeleteFlight;
        this.onEditFlightPress = onEditFlightPress;
        this.onFlightEditSubmit = onFlightEditSubmit

    }


    stringify() {
        return {
            flightsID: this.#flightId,
            flight_dt: this.#flightDate,
            city: this.#flightDestination,
            plane_id: this.#flightPlane,
        }
    }

    addBooks(books) {
        let i = 0;
        books.forEach(book => {
            i++;
            let b = new Passenger({
                text: book.fullname,
                id: book.id,
                order: i,
                onEditTask: this.onEditTask,
                onDeleteTask: this.onDeleteTask
            });
            this.#passengers.push(b)
            let render = b.render()
            document.querySelector(`[id="${this.#flightId}"] .bookinglist__item`)
                .appendChild(render);
        })
    }

    get flightId() {
        return this.#flightId;
    }

    get flightDestination() {
        return this.#flightDestination;
    }

    get flightDate() {
        return this.#flightDate;
    }

    addTask = ({task}) => this.#passengers.push(task);

    getTaskById = ({taskID}) => this.#passengers.find(task => task.taskID === taskID);

    deleteTask = ({taskID}) => {

        const deleteTaskIndex = this.#passengers.findIndex(task => task.taskID === taskID);

        if (deleteTaskIndex === -1) return;

        const [deletedTask] = this.#passengers.splice(deleteTaskIndex, 1);

        return deletedTask;
    };

    reorderTasks = () => {
        console.log(document.querySelector(`[id="${this.#flightId}"] .bookinglist__item`));
        const orderedTasksIDs = Array.from(
            document.querySelector(`[id="${this.#flightId}"] .bookinglist__item`).children,
            elem => elem.getAttribute('id')
        );

        orderedTasksIDs.forEach((taskID, order) => {
            this.#passengers.find(task => task.taskID === taskID).taskOrder = order;
        });

        console.log(this.#passengers);
    };

    onAddNewPassenger = () => {
        const newTaskText = prompt('Введите имя пассажра:', 'Иванов Иван');

        if (!newTaskText) return;

        const newTask = new Passenger({
            text: newTaskText,
            order: this.#passengers.length,
            // onMoveTask: this.onMoveTask,
            onEditTask: this.onEditTask,
            onDeleteTask: this.onDeleteTask,
        });


        let success = AppModel.addBookings({
            bookingID: newTask.taskID,
            fullname: newTaskText,
            flightID: this.#flightId
        })
        success.then(result => {
            if (result.statusCode) {
                console.log(result)
            } else {
                this.#passengers.push(newTask);
                const newTaskElement = newTask.render();
                document.querySelector(`[id="${this.#flightId}"] .bookinglist__item`)
                    .appendChild(newTaskElement);
            }
        }).catch(error => {
            alert('Пассажир с таким именем уде зарегистрирован')
        })
    };

    render() {
        const liElement = document.createElement('li');
        liElement.classList.add(
            'tasklists-list__item',
            'tasklist'
        );
        liElement.setAttribute('id', this.#flightId);
        liElement.addEventListener(
            'dragstart',
            () => localStorage.setItem('srcTasklistID', this.#flightId)
        );

        liElement.addEventListener('drop', this.onDropTaskInTasklist);
        let curdate = new Date(this.#flightDate)
        const options1 = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        };
        const options2 = {
            hour: 'numeric',
            minute: 'numeric'
        };
        const dateTimeFormat1 = new Intl.DateTimeFormat('ru', options1);
        const dateTimeFormat2 = new Intl.DateTimeFormat('ru', options2);
        liElement.innerHTML = '<div class="flight-info__wrapper">\n' +
            '<div class="left-wrapper">' +
            '              <div class="flight-info__info-data d-main">\n' +
            '                <h2 class="flight-info__info-data name-ticket">Рейс</h2>\n' +
            '                <ul class="flight-info__info-data list-data">\n' +
            '                  <li class="list-data__item">\n' +
            '                    <span class="list-data__item name">\n' +
            '                      Дата вылета\n' +
            '                    </span>\n' +
            '                    <span class="list-data__item value date-val">\n' +
            dateTimeFormat1.format(curdate).toString() +
            '                    </span>\n' +
            '                  </li>\n' +
            '                  <li class="list-data__item">\n' +
            '                    <span class="list-data__item name">\n' +
            '                      Время вылета\n' +
            '                    </span>\n' +
            '                    <span class="list-data__item value date-val">\n' +
            dateTimeFormat2.format(curdate).toString() +
            '                    </span>\n' +
            '                  </li>\n' +
            '                  <li class="list-data__item">\n' +
            '                    <span class="list-data__item name">\n' +
            '                      Место назначения\n' +
            '                    </span>\n' +
            '                    <span class="list-data__item value dest-val">\n' +
            this.#flightDestination +
            '                    </span>\n' +
            '                  </li>\n' +
            '                  <li class="list-data__item">\n' +
            '                    <span class="list-data__item name">\n' +
            '                      Самолет\n' +
            '                    </span>\n' +
            '                    <span class="list-data__item value">\n' +
            this.#flightPlane +
            '                    </span>\n' +
            '                  </li>\n' +
            '                </ul>\n' +
            '              </div>\n' +
            '              <div class="flight-info__info-data d-form">\n' +
            '<form action="" class="flight_edit_form">\n' +
            '          <div class="info-adder__wrapper">\n' +
            '\n' +
            '            <div class="info-adder__input date-time">\n' +
            '              <span class="name-item">\n' +
            '                Дата вылета\n' +
            '              </span>\n' +
            '              <input\n' +
            '                      type="datetime-local" name="flightDate" value="' + dateTimeFormat1.format(curdate) + '"\n' +
            '              >\n' +
            '\n' +
            '            </div>\n' +
            '\n' +
            '            <div class="info-adder__input city">\n' +
            '              <span class="name-item">\n' +
            '                Пункт назначения\n' +
            '              </span>\n' +
            '              <input\n' +
            '                      type="text" name="flightDest" value="' + this.#flightDestination + '"\n' +
            '              >\n' +
            '            </div>\n' +
            '<div class="info-adder__input plane">\n' +
            '              <span class="name-item">\n' +
            '                Самолет\n' +
            '              </span>\n' +
            '              <select name="flightPlane" id="first-select">\n' +
            '                <option >Значение 1</option>\n' +
            '                <option >Значение 3</option>\n' +
            '              </select>\n' +
            '            </div>' +
            '          </div>\n' +
            '          <button type="submit" class="edit-btn">Подтвердить</button>\n' +
            '        </form>' +
            '              </div>\n' +
            '</div>' +
            '              <div class="right-wrapper">\n' +
            '              <div class="bookinglist">\n' +
            '                <h2 class="flight-info__info-data name-ticket">Бронирования</h2>\n' +
            '                <ul class="bookinglist__item tasklist__tasks-list">\n' +
            '                  <li class="bookinglist__item-booking book-adder book-adder__btn">\n' +
            '                      <div class="plus-div">✚</div> <div>Забронировать</div>\n' +
            '                  </li>\n' +
            '\n' +
            '                </ul>\n' +
            '              </div>\n' +
            '            <div class="flight-info__btn">\n' +
            '              <div class="flight-info__btn red-icon">\n' +
            '<svg width="18px" height="18px" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">  \n' +
            '  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"></path>\n' +
            '</svg>'+
            // '                <img src="images/edit.png" alt="">\n' +
            '              </div>\n' +
            '              <div class="flight-info__btn del-icon">\n' +
            '                <img src="images/del.png" alt="">\n' +
            '              </div>\n' +
            '            </div>\n' +
            '            </div>\n' +
            '          </div>';


        const adderElement = document.querySelector('.tasklist-adder');
        adderElement.parentElement.insertBefore(liElement, adderElement);


        liElement.querySelector(".book-adder__btn").addEventListener('click', this.onAddNewPassenger)
        liElement.querySelector(".del-icon").addEventListener('click', this.onDeleteFlight);
        liElement.querySelector(".red-icon").addEventListener('click', this.onEditFlightPress)
        liElement.querySelector('.flight_edit_form')
            .addEventListener('submit', this.onFlightEditSubmit);
    }
};
