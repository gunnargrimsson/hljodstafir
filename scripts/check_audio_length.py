from mutagen.mp3 import MP3


def check_audio_length(mp3_max_minutes_length: int, foldername: str, location: str, audio_files: list):
    for audio_file in audio_files:
        audio_file_loc = './public/uploads/{}/{}{}'.format(
            foldername, location, audio_file)
        audio_info = MP3(audio_file_loc).info
        if audio_info.length > mp3_max_minutes_length * 60:
            raise Exception(
                """
                    Audio file {} is {} minutes long, max allowed length is {} minutes.\n
                    Please fix, refresh and try again.
                """ .format(audio_file, audio_info.length / 60, mp3_max_minutes_length))
