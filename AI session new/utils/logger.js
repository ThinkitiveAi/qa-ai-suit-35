class Logger {
  static info(message) {
    console.info(`[INFO] ${message}`);
  }
  static warn(message) {
    console.warn(`[WARN] ${message}`);
  }
  static error(message) {
    console.error(`[ERROR] ${message}`);
  }
}

export default Logger;