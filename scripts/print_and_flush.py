import sys
import time

def print_and_flush(string, sleep:float=0):
  if (sleep > 0):
    time.sleep(sleep)
  print(string)
  sys.stdout.flush()