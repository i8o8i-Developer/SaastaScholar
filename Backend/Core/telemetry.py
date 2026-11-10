import functools
from contextlib import contextmanager


def get_tracer(name: str = "saastascholar"):
    """No-op tracer stub (OpenTelemetry / SigNoz disabled)."""
    return None


@contextmanager
def start_custom_span(span_name: str, attributes: dict = None):
    """Lightweight no-op context manager (SigNoz APM removed)."""
    yield None


def trace_function(span_name: str = None, default_attributes: dict = None):
    """No-op decorator stub preserving function signatures."""
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def send_startup_heartbeat():
    """No-op stub (SigNoz APM removed)."""
    return


def setup_telemetry():
    """Telemetry / SigNoz APM disabled and removed."""
    return
