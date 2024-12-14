import pg from 'pg';

export default class DB {
    #dbClient = null;
    #dbHost = '';
    #dbPort = '';
    #dbName = '';
    #dbLogin = '';
    #dbPassword = '';

    constructor(){
        this.#dbHost = process.env.DB_HOST;
        this.#dbPort = process.env.DB_PORT;
        this.#dbName = process.env.DB_NAME;
        this.#dbLogin = process.env.DB_LOGIN;
        this.#dbPassword = process.env.DB_PASSWORD;

        this.#dbClient = new pg.Client({
            user: this.#dbLogin,
            password: this.#dbPassword,
            host: this.#dbHost,
            port: this.#dbPort,
            database: this.#dbName
        });
    }

    async connect(){
        try {
            await this.#dbClient.connect();
            console.log('DB connection established');
        } catch(error) {
            console.error('Unable to connect to DB: ', error);
            return Promise.reject(error);
        }
    }

    async disconnect(){
        await this.#dbClient.end();
        console.log('DB connection was closed');
    }

    //Получения самолетов
    async getPlanes() {
        try {

            const planes = await this.#dbClient.query(
                'SELECT * FROM planes;'
            );

            return planes.rows;
        } catch(error) {
            console.error('Unable get planes, error:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    //Получение броней
    async getBookings() {
        try {

            const bookings = await this.#dbClient.query(
                'SELECT * FROM booking;'
            );

            return bookings.rows;
        } catch(error) {
            console.error('Unable get bookings, error:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    //Получение рейсов
    async getFlights() {
        try {

            const flights = await this.#dbClient.query(
                'SELECT * FROM flights;'
            );

            return flights.rows;
        } catch(error) {
            console.error('Unable get flights, error:', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }



    //Добавление рейсов
    async addFlights({
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
        if (!flightsID || !flight_dt || !city || !plane_id ) {
            const errMsg = `Add tasklist error: {id: ${flightsID}, flight_dt: ${flight_dt}, city: ${city}, plane_id: ${plane_id}}`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            const count_flights = await this.#dbClient.query(
                'SELECT COUNT(*) FROM flights WHERE flight_dt = $1 AND city = $2;',
                [flight_dt, city]
            );

            const count_records = count_flights.rows[0].count;

            if (count_records == 0) {
                try {
                  await this.#dbClient.query(
                    'INSERT INTO flights (id, flight_dt, city, plane_id) VALUES ($1, $2, $3, $4);',
                    [flightsID, flight_dt, city, plane_id]
                  );
                } catch (err) {
                  console.log('Unable to add flight. Error during insertion:', err);
                  return Promise.reject({
                    type: 'internal',
                    error: err
                  });
                }
              } else {
                const errMsg = `Flight with flight_dt=${flight_dt} and city=${city} already exists.`;
                console.log(errMsg);
                return Promise.reject({
                  type: 'client',
                  error: new Error(errMsg)
                });
              }
        } catch (err) {
            console.log('Error while checking existing flights:', err);
            return Promise.reject({
              type: 'internal',
              error: err
            });
        }
    }

    //Изменение информации о рейсах
    async updateFlights({
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
        if (!flightsID || (!flight_dt && !city && plane_id === null)) {
          const errMsg = `Update flights error: {id: ${flightsID}, flight_dt: ${flight_dt}, city: ${city}, plane_id: ${plane_id}}`;
          console.error(errMsg);
          return Promise.reject({
            type: 'client',
            error: new Error(errMsg)
          });
        }

        try {
          // Проверяем количество рейсов
          const count_flights = await this.#dbClient.query(
            'SELECT COUNT(*) FROM flights WHERE flight_dt = $1 AND city = $2;',
            [flight_dt, city]
          );

          const count_records = count_flights.rows[0].count;

          if (count_records == 0) {
            // Если количество рейсов равно 0, выполняем обновление
            let query = null;
            const queryParams = [];

            if (flight_dt !== '' && city !== '' && plane_id !== null) {
              query = 'UPDATE flights SET flight_dt = $1, city = $2, plane_id = $3 WHERE id = $4;';
              queryParams.push(flight_dt, city, plane_id, flightsID);
            } else if (flight_dt !== '' && city !== '') {
              query = 'UPDATE flights SET flight_dt = $1, city = $2 WHERE id = $3;';
              queryParams.push(flight_dt, city, flightsID);
            } else if (flight_dt !== '' && plane_id !== null) {
              query = 'UPDATE flights SET flight_dt = $1, plane_id = $2 WHERE id = $3;';
              queryParams.push(flight_dt, plane_id, flightsID);
            } else if (city !== '' && plane_id !== null) {
              query = 'UPDATE flights SET city = $1, plane_id = $2 WHERE id = $3;';
              queryParams.push(city, plane_id, flightsID);
            } else {
              // Если не указаны поля для обновления
              const errMsg = `No fields specified for update: {id: ${flightsID}, flight_dt: ${flight_dt}, city: ${city}, plane_id: ${plane_id}}`;
              console.error(errMsg);
              return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
              });
            }

            // Выполняем обновление
            await this.#dbClient.query(query, queryParams);
          } else {
            // Если количество рейсов больше 0, возвращаем ошибку
            const errMsg = `Flight with flight_dt=${flight_dt} and city=${city} already exists.`;
            console.error(errMsg);
            return Promise.reject({
              type: 'client',
              error: new Error(errMsg)
            });
          }
        } catch (err) {
          console.log('Unable to update flights:', err);
          return Promise.reject({
            type: 'internal',
            error: err
          });
        }
      }


    //Удаление рейса
    async deleteFlights({
        flightsID,

    } = {
        flightsID: null
    }) {

        if (!flightsID) {
            const errMsg = `Delete flight error: {id: ${flightsID}}`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'DELETE FROM booking WHERE flight_id = $1;',
                [flightsID]
            );

            await this.#dbClient.query(
                'DELETE FROM flights WHERE id = $1;',
                [flightsID]
            );
        } catch (err) {
            console.log('Unable to delete flight:', err);
            return Promise.reject({
                type: 'internal',
                error: err
            });
        }
    }


    //Добавление брони
    async addBookings({
        bookingID,
        fullname,
        flightID
      } = {
        bookingID: null,
        fullname: '',
        flightID: null
      }) {
        if (!bookingID || !fullname || !flightID) {
          const errMsg = `Add booking error: {id: ${bookingID}, fullname: ${fullname}, flight_id: ${flightID}}`;
          console.error(errMsg);
          return Promise.reject({
            type: 'client',
            error: new Error(errMsg)
          });
        }

        try {
          // Получение количества мест в самолете
          const planeSizeQuery = await this.#dbClient.query(
            'SELECT size FROM planes WHERE id = (SELECT plane_id FROM flights WHERE id = $1);',
            [flightID]
          );

          const planeSize = parseInt(planeSizeQuery.rows[0].size, 10);

          // Подсчет занятых мест в самолете
          const occupiedSeatsQuery = await this.#dbClient.query(
            'SELECT COUNT(*) FROM booking WHERE flight_id = $1;',
            [flightID]
          );

          const occupiedSeats = parseInt(occupiedSeatsQuery.rows[0].count, 10);

          // Проверка наличия свободных мест
          if (occupiedSeats >= planeSize) {
            const errMsg = `No available seats for booking on flight ${flightID}`;
            console.error(errMsg);
            return Promise.reject({
              type: 'client',
              error: new Error(errMsg)
            });
          }

          // Проверка наличия брони у человека на данном рейсе
          const existingBookingQuery = await this.#dbClient.query(
            'SELECT COUNT(*) FROM booking WHERE fullname = $1 AND flight_id = $2;',
            [fullname, flightID]
          );

          const existingBookingsCount = parseInt(existingBookingQuery.rows[0].count, 10);

          if (existingBookingsCount > 0) {
            const errMsg = `Booking already exists for ${fullname} on flight ${flightID}`;
            console.error(errMsg);
            return Promise.reject({
              type: 'client',
              error: new Error(errMsg)
            });
          }

          // Вставка новой брони
          await this.#dbClient.query(
            'INSERT INTO booking (id, fullname, flight_id) VALUES ($1, $2, $3);',
            [bookingID, fullname, flightID]
          );
        } catch (err) {
          console.log('Unable to add booking:', err);
          return Promise.reject({
            type: 'internal',
            error: err
          });
        }
      }

    //Изменение информации брони
    async updateBookings({
        bookingID,
        fullname,
        flightID
      } = {
        bookingID: null,
        fullname: '',
        flightID: null
      }) {
        if (!bookingID || !fullname || !flightID) {
          const errMsg = `Update booking error: {id: ${bookingID}, new_fullname: ${fullname}, flight_id: ${flightID}}`;
          console.error(errMsg);
          return Promise.reject({
            type: 'client',
            error: new Error(errMsg)
          });
        }

        try {
          // Проверка наличия человека на рейсе
          const existingBookingQuery = await this.#dbClient.query(
            'SELECT COUNT(*) FROM booking WHERE fullname = $1 AND flight_id = $2;',
            [fullname, flightID]
          );

          const existingBookingsCount = parseInt(existingBookingQuery.rows[0].count, 10);

          if (existingBookingsCount == 0) {
            // Обновление имени в брони
            await this.#dbClient.query(
            'UPDATE booking SET fullname = $1 WHERE id = $2;',
            [fullname, bookingID]
          );
          } else {
            const errMsg = `Booking already exists for ${fullname} on flight ${flightID}`;
            console.error(errMsg);
            return Promise.reject({
              type: 'client',
              error: new Error(errMsg)
            });
          }
        } catch (err) {
          console.log('Unable to update booking:', err);
          return Promise.reject({
            type: 'internal',
            error: err
          });
        }
      }

    //Удаление брони
    async deleteBookings({
        bookingsID
    } = {
        bookingsID: null
    }) {
        if (!bookingsID) {
            const errMsg = `Delete booking error: {id: ${bookingsID}}`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'DELETE FROM booking WHERE id = $1;',
                [bookingsID]
            );

        } catch (err) {
            console.log('Unable to delete book:', err);
            return Promise.reject({
                type: 'internal',
                error: err
            });
        }
    }


    //Перетаскивание брони на другой рейс
    async moveBookings({
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
        if (!bookingID || !flightID || !newFlightID || !fullname) {
          const errMsg = `Move booking error: {id: ${bookingID}, flight_id: ${flightID}, new_flight_id: ${newFlightID}, fullname: ${fullname}}`;
          console.error(errMsg);
          return Promise.reject({
            type: 'client',
            error: new Error(errMsg)
          });
        }

        try {
          // Получение количества мест в новом самолете
          const planeSizeQuery = await this.#dbClient.query(
            'SELECT size FROM planes WHERE id = (SELECT plane_id FROM flights WHERE id = $1);',
            [newFlightID]
          );

          const planeSize = parseInt(planeSizeQuery.rows[0].size, 10);

          // Подсчет занятых мест в новом самолете
          const occupiedSeatsQuery = await this.#dbClient.query(
            'SELECT COUNT(*) FROM booking WHERE flight_id = $1;',
            [newFlightID]
          );

          const occupiedSeats = parseInt(occupiedSeatsQuery.rows[0].count, 10);

          // Проверка наличия свободных мест
          if (occupiedSeats >= planeSize) {
            const errMsg = `No available seats for booking on new flight ${newFlightID}`;
            console.error(errMsg);
            return Promise.reject({
              type: 'client',
              error: new Error(errMsg)
            });
          }

          // Получение изначального места полета
          const initialCityQuery = await this.#dbClient.query(
            'SELECT city FROM flights WHERE id = (SELECT flight_id FROM booking WHERE id = $1);',
            [bookingID]
          );

          const initialCity = initialCityQuery.rows[0].city;

          const newCityQuery = await this.#dbClient.query(
            'SELECT city FROM flights WHERE id = $1;',
            [newFlightID]
          );
          const newCity = newCityQuery.rows[0].city;

          // Проверка совпадения места полета
          if (initialCity !== newCity) {
            const errMsg = `Initial flight city ${initialCity} does not match new flight ${newFlightID}`;
            console.error(errMsg);
            return Promise.reject({
              type: 'client',
              error: new Error(errMsg)
            });
          }

          // Проверка отсутствия брони у человека на новом рейсе
          const existingBookingQuery = await this.#dbClient.query(
            'SELECT COUNT(*) FROM booking WHERE fullname = $1 AND flight_id = $2;',
            [fullname, newFlightID]
          );

          const existingBookingsCount = existingBookingQuery.rows[0].count;

          if (existingBookingsCount == 0) {
            // Обновление места полета в брони
            await this.#dbClient.query(
            'UPDATE booking SET flight_id = $1 WHERE id = $2;',
            [newFlightID, bookingID]
          );
          } else {
            const errMsg = `Booking already exists for ${fullname} on new flight ${newFlightID}`;
            console.error(errMsg);
            return Promise.reject({
              type: 'client',
              error: new Error(errMsg)
            });
          }

        } catch (err) {
          console.log('Unable to move booking:', err);
          return Promise.reject({
            type: 'internal',
            error: err
          });
        }
      }
};