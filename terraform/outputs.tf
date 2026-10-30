# ==============================================================================
# Terraform Outputs
# ==============================================================================

output "cloudflare_worker_name" {
  description = "Name of the deployed Cloudflare Edge routing Worker"
  value       = cloudflare_workers_script.edge_router.name
}

output "root_domain" {
  description = "Apex production platform domain"
  value       = var.domain_name
}

output "wildcard_subdomain_pattern" {
  description = "Wildcard tenant subdomains routed by Cloudflare"
  value       = "*.${var.domain_name}"
}

output "grafana_dashboard_uid" {
  description = "Grafana AI Telemetry Dashboard UID"
  value       = grafana_dashboard.ai_analytics.uid
}

output "grafana_dashboard_url" {
  description = "Direct URL to the provisioned Grafana Dashboard"
  value       = "${var.grafana_url}/d/${grafana_dashboard.ai_analytics.uid}"
}
