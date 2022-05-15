import os


def check_if_folders_exists():
    """Creates public/logs and public/output directories if they don't exist"""
    # check if ./public/logs exists
    if not os.path.exists('./public/logs'):
        # create ./public/logs directory
        os.makedirs('./public/logs')
    # check if ./public/output exists
    if not os.path.exists('./public/output'):
        # create ./public/output directory
        os.makedirs('./public/output')
