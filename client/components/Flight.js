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
        var day = ("0" + curdate.getDate()).slice(-2);
        var month = ("0" + (curdate.getMonth() + 1)).slice(-2);
        var today = curdate.getFullYear() + "-" + (month) + "-" + (day);

        liElement.innerHTML = '<div class="flight-info__wrapper">\n' +
            '<div class="left-wrapper">' +
            '              <div class="flight-info__info-data d-main">\n' +
            '                <h2 class="flight-info__info-data name-ticket">Рейс</h2>\n' +
            '                <ul class="flight-info__info-data list-data">\n' +
            '                  <li class="list-data__item">\n' +
            '<svg width="18px" height="18px" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="name bi bi-calendar-event" viewBox="0 0 16 16">  \n' +
            '  <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"></path>  \n' +
            '  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"></path>\n' +
            '</svg>' +
            '                    <span class="list-data__item value date-val">\n' +
            dateTimeFormat1.format(curdate).toString() +
            '                    </span>\n' +
            '                  </li>\n' +
            '                  <li class="list-data__item">\n' +
            '<svg width="18px" height="18px" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="name bi bi-clock" viewBox="0 0 16 16">  \n' +
            '  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"></path>  \n' +
            '  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"></path>\n' +
            '</svg>' +
            '                    <span class="list-data__item value date-val">\n' +
            dateTimeFormat2.format(curdate).toString() +
            '                    </span>\n' +
            '                  </li>\n' +
            '                  <li class="list-data__item">\n' +
            '<svg width="18px" height="18px" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="name bi bi-geo-alt" viewBox="0 0 16 16">  \n' +
            '  <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"></path>  \n' +
            '  <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>\n' +
            '</svg>' +
            '                    <span class="list-data__item value dest-val">\n' +
            this.#flightDestination +
            '                    </span>\n' +
            '                  </li>\n' +
            '                  <li class="list-data__item">\n' +
            '<svg width="18px" height="18px" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="name bi bi-gear-wide-connected" viewBox="0 0 16 16">  \n' +
            '  <path d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434l.071-.286zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5zm0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78h4.723zM5.048 3.967c-.03.021-.058.043-.087.065l.087-.065zm-.431.355A4.984 4.984 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8 4.617 4.322zm.344 7.646.087.065-.087-.065z"></path>\n' +
            '</svg>' +
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
            '                      type="datetime-local" name="flightDate" value="' + curdate.toJSON().slice(0, -5) + '"\n' +
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
            '              <select name="flightPlane" id="first-select-' + this.#flightId + '">\n' +
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
            '</svg>' +
            // '                <img src="images/edit.png" alt="">\n' +
            '              </div>\n' +
            '              <div class="flight-info__btn del-icon">\n' +
            '<svg width="18px" height="18px" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">  \n' +
            '  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>  \n' +
            '  <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>\n' +
            '</svg>      ' +
            '              </div>\n' +
            '            </div>\n' +
            '            </div>\n' +
            '          </div>';


        const adderElement = document.querySelector('.tasklist-adder');
        adderElement.parentElement.insertBefore(liElement, adderElement);
        let planes = AppModel.getPlanes()
        planes.then(result => {
            let plane = null
            for (plane of result) {
                console.log(plane)
                console.log(document.querySelector('#first-select-' + this.#flightId))
                let opt = document.createElement('option');
                opt.setAttribute('value', plane.id)
                opt.textContent = plane.name

                if (plane.name === this.#flightPlane) {
                    opt.setAttribute('selected', true)

                }

                document.querySelector('#first-select-' + this.#flightId).appendChild(opt)
            }
        })


        liElement.querySelector(".book-adder__btn").addEventListener('click', this.onAddNewPassenger)
        liElement.querySelector(".del-icon").addEventListener('click', this.onDeleteFlight);
        liElement.querySelector(".red-icon").addEventListener('click', this.onEditFlightPress)
        liElement.querySelector('.flight_edit_form')
            .addEventListener('submit', this.onFlightEditSubmit);
    }
};
