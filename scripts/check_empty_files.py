from bs4 import BeautifulSoup
from scripts.logger import Logger


def check_empty_files(foldername: str, location: str, text_files: list, audio_files: list, logger: Logger):
    current_text_file = None
    current_audio_file = None
    """
        Check whether "clean file" that has a corresponding audio file is "empty" of tags and warn the user
    """
    def check_if_empty_text_but_audio_exists(text_file: str, audio_file: str, text: str, logger: Logger):
        temp_soup = BeautifulSoup(text, 'html.parser')
        soup_body = temp_soup.body
        # check if any tags are present in body
        if soup_body.find_all():
            return False
        else:
            logger.print_and_flush("WARNING: Text file {} is empty but an audio file {} exists".format(text_file, audio_file))
            return True

    try:
        for id, text_file in enumerate(text_files):
            current_text_file = text_file
            current_audio_file = audio_files[id]
            with open('././public/uploads/{}/{}{}'.format(foldername, location, current_text_file), 'r', encoding='utf8') as f:
                text = f.read()
                check_if_empty_text_but_audio_exists(current_text_file, current_audio_file, text, logger)
    except Exception as e:
        logger.print_and_flush(
            'ERROR: Error while processing {} and {}, failed with error: {}'.format(current_text_file, current_audio_file, e))
        return False