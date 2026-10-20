import os
import logging
import functools
from contextlib import contextmanager

# Global Tracer Instance Cache
_GLOBAL_TRACER = None

def get_tracer(name: str = "saastascholar"):
    """
    Returns A Cached OpenTelemetry Tracer Instance
    """
    global _GLOBAL_TRACER
    try:
        from opentelemetry import trace
        return trace.get_tracer(name)
    except Exception:
        return None


@contextmanager
def start_custom_span(span_name: str, attributes: dict = None):
    """
    Context Manager For Manual Span Instrumentation (SigNoz APM)
    Usage:
        with start_custom_span("process_payment", {"order.id": "ord_123"}) as span:
            # logic here
    """
    tracer = get_tracer("saastascholar")
    if not tracer:
        yield None
        return

    try:
        from opentelemetry.trace import Status, StatusCode
        with tracer.start_as_current_span(span_name) as span:
            if attributes and isinstance(attributes, dict):
                for k, v in attributes.items():
                    if v is not None:
                        span.set_attribute(str(k), v)
            try:
                yield span
                span.set_status(Status(StatusCode.OK))
            except Exception as ex:
                span.record_exception(ex)
                span.set_status(Status(StatusCode.ERROR, str(ex)))
                raise
    except Exception:
        yield None


def trace_function(span_name: str = None, default_attributes: dict = None):
    """
    Decorator For Manual Function Spans
    Usage:
        @trace_function("validate_razorpay_signature")
        def verify(...):
            ...
    """
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            name = span_name or f"{fn.__module__}.{fn.__name__}"
            with start_custom_span(name, default_attributes):
                return fn(*args, **kwargs)
        return wrapper
    return decorator


def send_startup_heartbeat():
    """
    Emits An Immediate Manual Span And Log Upon Backend Boot
    Guarantees Instant Service Visibility In SigNoz Workspace
    """
    try:
        with start_custom_span("saastascholar.service_online", {
            "service.status": "healthy",
            "service.tier": "academic_production",
            "runtime.engine": "django_gunicorn",
            "portal.domain": os.environ.get("VITE_SITE_DOMAIN", "saastascholar.durgaaisolutions.in"),
        }) as span:
            if span:
                span.add_event("application.boot_completed", {
                    "boot.message": "SaastaScholar Full-Stack Container Online And Streaming Telemetry To SigNoz."
                })
                print("-> [SigNoz APM] Startup Heartbeat Emitted To SigNoz Collector!")
    except Exception as exc:
        print(f"-> [SigNoz APM] Startup Heartbeat Notice: {exc}")


def setup_telemetry():
    """
    Automatic OpenTelemetry Instrumentation For SigNoz APM
    Streams Distributed Traces, Database Queries, Logs, And API Latencies
    """
    endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "").strip()
    if not endpoint:
        return

    service_name = os.environ.get("OTEL_SERVICE_NAME", "saastascholar-app")
    environment = os.environ.get("DEPLOYMENT_ENV", "production")

    # 1. Setup Traces Provider
    try:
        from opentelemetry import trace
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.instrumentation.django import DjangoInstrumentor
        from opentelemetry.instrumentation.psycopg2 import Psycopg2Instrumentor
        from opentelemetry.instrumentation.redis import RedisInstrumentor

        resource = Resource.create({
            "service.name": service_name,
            "deployment.environment": environment,
        })
        provider = TracerProvider(resource=resource)

        trace_endpoint = endpoint if endpoint.endswith("/v1/traces") else f"{endpoint.rstrip('/')}/v1/traces"
        exporter = OTLPSpanExporter(endpoint=trace_endpoint)
        provider.add_span_processor(BatchSpanProcessor(exporter))
        trace.set_tracer_provider(provider)

        # Instrument Django, PostgreSQL, and Redis
        DjangoInstrumentor().instrument()
        Psycopg2Instrumentor().instrument()
        RedisInstrumentor().instrument()
        print(f"-> [SigNoz APM] Tracing Connected: {trace_endpoint}")
    except Exception as exc:
        print(f"-> [SigNoz APM] Tracing Notice: {exc}")

    # 2. Setup Logs Provider (Streams Django And Python logs To SigNoz)
    try:
        from opentelemetry._logs import set_logger_provider
        from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
        from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
        from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter
        from opentelemetry.sdk.resources import Resource

        log_resource = Resource.create({
            "service.name": service_name,
            "deployment.environment": environment,
        })
        logger_provider = LoggerProvider(resource=log_resource)
        log_endpoint = endpoint if endpoint.endswith("/v1/logs") else f"{endpoint.rstrip('/')}/v1/logs"
        log_exporter = OTLPLogExporter(endpoint=log_endpoint)
        logger_provider.add_log_record_processor(BatchLogRecordProcessor(log_exporter))
        set_logger_provider(logger_provider)

        # Attach handler to root logger
        handler = LoggingHandler(level=logging.INFO, logger_provider=logger_provider)
        logging.getLogger().addHandler(handler)
        print(f"-> [SigNoz APM] Logging Connected: {log_endpoint}")
    except Exception as exc:
        print(f"-> [SigNoz APM] Logging Notice: {exc}")

    # 3. Emit Startup Heartbeat
    send_startup_heartbeat()
