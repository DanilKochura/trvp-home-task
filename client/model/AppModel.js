export default class AppModel {
    static async getPlanes() {
        try {
            const getPlanesResponse = await fetch('http://localhost:4321/planes');
            const getPlanesBody = await getPlanesResponse.json();

            if (getPlanesResponse.status !== 200) {
                return Promise.reject(getPlanesBody)
            }

            return getPlanesBody.planes;
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async getFlights() {
        try {
            const getflightsResponse = await fetch('http://localhost:4321/flights');
            const getflightsBody = await getflightsResponse.json();

            if (getflightsResponse.status !== 200) {
                return Promise.reject(getflightsBody)
            }

            return getflightsBody.flights;
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async addFlights({
        flightsID,
        flight_dt,
        city,
        plane_id
    } = {
        flightsID: null,
        flight_dt: '',
        city: '',
        plane_id: null
    }) {
        try {
            const addflightsResponse = await fetch(
                'http://localhost:4321/flights',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        flightsID,
                        flight_dt,
                        city,
                        plane_id
                    }),
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
            );


            if (addflightsResponse.status !== 200) {
                const addflightsBody = await addflightsResponse.json();
                return Promise.reject(addflightsBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Рейс '${flightsID}' добавлен`
            };
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateFlights({
        flightsID,
        flight_dt,
        city,
        plane_id
      } = {
        flightsID: null,
        flight_dt: '',
        city: '',
        plane_id: null
      }) {
        try {
            const updateFlightsResponse = await fetch(
                `http://localhost:4321/flights/${flightsID}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        flight_dt: flight_dt,
                        city: city,
                        plane_id: plane_id
                    }),
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
            );


            if (updateFlightsResponse.status !== 200) {
                const updateFlightsBody = await updateFlightsResponse.json();
                return Promise.reject(updateFlightsBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Параметры рейса '${flightsID}' обнавлены`
            };
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async deleteFlights({
        flightsID,

    } = {
        flightsID: null
    }) {
        try {
            const deleteFlightsResponse = await fetch(
                `http://localhost:4321/flights/${flightsID}`,
                {
                    method: 'DELETE',
                }
            );


            if (deleteFlightsResponse.status !== 200) {
                const updateFlightsBody = await deleteFlightsResponse.json();
                return Promise.reject(deleteFlightsBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Рейс '${flightsID}' удален`
            };
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async addBookings({
        bookingID,
        fullname,
        flightID
      } = {
        bookingID: null,
        fullname: '',
        flightID: null
      }) {
        try {
            const addBookingsResponse = await fetch(
                'http://localhost:4321/bookings',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        bookingID,
                        fullname,
                        flightID
                    }),
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
            );


            if (addBookingsResponse.status !== 200) {
                const addBookingsBody = await addBookingsResponse.json();
                return Promise.reject(addBookingsBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Бронь '${name}' добавлена`
            };
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateBookings({
        bookingID,
        fullname,
        flightID
      } = {
        bookingID: null,
        fullname: '',
        flightID: null
      }) {
        try {
            const updateBookingsResponse = await fetch(
                `http://localhost:4321/bookings/${bookingID}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        fullname,
                        flightID
                    }),
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
            );


            if (updateBookingsResponse.status !== 200) {
                const updateBookingsBody = await updateBookingsResponse.json();
                return Promise.reject(updateBookingsBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Параметр брони '${name}' обнавлен`
            };
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async deleteBookings({
        bookingsID
    } = {
        bookingsID: null
    }) {
        try {
            const deleteBookingsResponse = await fetch(
                `http://localhost:4321/bookings/${bookingsID}`,
                {
                    method: 'DELETE',
                }
            );


            if (deleteBookingsResponse.status !== 200) {
                const deleteBookingsBody = await deleteBookingsResponse.json();
                return Promise.reject(deleteBookingsBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Бронь '${bookingsID}' удалена`
            };
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async moveBookings({
        bookingID,
        flightID,
        newFlightID,
        fullname
      } = {
        bookingID: null,
        flightID: null,
        newFlightID: null,
        fullname: ''
      }) {
        try {
            const moveBookingsResponse = await fetch(
                `http://localhost:4321/bookings`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        bookingID,
                        flightID,
                        newFlightID,
                        fullname
                      }),
                    headers: {
                        'Content-Type' : 'application/json'
                    }
                }
            );

            console.log(moveBookingsResponse)
            if (moveBookingsResponse.status !== 200) {
                const moveBookingsBody = await moveBookingsResponse.json();
                return Promise.reject(moveBookingsBody)
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Бронь '${bookingID}' перенесена`
            };
        } catch(err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }
};