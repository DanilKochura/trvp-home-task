-- DB & tables
CREATE DATABASE airflot IF NOT EXISTS;

CREATE TABLE planes (
    id UUID PRIMARY KEY,
    name VARCHAR(20),
    size INTEGER
 ) IF NOT EXISTS;

 CREATE TABLE flights (
    id UUID PRIMARY KEY,
    flight_dt timestamptz,
    city VARCHAR(150),
    plane_id UUID REFERENCES planes
) IF NOT EXISTS;

 CREATE TABLE booking (
    id UUID PRIMARY KEY,
    fullname VARCHAR(150),
    flight_id UUID REFERENCES flights
) IF NOT EXISTS;

-- User
CREATE ROLE air_admin LOGIN ENCRYPTED PASSWORD 'admin';
GRANT SELECT, INSERT, UPDATE, DELETE ON planes, flights, booking TO air_admin;

--SQL QUERY

--Получения списка самолетов(+)(+)
SELECT * FROM planes; 

--Получения списка броней(+)(+)
SELECT * FROM booking; 

--Получения списка рейсов(+)(+)
SELECT * FROM flights; 


--Добавление рейсов(+)(+)
    --Перед добавлением рейса надо проверить, что такого рейса нет
    SELECT COUNT(*) FROM flights WHERE flight_dt = <flight_dt> AND city = <city>;
INSERT INTO flights (id, flight_dt, city, plane_id) VALUES (<flights_id>, <flight_dt>, <city>, <plane_id>);

--Изменение информации о рейсах(+)(+/-)
    --Перед изменением рейса надо проверить, что введеные параметры не создают уже имеющийся рейс
    SELECT COUNT(*) FROM flights WHERE flight_dt = <flight_dt> AND city = <city>;
UPDATE flights SET flight_dt = <new_flight_dt>, city = <new_city>, plane_id = <new_plane_id>  WHERE id = <flights_id>;

--Удаление рейса (+)(+)
    --Перед удалением рейса надо удалить все брони на этот рейс
    DELETE FROM booking WHERE flight_id = <flights_id>
DELETE FROM flights WHERE id = <flights_id>


--Добавление брони(+)(+)
    --Перед добавлением брони надо узнать количество свободных мест в самолете
        --Получение количества мест в самолете
        SELECT size FROM planes WHERE id = (SELECT plane_id FROM flights WHERE id = <flight_id>);
        --Подсчет занятых мест в самолете
        SELECT COUNT(*) FROM booking WHERE flight_id = <flight_id>;
    --Перед добавлением брони надо проверить нет ли у этого человека уже брони на данном рейсе
    SELECT COUNT(*) FROM booking WHERE fullname = <fullname> and flight_id = <flight_id>;
INSERT INTO booking (id, fullname, flight_id) VALUES (<booking_id>, <fullname>, <flight_id>);

--Редактирование брони(+)(+)
    --Перед изменением имени надо узнать нет ли такого человека на рейсе
    SELECT COUNT(*) FROM booking WHERE fullname = <fullname> and flight_id = <flight_id>;
UPDATE booking SET fullname = <new_fullname>  WHERE id = <booking_id>;

--Удаление брони(+)(+)
DELETE FROM booking WHERE id = <booking_id>

--Перетаскивание брони на другой рейс(+)
    --Перед перетаскиванием брони надо узнать количество свободных мест в самолете
        --Получение количества мест в самолете
        SELECT size FROM planes WHERE id = (SELECT plane_id FROM flights WHERE id = <flight_id>);
        --Подсчет занятых мест в самолете
        SELECT COUNT(*) FROM booking WHERE flight_id = <flight_id>;
    --Место полета совпадает. 
        --Для этого получаем изначальное место полета
        SELECT city FROM flights WHERE id = (SELECT flight_id FROM booking WHERE id = <booking_id>);
        --Получаем новое место рейса
        SELECT city FROM flights WHERE id = <new_flightID>;
    --Перед перетаскиванием брони надо проверить нет ли у этого человека уже брони на данном рейсе
    SELECT COUNT(*) FROM booking WHERE fullname = <fullname> and flight_id = <flight_id>;
UPDATE booking SET flight_id = <flight_id> WHERE id = <booking_id>;
--Скрипт для заполнения данных для самолета
INSERT INTO planes (id, name, size) VALUES ();

