import axios from "axios";

export default class Passenger {
    #taskID = '';
    #taskText = '';
    #taskOrder = -1;
    constructor({
        id = null,
                    text,
                    order,
                    // onMoveTask,
                    onEditTask,
                    onDeleteTask
                }) {
        this.#taskID = id || crypto.randomUUID();
        this.#taskText = text;
        this.#taskOrder = order;
        // this.onMoveTask = onMoveTask;
        this.onEditTask = onEditTask;
        this.onDeleteTask = onDeleteTask;
    }

    get taskID() {
        return this.#taskID;
    }

    changeFlight(old_id, new_id)
    {
        return axios.post('/changeFlight/'+this.taskID, {
            old: old_id,
            new: new_id
        })
    }

    get taskText() {
        return this.#taskText;
    }

    set taskText(value) {
        if (typeof value === 'string') {
            this.#taskText = value;
        }
    }

    get taskOrder() {
        return this.#taskOrder;
    }

    set taskOrder(value) {
        if (typeof value === 'number' && value >= 0) {
            this.#taskOrder = value;
        }
    }

    stringify()
    {
        return {
            ID: this.#taskID,
            name: this.#taskText,
            order: this.#taskOrder
        }
    }

    async deletePassenger()
    {
        return await axios.delete('/passenger/'+this.taskID, this.stringify())
    }

    async editPassenger()
    {
        return await axios.put('/passenger/'+this.taskID, this.stringify())
    }

    async createPassenger()
    {
        return await axios.post('/passenger/'+this.taskID, this.stringify())
    }
    render() {
        const liElement = document.createElement('li');
        liElement.classList.add('bookinglist__item-booking', 'book', 'task');
        liElement.setAttribute('id', this.#taskID);
        liElement.setAttribute('draggable', true);
        liElement.addEventListener('dragstart', (evt) => {
            evt.target.classList.add('task_selected');
            localStorage.setItem('movedTaskID', this.#taskID);
        });
        liElement.addEventListener('dragend', (evt) => {
            evt.target.classList.remove('task_selected')
        });

        const span = document.createElement('span');
        span.classList.add('task__text');
        span.innerHTML = this.#taskText;
        liElement.appendChild(span);

        const controlsDiv = document.createElement('div');
        controlsDiv.classList.add('task__controls');

        const upperRowDiv = document.createElement('div');
        upperRowDiv.classList.add('task__controls-row');
        //
        // const leftArrowBtn = document.createElement('button');
        // leftArrowBtn.setAttribute('type', 'button');
        // leftArrowBtn.classList.add('task__contol-btn', 'left-arrow-icon');
        // leftArrowBtn.addEventListener('click', () => this.onMoveTask({ taskID: this.#taskID, direction: 'left' }));
        // upperRowDiv.appendChild(leftArrowBtn);
        // //
        // const rightArrowBtn = document.createElement('button');
        // rightArrowBtn.setAttribute('type', 'button');
        // rightArrowBtn.classList.add('task__contol-btn', 'right-arrow-icon');
        // rightArrowBtn.addEventListener('click', () => this.onMoveTask({ taskID: this.#taskID, direction: 'right' }));
        // upperRowDiv.appendChild(rightArrowBtn);




        //
        controlsDiv.appendChild(upperRowDiv);
        //
        const lowerRowDiv = document.createElement('div');
        lowerRowDiv.classList.add('task__controls-row');

        const editBtn = document.createElement('button');
        editBtn.setAttribute('type', 'button');
        editBtn.classList.add('task__contol-btn', 'edit-icon');
        editBtn.addEventListener('click', () => this.onEditTask({ taskID: this.#taskID }));
        lowerRowDiv.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.setAttribute('type', 'button');
        deleteBtn.classList.add('task__contol-btn', 'delete-icon');
        deleteBtn.addEventListener('click', () => this.onDeleteTask({ taskID: this.#taskID }));
        lowerRowDiv.appendChild(deleteBtn);

        controlsDiv.appendChild(lowerRowDiv);

        liElement.appendChild(controlsDiv);

        return liElement;


    }
};
