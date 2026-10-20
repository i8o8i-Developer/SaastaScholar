import os

def setup_telemetry():
    """
    Automatic OpenTelemetry Instrumentation For SigNoz APM
    Streams Distributed Traces, Database Queries, And API Latencies
    """
    endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "").strip()
    if not endpoint:
        return

    try:
        from opentelemetry import trace
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.instrumentation.django import DjangoInstrumentor
        from opentelemetry.instrumentation.psycopg2 import Psycopg2Instrumentor
        from opentelemetry.instrumentation.redis import RedisInstrumentor

        service_name = os.environ.get("OTEL_SERVICE_NAME", "saastascholar-app")
        resource = Resource.create({
            "service.name": service_name,
            "deployment.environment": os.environ.get("DEPLOYMENT_ENV", "production"),
        })
        provider = TracerProvider(resource=resource)

        trace_endpoint = endpoint if endpoint.endswith("/v1/traces") else f"{endpoint.rstrip('/')}/v1/traces"
        exporter = OTLPSpanExporter(endpoint=trace_endpoint)
        provider.add_span_processor(BatchSpanProcessor(exporter))
        trace.set_tracer_provider(provider)

        # Instrument Core Services
        DjangoInstrumentor().instrument()
        Psycopg2Instrumentor().instrument()
        RedisInstrumentor().instrument()
        print(f"-> [SigNoz APM] Telemetry Successfully Connected: {trace_endpoint}")
    except Exception as exc:
        # Graceful Fallback If OpenTelemetry Libraries Are Not Yet Installed
        print(f"-> [SigNoz APM] Optional Instrumentation Notice: {exc}")
