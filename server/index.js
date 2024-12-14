import express  from "express";
import dotenv from 'dotenv';
import DB from './db/client.js';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: './server/.env'
});

const appHost = process.env.APP_HOST;
const appPort = process.env.APP_PORT;

const app = express();
const db = new DB();

//logging middleware
app.use('*', (req, res, next) => {
    console.log(
        req.method,
        req.baseUrl || req.url,
        new Date().toISOString()
    );

    next();
});

//middleware for static app filese
app.use('/', express.static(path.resolve(__dirname, '../dist')));

/*app.get('/', (req, res) => {
    res.send('Hello, world!');
});*/

app.get('/planes', async(req, res) => {
    try {
        const dbPlanes = await db.getPlanes();

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ planes: dbPlanes });
    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Getting planes error: ${err.error.message || err.error}`
        });
    }

});

//Получение изначальной информации
app.get('/flights', async (req, res) => {
    try {
        const [dbFlights, dbPlanes, dbBookings] = await Promise.all([
            db.getFlights(),
            db.getPlanes(),
            db.getBookings()
        ]);

        const flightList = dbFlights.map((flight) => {
            const plane = dbPlanes.find(p => p.id === flight.plane_id);
            const bookingsForFlight = dbBookings.filter(booking => booking.flight_id === flight.id);

            return {
                flightID: flight.id,
                flight_dt: flight.flight_dt,
                city: flight.city,
                plane: {
                    id: plane.id,
                    name: plane.name,
                    size: plane.size
                },
                bookings: bookingsForFlight
            };
        });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ flights: flightList });
    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Getting flights error: ${err.error.message || err.error}`
        });
    }

});

// Body parsing middleware
app.use('/flights', express.json());
// Добавление рейса
app.post('/flights', async (req, res) => {
    try {
        const { flightsID, flight_dt, city, plane_id } = req.body;
        await db.addFlights({ flightsID, flight_dt, city, plane_id });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        switch (err.type) {
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Add flight error: ${err.error.message || err.error}`
        });
    }
});


// Body parsing middleware
app.use('/flights/:flightsID', express.json());
// Изменение об информации рейса
app.patch('/flights/:flightsID', async (req, res) => {
    try {
        const { flightsID }= req.params; // Получение значения из URL
        const { flight_dt, city, plane_id } = req.body; // Получение данных из тела запроса
        await db.updateFlights({ flightsID, flight_dt, city, plane_id });
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        // Обработка ошибок
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Update flight error: ${err.error.message || err.error}`
        });
    }
});


// Удаление рейса
app.delete('/flights/:flightsID', async (req, res) => {
    try {
        const { flightsID }= req.params; // Получение значения из URL
        await db.deleteFlights({ flightsID });


        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        // Обработка ошибок
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Delete flight error: ${err.error.message || err.error}`
        });
    }
});


// Body parsing middleware
app.use('/bookings', express.json());
// Добавление брони
app.post('/bookings', async (req, res) => {
    try {
        const { bookingID, fullname, flightID } = req.body;
        await db.addBookings({ bookingID, fullname, flightID });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        switch (err.type) {
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Add booking error: ${err.error.message || err.error}`
        });
    }
});

// Body parsing middleware
app.use('/bookings/:bookingID', express.json());
// Изменение информации брони
app.patch('/bookings/:bookingID', async (req, res) => {
    try {
        const { bookingID } = req.params; // Получение значения из URL
        const { fullname, flightID } = req.body; // Получение данных из тела запроса
        await db.updateBookings({ bookingID, fullname, flightID });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        // Обработка ошибок
        switch (err.type) {
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Update booking error: ${err.error.message || err.error}`
        });
    }
});

//Удаление брони
app.delete('/bookings/:bookingsID', async (req, res) => {
    try {
        const { bookingsID } = req.params; // Получение значения из URL
        await db.deleteBookings({ bookingsID });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        // Обработка ошибок
        switch (err.type) {
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Delete booking error: ${err.error.message || err.error}`
        });
    }
});


// Body parsing middleware
app.use('/bookings', express.json());
// Перетаскивание брони на другой рейс
app.patch('/bookings', async (req, res) => {
    try {
        const { bookingID ,flightID, newFlightID, fullname } = req.body; // Получение данных из тела запроса
        await db.moveBookings({ bookingID, flightID, newFlightID, fullname });


        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();
    } catch (err) {
        // Обработка ошибок
        switch (err.type) {
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;

            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }

        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Move booking error: ${err.error.message || err.error}`
        });
    }
});



const server = app.listen(Number(appPort), appHost, async () => {
    try {
        await db.connect();
    } catch(error) {
        console.log('App shut down');
        process.exit(100);
    }

    console.log(`App started at host http://${appHost}:${appPort}`);

    //console.log(await db.getFlights());
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
        await db.disconnect();
        console.log('HTTP server closed');
    });
});