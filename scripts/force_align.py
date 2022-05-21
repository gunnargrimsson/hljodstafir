from aeneas.executetask import ExecuteTask
from aeneas.task import Task
from scripts.logger import Logger

def force_align(audio_files: list, text_files: list, language_code: str, foldername: str, location: str, logger: Logger):
    """Forces the alignment of the audio and text files."""
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
