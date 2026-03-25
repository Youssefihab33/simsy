from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.utils.deconstruct import deconstructible
import os

@deconstructible
class File_Rename(object):
    def __init__(self, sub_path):
        self.path = sub_path
    def __call__(self, instance, file_name):
        ext = file_name.split('.')[-1]
        # set filename as random string
        file_name = f'{instance.username}.{ext}'
        # return the whole path to the file
        return os.path.join(self.path, file_name)

class OverwriteStorage(FileSystemStorage):
    def get_available_name(self, username, max_length=None):
        if self.exists(username):
            os.remove(os.path.join(settings.MEDIA_ROOT, username))
        return username