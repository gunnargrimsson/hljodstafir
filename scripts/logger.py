from datetime import datetime
import sys
import time

class Logger:
    def __init__(self, log_file):
        self.log_file = log_file
        self.log_end = []

    def log(self, message):
        """Logs a message to the log file."""
        with open(self.log_file, 'a', encoding='utf8') as f:
            f.write('[{}] {}'.format(datetime.now(), message + '\n'))

    def print_and_flush(self, string: str, sleep: float=0.1):
        """
        Prints a string and flushes the output buffer. Default sleeps for 0.1 seconds.
        Encodes the string to utf8 to avoid errors.
        """
        sys.stdout.reconfigure(encoding='utf8')
        if (sleep > 0):
            time.sleep(sleep)
        print(string)
        sys.stdout.flush()
        self.log(string)

    def add_to_log_end(self, string):
        """
        Adds a string to the log end.
        """
        self.log_end.append(string)

    def print_log_end(self):
        """
        Prints the log end and flushes the output buffer.
        """
        sys.stdout.reconfigure(encoding='utf8')
        self.print_and_flush("Places of interest in the text:")
        for string in self.log_end:
            self.print_and_flush(string)
