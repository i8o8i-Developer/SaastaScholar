#!/usr/bin/env python
"""Django's Command-Line Utility For Administrative Tasks."""
import os
import sys

def main():
    """Run Administrative Tasks."""
    import os, sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Core.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't Import Django. Are You Sure It's Installed And "
            "Available On Your PYTHONPATH Environment Variable? Did You "
            "Forget To Activate A Virtual Environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
