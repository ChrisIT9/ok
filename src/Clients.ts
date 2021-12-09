import SerialPort from 'serialport';
import MQTT from 'async-mqtt';
import { SERIAL_PORT, BAUD_RATE, MQTT_BROKER  } from './Config';
const Readline = require('@serialport/parser-readline');

const port = new SerialPort(SERIAL_PORT, {
    baudRate: BAUD_RATE
}, (error) => {
    if (error) {
        console.log(`[SERIAL] ${error}.\nExiting...`);
        process.exit();
    }
    else    
        console.log(`[SERIAL] Connected to ${SERIAL_PORT}.`);
});

export const serialParser = port.pipe(new Readline({ delimiter: '\n' })); // Only sends the data when it finds a newline character in the string

const mqttClient = MQTT.connect(MQTT_BROKER);

mqttClient.on('connect', () => console.log(`[MQTT] Connected to ${MQTT_BROKER}.`));

export { mqttClient };