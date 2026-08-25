from django.apps import AppConfig

class AcademicConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "Apps.Academic"
    label = "Academic"

    def ready(self):
        try:
            from .cache_utils import register_cache_signals
            register_cache_signals()
        except Exception:
            pass

