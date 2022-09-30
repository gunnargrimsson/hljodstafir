import os
from aeneas.executetask import ExecuteTask
from aeneas.task import Task
from aeneas.logger import Logger as AeneasLogger
from scripts.logger import Logger
from config import Config


def force_align(audio_files: list, text_files: list, language_code: str, foldername: str, location: str, logger: Logger):
    """Forces the alignment of the audio and text files."""
    for i, mp3 in enumerate(audio_files):
        # Setup config string & absolute file path for audio/text/syncfile
        config_string = "allow_unlisted_languages=True|c_extensions=True|cdtw=True|cew=True|cew_subprocess_enabled=False|cew_subprocess_path=python|cfw=True|cmfcc=True|downloader_retry_attempts=5|downloader_sleep=1.000|dtw_algorithm=stripe|dtw_margin=120.000|dtw_margin_l1=120.000|dtw_margin_l2=60.000|dtw_margin_l3=20.000|task_language={}|is_text_type=unparsed|os_task_file_format=smil|os_task_file_smil_audio_ref={}|os_task_file_smil_page_ref={}".format(
            language_code, mp3, text_files[i])
        # Create Task
        task = Task(config_string=config_string)
        task.audio_file_path_absolute = f"{Config.upload_folder}{foldername}/{location}{mp3}"
        task.text_file_path_absolute = f"{Config.upload_folder}{foldername}/{location}clean/{text_files[i]}"
        # Each smil file is named the expected smil_prefix + number with leading zeros (3 or 4)
        task.sync_map_file_path_absolute = f"{Config.upload_folder}{foldername}/{location}{text_files[i].split('.')[0]}.smil"

        # stdout.flush forces the progress print to be relayed to the server in real time
        logger.print_and_flush(f"Processing.. {i+1}/{len(audio_files)}")

        aeneasLogger = AeneasLogger()

        # Execute Task to output path
        ExecuteTask(task, logger=aeneasLogger).execute()
        task.output_sync_map_file()
        # Write Verbose Logs to temp file
        task.logger.write(
            '{}temp/logs/{}.log'.format(Config.upload_folder, text_files[i].split('.')[0]))
        # Append temp log to main log file
        with open('{}temp/logs/{}.log'.format(Config.upload_folder, text_files[i].split('.')[0]), 'r', encoding='utf8') as temp_log_file:
            with open(logger.log_file, 'a', encoding='utf8') as log_file:
                log_file.write(
                    'Verbose DEBUG Logs for {}:\n'.format(text_files[i]))
                for line in temp_log_file:
                    log_file.write('\t' + line)
                log_file.write('\n\n')
        # Delete temp log file
        os.remove('{}temp/logs/{}.log'.format(Config.upload_folder,
                  text_files[i].split('.')[0]))
