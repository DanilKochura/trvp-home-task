import Flight from './Flight.js';
import axios from "axios";
import AppModel from "../model/AppModel.js";
import Passenger from "./Passenger.js";

export default class App {
    #flightslist = [];
    #planes = []
    onEscapeKeydown = (event) => {
        if (event.key === 'Escape') {
            const input = document.querySelector('.tasklist-adder__input');
            input.style.display = 'none';
            input.value = '';

            document.querySelector('.tasklist-adder__btn')
                .style.display = 'inherit';
        }
    };

    //not working
    onInputKeydown = async (event) => {
        if (event.key !== 'Enter') return;

        if (event.target.value) {
            const newTasklist = new Flight({
                name: event.target.value,
                // onMoveTask: this.onMoveTask,
                onDropTaskInTasklist: this.onDropTaskInTasklist,
                onEditTask: this.onEditTask,
                onDeleteTask: this.onDeleteTask
            });
            // console.log(newTasklist)

            let {data} = newTasklist.sendFlight();
            console.log(data)
            if (data) {
                this.#flightslist.push(newTasklist);
                newTasklist.render();
                console.log(data)
            }

        }

        event.target.style.display = 'none';
        event.target.value = '';

        document.querySelector('.tasklist-adder__btn')
            .style.display = 'inherit';
    };

    onDeleteFlight = (event) => {
        if (event.target) {
            let flightId = event.target.closest('li').id
            let flight = this.#flightslist.find(flight => flight.flightId === flightId)
            let data = AppModel.deleteFlights({flightsID: flightId})
            data.then(result => {
                console.log(result.message)
                if (result.message.length > 0) {
                    let index = this.#flightslist.indexOf(flight)
                    if (index > -1) {

                        this.#flightslist.slice(index, 1);
                        document.getElementById(flightId).remove()
                    }
                }
            })

        }
    }

    onEditFlightPress(event) {
        console.log('test')
        let li = event.target.closest('.tasklist')
        // document.querySelector('.left-wrapper').classList.add('flip')
        li.querySelector('.d-main').style.display = 'none'
        li.querySelector('.d-form').style.display = 'block'
        // document.querySelector('.left-wrapper').classList.remove('flip')


    }

    onFlightEditSubmit = (event) => {
        event.preventDefault()
        console.log(event)


        let flightLi = event.target.closest('.tasklist')
        let flight = this.#flightslist.find(flight => flight.flightId === flightLi.id)

        let UpdatedFlight = flight


        let date = event.target.querySelector('input[name="flightDate"]').value,
            destination = event.target.querySelector('input[name="flightDest"]').value,
            planeSelect = event.target.querySelector('select[name="flightPlane"]');
        let planeName = planeSelect.options[planeSelect.selectedIndex].text,
            planeId = planeSelect.options[planeSelect.selectedIndex].value;
        if (destination !== '' && date !== '' && planeId !== '') {

            if (destination !== flight.destination || planeName !== flight.plane || date !== flight.date) {

                let result = AppModel.updateFlights({
                    flightsID: flightLi.id,
                    flight_dt: date,
                    city: destination,
                    plane_id: planeId
                })

                result.then(result => {
                    flightLi.querySelector(".dest-val").textContent = destination
                    flightLi.querySelector(".date-vale").textContent = date
                })
            }


        } else {
            alert("Заполните все поля")
        }
        // let date = event.target.querySelector('input[name="flightDate"]').value,
        //     destination = event.target.querySelector('input[name="flightDest"]').value,
        //     plane = event.target.querySelector('select[name="flightPlane"]').value;
        //
        // if(date && destination && plane)
        // {
        //   console.log(date, destination, plane)
        //   const newFlight = new Flight(date, destination, plane, this.onMoveTask, this.onEditTask, this.onDeleteTask)
        //   console.log(newFlight)
        // }

        event.target.closest('.d-form').style.display = 'none';
        flightLi.querySelector('.d-main').style.display = 'block';


    };

    onFlightAddSubmit = (event) => {
        event.preventDefault()

        let date = event.target.querySelector('input[name="flightDate"]').value,
            destination = event.target.querySelector('input[name="flightDest"]').value,
            planeSelect = event.target.querySelector('select[name="flightPlane"]');

        let planeName = planeSelect.options[planeSelect.selectedIndex].text,
            planeId = planeSelect.options[planeSelect.selectedIndex].value;
        console.log(planeId, planeName)
        if (destination !== '' && date !== '' && planeId !== '') {
            const newFlight = new Flight({
                // name: destination,
                // onMoveTask: this.onMoveTask,
                date: date,
                destination: destination,
                plane: planeName,
                onDropTaskInTasklist: this.onDropTaskInTasklist,
                onEditTask: this.onEditTask,
                onDeleteTask: this.onDeleteTask,
                onDeleteFlight: this.onDeleteFlight,
                onEditFlightPress: this.onEditFlightPress,
                onFlightEditSubmit: this.onFlightEditSubmit
            });
            // let { data } = newFlight.sendFlight();
            let data = AppModel.addFlights({
                flightsID: newFlight.flightId,
                flight_dt: newFlight.flightDate,
                city: newFlight.flightDestination,
                plane_id: planeId
            })

            data.then(result => {
                console.log(result)
                if (result.statusCode) {
                    if (result.statusCode !== 200) {
                        console.log(result)
                    }

                } else {
                    this.#flightslist.push(newFlight);
                    newFlight.render();
                }
            }).catch(result => {
                alert("Попытка создать дубль рейса!")
            })

        } else {
            alert("Заполните все поля")
        }
        // let date = event.target.querySelector('input[name="flightDate"]').value,
        //     destination = event.target.querySelector('input[name="flightDest"]').value,
        //     plane = event.target.querySelector('select[name="flightPlane"]').value;
        //
        // if(date && destination && plane)
        // {
        //   console.log(date, destination, plane)
        //   const newFlight = new Flight(date, destination, plane, this.onMoveTask, this.onEditTask, this.onDeleteTask)
        //   console.log(newFlight)
        // }

        event.target.style.display = 'none';
        event.target.value = '';

        document.querySelector('.tasklist-adder__btn')
            .style.display = 'inherit';
    };

    onDropTaskInTasklist = (evt) => {
        evt.stopPropagation();
        const destTasklistElement = evt.currentTarget;
        destTasklistElement.classList.remove('tasklist_droppable');

        const movedTaskID = localStorage.getItem('movedTaskID');
        const srcTasklistID = localStorage.getItem('srcTasklistID');
        const destTasklistID = destTasklistElement.getAttribute('id');
        console.log(destTasklistID)
        console.log(destTasklistElement)
        localStorage.setItem('movedTaskID', '');
        localStorage.setItem('srcTasklistID', '');
        // if (!destTasklistElement.querySelector(`[id="${movedTaskID}"]`)) return;

        const srcTasklist = this.#flightslist.find(tasklist => tasklist.flightId === srcTasklistID);
        const destTasklist = this.#flightslist.find(tasklist => tasklist.flightId === destTasklistID);
        if (srcTasklistID !== destTasklistID) {
            console.log("AAAA")
            let data = AppModel.moveBookings({
                bookingID: movedTaskID,
                flightID: srcTasklistID,
                newFlightID: destTasklistID,
                fullname: document.querySelector(`[id="${movedTaskID}"] span.task__text`).innerHTML
            })
            data.then(result => {
                console.log(result)
                const destTasksIDs = Array.from(
                    destTasklistElement.querySelector('.bookinglist__item').children,
                    elem => elem.getAttribute('id')
                );
                console.log(destTasksIDs)
                const movedTask = srcTasklist.deleteTask({taskID: movedTaskID});
                destTasklist.addTask({task: movedTask});
                new Passenger({
                    text: movedTask.text,
                    order: destTasksIDs.length + 1,
                    // onMoveTask: this.onMoveTask,
                    onEditTask: this.onEditTask,
                    onDeleteTask: this.onDeleteTask,
                });
                // srcTasklist.reorderTasks();
                // destTasksIDs.forEach((taskID, order) => {
                //     destTasklist.getTaskById({taskID}).taskOrder = order;
                // });
            }).catch(error => {
                console.log(error)
                alert("Не совпадает аэропорт назначения!")

            })

        }


    };

    // moveTask = ({ taskID, direction }) => {
    //   let srcTasklistIndex = -1;

    //   this.#flightslist.forEach((tasklist, i) => {
    //     let task = tasklist.getTaskById({ taskID });
    //     if (task) {
    //       srcTasklistIndex = i;
    //     }
    //   });

    //   const destTasklistIndex = direction === 'left'
    //     ? srcTasklistIndex - 1
    //     : srcTasklistIndex + 1;

    //   const movedTask = this.#flightslist[srcTasklistIndex].deleteTask({ taskID });
    //   this.#flightslist[destTasklistIndex].addTask({ task: movedTask });
    // };

    // onMoveTask = ({ taskID, direction }) => {
    //   if (!direction || (direction !== 'left' && direction !== 'right')) return;

    //   const taskElement = document.getElementById(taskID);
    //   const srcTasklistElement = taskElement.closest('.tasklist');
    //   const destTasklistElement = direction === 'left'
    //     ? srcTasklistElement.previousElementSibling
    //     : srcTasklistElement.nextElementSibling;

    //   if (!destTasklistElement) return;

    //   destTasklistElement.querySelector('ul.bookinglist__item')
    //     .appendChild(taskElement);

    //   this.moveTask({ taskID, direction });
    // };

    onEditTask = ({taskID}) => {
        let fTask = null;
        let flight = null;
        for (let flightList of this.#flightslist) {
            // console.log(flightList)
            fTask = flightList.getTaskById({taskID});
            if (fTask) {
                break
            }
        }

        const curTaskText = fTask.taskText;

        const newTaskText = prompt('Введите новое имя для брони', curTaskText);

        if (!newTaskText || newTaskText === curTaskText) return;
        fTask.taskText = newTaskText;

        let success = AppModel.updateBookings({
            bookingID: taskID,
            fullname: newTaskText,
            flightID: document.querySelector(`[id="${taskID}"]`).closest('.tasklist').id
        })
        success.then(result => {
            if (result.statusCode) {
                console.error(result)
            } else {
                document.querySelector(`[id="${taskID}"] span.task__text`).innerHTML = newTaskText;
            }
        })

    };

    onDeleteTask = ({taskID}) => {
        let fTask = null;
        let fTasklist = null;
        for (let tasklist of this.#flightslist) {
            fTasklist = tasklist;
            fTask = tasklist.getTaskById({taskID});
            if (fTask) break;
        }
        if (!fTask) {
            // console.log(tasklist, taskID)
            console.error("Не найден пассажир")
            return;
        }

        const taskShouldBeDeleted = confirm(`Бронь на имя '${fTask.taskText}' будет удалена. Прододлжить?`);

        if (!taskShouldBeDeleted) return;

        let data = AppModel.deleteBookings({bookingsID: taskID})
        data.then(result => {
            if (result.statusCode) {
                console.error(result)
            } else {
                fTasklist.deleteTask({taskID});
                // console.log(result.message)
                document.getElementById(taskID).remove();
            }
        })

    };


    init() {
        document.querySelector('.tasklist-adder__btn')
            .addEventListener(
                'click',
                (event) => {
                    event.target.style.display = 'none';

                    const form = document.querySelector('.flight_adder_form');
                    // console.log(form)
                    form.style.display = 'flex';
                }
            );

        document.addEventListener('keydown', this.onEscapeKeydown);

        // document.querySelector('.tasklist-adder__input')
        //   .addEventListener('keydown', this.onInputKeydown);
        //
        document.querySelector('.flight_adder_form')
            .addEventListener('submit', this.onFlightAddSubmit);

        // document.getElementById('theme-switch')
        //     .addEventListener('change', (evt) => {
        //         (evt.target.checked
        //             ? document.body.classList.add('dark-theme')
        //             : document.body.classList.remove('dark-theme'));
        //     });

        document.addEventListener('dragover', (evt) => {
            evt.preventDefault();
            const draggedElement = document.querySelector('.book.task_selected');
            const draggedElementPrevList = draggedElement.closest('.tasklist');

            const currentElement = evt.target;
            const prevDroppable = document.querySelector('.tasklist_droppable');
            let curDroppable = evt.target;
            while (!curDroppable.matches('.tasklist') && curDroppable !== document.body) {
                curDroppable = curDroppable.parentElement;
            }


            if (curDroppable !== prevDroppable) {
                if (prevDroppable) prevDroppable.classList.remove('tasklist_droppable');

                if (curDroppable.matches('.tasklist')) {
                    curDroppable.classList.add('tasklist_droppable');
                }


            }

            if (!curDroppable.matches('.tasklist') || draggedElement === currentElement) return;

            if (curDroppable === draggedElementPrevList) {
                if (!currentElement.matches('.book')) return;

                const nextElement = (currentElement === draggedElement.nextElementSibling)
                    ? currentElement.nextElementSibling
                    : currentElement;

                curDroppable.querySelector('.bookinglist__item')
                    .insertBefore(draggedElement, nextElement);

                return;
            }

            if (currentElement.matches('.book')) {
                curDroppable.querySelector('.bookinglist__item')
                    .insertBefore(draggedElement, currentElement);

                return;
            }

            if (!curDroppable.querySelector('.bookinglist__item').children.length) {
                curDroppable.querySelector('.bookinglist__item')
                    .appendChild(draggedElement);
            }
        });

        try {
            let planes = AppModel.getPlanes()
            planes.then(result => {
                let plane = null
                console.log(planes)
                for (plane of result) {
                    this.#planes.push(plane)
                    let opt = document.createElement('option')
                    opt.setAttribute('value', plane.id)
                    opt.innerText = plane.name
                    document.querySelector("[name='flightPlane']").appendChild(opt)
                }
                // console.log(result)
            })


            let flights = AppModel.getFlights()
            // console.log('data')
            flights.then(data => {
                let i = 0;
                data.forEach(flightRaw => {
                    // console.log(flightRaw)

                    let flight = new Flight(
                        {
                            id: flightRaw.flightID,
                            date: flightRaw.flight_dt,
                            plane: flightRaw.plane.name,
                            destination: flightRaw.city,
                            onDropTaskInTasklist: this.onDropTaskInTasklist,
                            onEditTask: this.onEditTask,
                            onDeleteTask: this.onDeleteTask,
                            onDeleteFlight: this.onDeleteFlight,
                            onEditFlightPress: this.onEditFlightPress,
                            onFlightEditSubmit: this.onFlightEditSubmit
                        }
                    )
                    this.#flightslist.push(flight)
                    // console.log(flight)
                    flight.render()
                    flight.addBooks(flightRaw.bookings)


                })

            })
        } catch (e) {
            console.log(e)
        }
    }
};
