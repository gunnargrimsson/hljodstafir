from bs4 import BeautifulSoup
from scripts.logger import Logger
from config import Config

def check_empty_files(foldername: str, location: str, text_files: list, audio_files: list, logger: Logger):
    current_text_file = None
    current_audio_file = None
    skip_files: list = []
    """
        Check whether "clean file" that has a corresponding audio file is "empty" of tags and warn the user
    """
    def check_if_empty_text_but_audio_exists(text_file: str, audio_file: str, text: str, logger: Logger):
        clean_soup = BeautifulSoup(text, 'html.parser')
        # check if any tags are present in body
        if clean_soup.find_all():
            return False
        logger.print_and_flush("WARNING: Text file {} is empty but an audio file {} exists, added to skip list.".format(text_file, audio_file))
        return True

    try:
        for id, text_file in enumerate(text_files):
            current_text_file = text_file
            current_audio_file = audio_files[id]
            with open(f'./{Config.upload_folder}{foldername}/{location}/clean/{current_text_file}', 'r', encoding='utf8') as f:
                text = f.read()
                skip_file = check_if_empty_text_but_audio_exists(current_text_file, current_audio_file, text, logger)
                if skip_file:
                    skip_files.append(current_text_file)
                    skip_files.append(current_audio_file)
        return skip_files
    except Exception as e:
        logger.print_and_flush(
            'ERROR: Error while processing {current_text_file} and {current_audio_file}, failed with error: {e}')
        return skip_files