import os
from aeneas.executetask import ExecuteTask
from aeneas.task import Task
from aeneas.logger import Logger as AeneasLogger
from scripts.logger import Logger

def force_align(audio_files: list, text_files: list, language_code: str, foldername: str, location: str, logger: Logger):
    """Forces the alignment of the audio and text files."""
    for i, mp3 in enumerate(audio_files):
        # Setup config string & absolute file path for audio/text/syncfile
        # 'aba_no_zero_duration=0.001|aba_nonspeech_tolerance=0.080|allow_unlisted_languages=False|c_extensions=True|cdtw=True|cew=True|cew_subprocess_enabled=False|cew_subprocess_path=python|cfw=True|cmfcc=True|downloader_retry_attempts=5|downloader_sleep=1.000|dtw_algorithm=stripe|dtw_margin=60.000|dtw_margin_l1=60.000|dtw_margin_l2=30.000|dtw_margin_l3=10.000|ffmpeg_path=ffmpeg|ffmpeg_sample_rate=16000|ffprobe_path=ffprobe|job_max_tasks=0|mfcc_emphasis_factor=0.97|mfcc_fft_order=512|mfcc_filters=40|mfcc_lower_frequency=133.3333|mfcc_mask_extend_speech_after=0|mfcc_mask_extend_speech_before=0|mfcc_mask_log_energy_threshold=0.699|mfcc_mask_min_nonspeech_length=1|mfcc_mask_nonspeech=False|mfcc_mask_nonspeech_l1=False|mfcc_mask_nonspeech_l2=False|mfcc_mask_nonspeech_l3=False|mfcc_size=13|mfcc_upper_frequency=6855.4976|mfcc_window_length=0.100|mfcc_window_length_l1=0.100|mfcc_window_length_l2=0.050|mfcc_window_length_l3=0.020|mfcc_window_shift=0.040|mfcc_window_shift_l1=0.040|mfcc_window_shift_l2=0.020|mfcc_window_shift_l3=0.005|safety_checks=True|task_max_audio_length=0|task_max_text_length=0|tts=espeak|tts_api_retry_attempts=5|tts_api_sleep=1.000|tts_cache=False|tts_l1=espeak|tts_l2=espeak|tts_l3=espeak|vad_extend_speech_after=0.000|vad_extend_speech_before=0.000|vad_log_energy_threshold=0.699|vad_min_nonspeech_length=0.200'
        config_string = "aba_no_zero_duration=0.001|aba_nonspeech_tolerance=0.080|allow_unlisted_languages=False|c_extensions=True|cdtw=True|cew=True|cew_subprocess_enabled=False|cew_subprocess_path=python|cfw=True|cmfcc=True|downloader_retry_attempts=5|downloader_sleep=1.000|dtw_algorithm=stripe|dtw_margin=120.000|dtw_margin_l1=120.000|dtw_margin_l2=60.000|dtw_margin_l3=20.000|task_language={}|is_text_type=unparsed|os_task_file_format=smil|os_task_file_smil_audio_ref={}|os_task_file_smil_page_ref={}".format(
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

        aeneasLogger = AeneasLogger()

        # Execute Task to output path
        ExecuteTask(task, logger=aeneasLogger).execute()
        task.output_sync_map_file()
        # Write Verbose Logs to temp file
        task.logger.write('./public/uploads/temp/logs/{}.log'.format(text_files[i].split('.')[0]))
        # Append temp log to main log file
        with open('./public/uploads/temp/logs/{}.log'.format(text_files[i].split('.')[0]), 'r', encoding='utf8') as temp_log_file:
            with open(logger.log_file, 'a', encoding='utf8') as log_file:
                log_file.write('Verbose DEBUG Logs for {}:\n'.format(text_files[i]))
                for line in temp_log_file:
                    log_file.write('\t' + line)
                log_file.write('\n\n')
        # Delete temp log file
        os.remove('./public/uploads/temp/logs/{}.log'.format(text_files[i].split('.')[0]))