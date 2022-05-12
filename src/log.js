// maps string levels to numeric levels

const LOG_LEVELS = ['silent', 'error', 'minimal', 'warn', 'info', 'verbose', 'silly'];
const LOG_LEVELS_VALUES = {
  silent: 0,
  error: 1,
  minimal: 2,
  warn: 3,
  info: 4,
  verbose: 5,
  silly: 6,
};

let logLevel;

function init(options) {
  if (options && options.level && LOG_LEVELS.indexOf(options.level) !== -1) {
    logLevel = options.level;
  } else {
    logLevel = LOG_LEVELS[LOG_LEVELS_VALUES.info];
  }
}

/**
 * Prints a message if the provided level is lower that the global one
 *
 * @param message The message to print
 * @param level   silent|error|warn|info|verbose|silly
 * @param method  The console method to call. Default: 'log'.
 */
function print(message, level, method = 'log') {
  // not silent
  // not at a level under minimum specified
  if (
    logLevel !== 'silent' &&
    (level == null || LOG_LEVELS_VALUES[logLevel] >= LOG_LEVELS_VALUES[level])
  ) {
    // eslint-disable-next-line no-console
    console[method](message);
  }
}

function log(message) {
  return print(message, LOG_LEVELS[LOG_LEVELS_VALUES.info]);
}

function error(message) {
  return print(message, LOG_LEVELS[LOG_LEVELS_VALUES.error]);
}

export { init, log, error };
