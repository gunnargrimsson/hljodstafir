from datetime import datetime
import sys
import time

class Logger:
    def __init__(self, log_file):
        self.log_file = log_file

    def log(self, message):
        with open(self.log_file, 'a') as f:
            f.write('[{}] {}'.format(datetime.now() ,message + '\n'))

    def print_and_flush(self, string: str, sleep: float=0):
        if (sleep > 0):
            time.sleep(sleep)
        print(string)
        sys.stdout.flush()
        self.log(string)