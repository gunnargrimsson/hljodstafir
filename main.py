from datetime import datetime
from scripts.adjust_smil_files import adjust_smil_files
from scripts.check_audio_length import check_audio_length
from scripts.check_empty_files import check_empty_files
from scripts.markup import markup
from scripts.clean import clean
from scripts.force_align import force_align
from scripts.remove_clean_files import remove_clean_files
from scripts.remove_files import remove_files
from scripts.extract_epub import extract_epub
from scripts.zip_epub import check_epub_exists, zip_epub
from scripts.get_package_opf import get_package_opf
from scripts.get_files_from_package_opf import get_files_from_package_opf, check_toc_nav
from scripts.check_folders import check_if_folders_exists
from scripts.check_meta_tags import check_meta_tags
from scripts.aeneas_languages import LANGUAGE_CODE_TO_HUMAN as languages
from scripts.add_parent_highlighting import add_parent_highlighting
from scripts.logger import Logger
from config import Config
import sys

if __name__ == "__main__":
    # Currently if the computer running the script is not a linux machine the script might stall on files longer than 30~ minutes.
    mp3_max_minutes_length = 30
    foldername = sys.argv[1]
    language_code = sys.argv[2] if len(sys.argv) >= 3 else 'isl'
    ignore_aside = sys.argv[3] == "true" if len(sys.argv) >= 4 else False
    adjustment = int(sys.argv[4]) if len(sys.argv) >= 5 else 100
    parent_highlighting = sys.argv[5] == "true" if len(
        sys.argv) >= 6 else False
    allow_longer_mp3 = sys.argv[6] == "true" if len(sys.argv) >= 7 else False
    userID = sys.argv[7] if len(sys.argv) >= 8 else None
    try:
        if (userID == None):
            raise Exception("No userID was provided")
        Config.userID = userID
        Config.folder_name = foldername
        Config.upload_folder, Config.output_folder, Config.logs_folder = check_if_folders_exists(
            Config.userID)
        Config.final_name = check_epub_exists()
        logger = Logger(
            f'{Config.logs_folder}{Config.final_name}-{datetime.now().strftime("%Y-%m-%d-%H-%M-%S")}.log')
        error_has_been_logged = False
        logger.print_and_flush(f"Processing: {Config.final_name}")
        logger.print_and_flush(f"Language: {languages[language_code.upper()]}")
        if language_code.upper() not in languages:
            logger.print_and_flush('WARNING: Language not supported')
        logger.print_and_flush(f"Ignore Aside/Image Text: {ignore_aside}")
        extract_epub()
        package_opf, location = get_package_opf(logger)
        if not package_opf:
            raise Exception(
                "Could not find package.opf, Not a valid EPUB File.\nPlease fix, refresh and try again.")

        audio_files = get_files_from_package_opf(package_opf, 'audio/mpeg')
        if audio_files is None:
            raise Exception("Could not find audio files in package.opf")
        # check if audio files lengths are within allowed range
        if not allow_longer_mp3:
            check_audio_length(mp3_max_minutes_length,
                               foldername, location, audio_files)
        # check if nav.xhtml exists and if its empty or not
        check_toc_nav(package_opf, foldername, location)
        # check if package.opf has meta properties that break the book
        check_meta_tags(package_opf, logger)
        text_files = get_files_from_package_opf(
            package_opf, 'application/xhtml+xml')
        if text_files is None:
            raise Exception("Could not find text files in package.opf")
        smil_files = get_files_from_package_opf(
            package_opf, 'application/smil+xml')
        if smil_files is None:
            raise Exception("Could not find smil files in package.opf")

        logger.print_and_flush(f"Audio Files: {len(audio_files)}")
        logger.print_and_flush(f"Text Files: {len(text_files)}", 0.1)

        segmentation_correct = len(audio_files) == len(text_files)
        if not segmentation_correct:
            logger.print_and_flush(
                "ERROR: Number of mp3 files and number of text segments do not match.")
            logger.print_and_flush(
                "ERROR: List of found text and audio files can be found in the log file.", 0.1)
            logger.log(f"Audio Files: \n{audio_files}")
            logger.log(f"Text Files: \n{text_files}")
            error_has_been_logged = True
            raise Exception(
                "Number of mp3 files and number of text segments do not match.")

        # Markup the text files before for sentence level highlighting
        markup(foldername, location, text_files, ignore_aside, logger)
        # Create clean text files of everything except the text and markup for aeneas
        cleaned = clean(foldername, location, text_files, logger)
        if (cleaned == False):
            raise Exception("Error occurred while cleaning text files.")
        skip_files = check_empty_files(
            foldername, location, text_files, audio_files, logger)
        # remove empty files from the list of files to be processed
        text_files = [x for x in text_files if x not in skip_files]
        audio_files = [x for x in audio_files if x not in skip_files]
        # Aeneas force alignment of audio and text
        force_align(audio_files, text_files, language_code,
                    foldername, location, logger)
        if (adjustment > 0):
            adjust_smil_files(smil_files, foldername,
                              location, logger, adjustment)
        if parent_highlighting:
            add_parent_highlighting(foldername, location, text_files, logger)
        # Remove clean files after aeneas processes them
        remove_clean_files(foldername, location, logger)
        # Zip the epub back up
        zip_epub(logger)
        # Remove the extra files from the server (Doesn't log any exceptions)
        remove_files(logger, False)
        # Notifies the server that the process is complete
        # Waits for extra 1 second to allow all other messages to clear
        logger.print_log_end()
        logger.print_and_flush("DONE", 1)
    except Exception as e:
        remove_files(logger)
        if not error_has_been_logged:
            logger.print_and_flush(f"ERROR: {e}")
        raise
