# ==============================================================================
# Grafana Cloud: Neon PostgreSQL Datasource (Direct Telemetry Connection)
# ==============================================================================

resource "grafana_data_source" "neon_postgres" {
  type     = "postgres"
  name     = "Neon PostgreSQL (Portfolify DB)"
  uid      = "portfolify-neon-postgres"
  url      = var.neon_host
  username = var.neon_user

  secure_json_data_encoded = jsonencode({
    password = var.neon_password
  })

  json_data_encoded = jsonencode({
    sslmode         = "require"
    database        = var.neon_database
    postgresVersion = 1600
    maxOpenConns    = 5
    maxIdleConns    = 2
    connMaxLifetime = 14400
  })
}

# ==============================================================================
# Grafana Cloud: AI Telemetry & Cost Dashboard
# ==============================================================================

resource "grafana_dashboard" "ai_analytics" {
  config_json = templatefile("${path.module}/dashboards/ai_analytics.json", {
    datasource_uid = grafana_data_source.neon_postgres.uid
  })

  depends_on = [
    grafana_data_source.neon_postgres
  ]
}
