from dataclasses import dataclass

@dataclass
class Config:
  userID: str
  upload_folder: str
  output_folder: str
  logs_folder: str
  folder_name: str
  final_name: str
