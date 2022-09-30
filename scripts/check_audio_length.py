from mutagen.mp3 import MP3
from config import Config


def check_audio_length(mp3_max_minutes_length: int, foldername: str, location: str, audio_files: list):
    for audio_file in audio_files:
        audio_file_loc = f'./{Config.upload_folder}{foldername}/{location}{audio_file}'
        audio_info = MP3(audio_file_loc).info
        if audio_info.length > mp3_max_minutes_length * 60:
            raise Exception(
                f"""
                    Audio file {audio_file} is {audio_info.length / 60} minutes long, max allowed length is {mp3_max_minutes_length} minutes.\n
                    Please fix, refresh and try again.
                """)
