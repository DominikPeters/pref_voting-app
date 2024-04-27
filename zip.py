import os
import zipfile

def zip_folder(folder_path, output_path):
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                zipf.write(file_path, os.path.relpath(file_path, folder_path))

# Set the paths
folder_to_compress = "pref_voting/pref_voting"
output_zip = "pref_voting.zip"

# Compress the folder
zip_folder(folder_to_compress, output_zip)

print(f"Folder '{folder_to_compress}' has been compressed and saved as '{output_zip}'.")