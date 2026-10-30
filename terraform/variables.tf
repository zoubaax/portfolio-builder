# ==============================================================================
# Cloudflare Infrastructure Variables
# ==============================================================================

variable "cloudflare_api_token" {
  description = "Cloudflare API Token with Zone:Edit, Workers:Edit, DNS:Edit permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID (found on the right sidebar of Cloudflare Dashboard)"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for portfolify.tech"
  type        = string
}

variable "domain_name" {
  description = "Root domain name for the platform"
  type        = string
  default     = "portfolify.tech"
}

variable "vercel_cname_target" {
  description = "Vercel CNAME DNS routing target"
  type        = string
  default     = "cname.vercel-dns.com"
}

variable "vercel_origin_host" {
  description = "Vercel production origin deployment hostname"
  type        = string
  default     = "portfoliobuilder-omega.vercel.app"
}

# ==============================================================================
# Grafana Cloud Variables
# ==============================================================================

variable "grafana_url" {
  description = "Grafana Cloud Instance URL (e.g. https://<your-org>.grafana.net)"
  type        = string
}

variable "grafana_auth" {
  description = "Grafana Cloud Service Account Token (with Admin / Editor role)"
  type        = string
  sensitive   = true
}

# ==============================================================================
# Neon PostgreSQL Datasource Variables (for AI Token Telemetry)
# ==============================================================================

variable "neon_host" {
  description = "Neon Postgres host endpoint (e.g. ep-xyz.eu-central-1.aws.neon.tech:5432)"
  type        = string
}

variable "neon_database" {
  description = "Neon Postgres database name"
  type        = string
  default     = "neondb"
}

variable "neon_user" {
  description = "Neon Postgres database user"
  type        = string
  default     = "neondb_owner"
}

variable "neon_password" {
  description = "Neon Postgres database password"
  type        = string
  sensitive   = true
}

