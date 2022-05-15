from aeneas.executetask import ExecuteTask
from aeneas.task import Task
from scripts.logger import Logger
from scripts.markup import markup
from scripts.clean import clean
from scripts.remove_clean_files import remove_clean_files
from scripts.remove_files import remove_files
from scripts.extract_epub import extract_epub
from scripts.zip_epub import check_epub_exists, zip_epub
from scripts.get_package_opf import get_package_opf
from scripts.get_files_from_package_opf import get_files_from_package_opf
from scripts.check_folders import check_if_folders_exists
from scripts.aeneas_languages import LANGUAGE_CODE_TO_HUMAN as languages
import sys

if __name__ == "__main__":
    try:
        check_if_folders_exists()
        language_code = sys.argv[3] if len(sys.argv) >= 3 else 'isl'
        foldername = sys.argv[1]
        finalname = check_epub_exists(foldername)
        logger = Logger('./public/logs/{}.log'.format(finalname))
        logger.print_and_flush("Processing: {}".format(finalname))
        logger.print_and_flush("Language: {}".format(
            languages[language_code.upper()]))
        extract_epub(foldername)

        package_opf, location = get_package_opf(foldername, logger)
        if not package_opf:
            raise Exception(
                "Could not find package.opf, Not a valid EPUB File.\nPlease fix, refresh and try again.")

        audio_files = get_files_from_package_opf(package_opf, 'audio/mpeg')
        text_files = get_files_from_package_opf(
            package_opf, 'application/xhtml+xml')

        logger.print_and_flush("Audio Files: {}".format(len(audio_files)))
        logger.print_and_flush("Text Files: {}".format(len(text_files)), 0.1)

        segmentation_correct = len(audio_files) == len(text_files)
        if not segmentation_correct:
            logger.print_and_flush(
                "WARNING: Number of mp3 files and number of segments do not match.", 0.1)

        markup(foldername, location, text_files, logger)
        # ? generate_id(foldername)
        clean(foldername, location, text_files, logger)
        # ? process

        for i, mp3 in enumerate(audio_files):
            # Setup config string & absolute file path for audio/text/syncfile
            config_string = "task_language={}|is_text_type=unparsed|os_task_file_format=smil|os_task_file_smil_audio_ref={}|os_task_file_smil_page_ref={}".format(
                language_code, mp3, text_files[i])
            # Create Task
            task = Task(config_string=config_string)
            task.audio_file_path_absolute = "./public/uploads/{}/{}{}".format(
                foldername, location, mp3)
            task.text_file_path_absolute = "./public/uploads/{}/{}clean/{}".format(
                foldername, location, text_files[i])
            # Each smil file is named the expected smil_prefix + number with leading zeros (3 or 4)
            task.sync_map_file_path_absolute = "./public/uploads/{}/{}{}.smil".format(
                foldername, location, text_files[i].split('.')[0])

            # stdout.flush forces the progress print to be relayed to the server in real time
            logger.print_and_flush(
                "Processing.. {}/{}".format(i+1, len(audio_files)))

            # Execute Task to output path
            ExecuteTask(task).execute()
            task.output_sync_map_file()

        remove_clean_files(foldername, location, logger)
        zip_epub(foldername, finalname, logger)
        logger.print_and_flush("DONE")
        remove_files(foldername, logger)
    except Exception as e:
        logger.print_and_flush("ERROR: {}".format(e))
        raise
