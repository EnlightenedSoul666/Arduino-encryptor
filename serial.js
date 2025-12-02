const { SerialPort } = require('serialport');

const arduinoPort = new SerialPort({
  path: 'COM3',
  baudRate: 9600,
  autoOpen: false
});

arduinoPort.open((err) => {
  if (err) {
    console.log("Failed to open COMf:", err.message);
  } else {
    console.log("Connected to Arduino on COM3");
  }
});

module.exports = arduinoPort;
