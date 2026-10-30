# ==============================================================================
# Cloudflare DNS Records (Multi-Tenant Routing to Vercel)
# ==============================================================================

# Root Domain CNAME (portfolify.tech -> Vercel)
resource "cloudflare_record" "root" {
  zone_id         = var.cloudflare_zone_id
  name            = "@"
  content         = var.vercel_cname_target
  type            = "CNAME"
  proxied         = true
  ttl             = 1 # Automatic when proxied
  allow_overwrite = true
}

# Wildcard Subdomain CNAME (*.portfolify.tech -> Vercel for tenant portfolios)
resource "cloudflare_record" "wildcard" {
  zone_id         = var.cloudflare_zone_id
  name            = "*"
  content         = var.vercel_cname_target
  type            = "CNAME"
  proxied         = true
  ttl             = 1
  allow_overwrite = true
}

# WWW Alias CNAME (www.portfolify.tech)
resource "cloudflare_record" "www" {
  zone_id         = var.cloudflare_zone_id
  name            = "www"
  content         = var.vercel_cname_target
  type            = "CNAME"
  proxied         = true
  ttl             = 1
  allow_overwrite = true
}

# ==============================================================================
# Cloudflare Worker (Portfolify Edge Dynamic Router & OpenGraph Injector)
# ==============================================================================

resource "cloudflare_workers_script" "edge_router" {
  account_id         = var.cloudflare_account_id
  name               = "portfolify-edge-router"
  content            = file("${path.module}/../cloudflare/worker.js")
  compatibility_date = "2024-09-23"
  module             = true
}

# Route: *.portfolify.tech/* (Tenant Subdomains)
resource "cloudflare_workers_route" "subdomain_route" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "*.${var.domain_name}/*"
  script_name = cloudflare_workers_script.edge_router.name
}

# Route: portfolify.tech/* (Apex Domain)
resource "cloudflare_workers_route" "root_route" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "${var.domain_name}/*"
  script_name = cloudflare_workers_script.edge_router.name
}

# ==============================================================================
# Edge Security, Modern Protocols & SSL/TLS Configuration
# ==============================================================================

resource "cloudflare_zone_settings_override" "security_settings" {
  zone_id = var.cloudflare_zone_id

  settings {
    ssl                      = "strict"
    always_use_https         = "on"
    min_tls_version          = "1.2"
    http3                    = "on"
    brotli                   = "on"
    websockets               = "on"
    opportunistic_encryption = "on"

    security_header {
      enabled            = true
      max_age            = 31536000
      include_subdomains = true
      nosniff            = true
    }
  }
}

# ==============================================================================
# Cloudflare Edge WAF Ruleset & Rate Limiting for AI Endpoints
# Stops Denial of Wallet and automated token draining at Cloudflare Edge
# ==============================================================================

resource "cloudflare_ruleset" "ai_endpoint_protection" {
  zone_id     = var.cloudflare_zone_id
  name        = "Portfolify AI Rate Limiting"
  description = "Protect Portfolify AI inference and image generation endpoints from abuse"
  kind        = "zone"
  phase       = "http_ratelimit"

  rules {
    action      = "block"
    description = "Block excessive AI inference requests exceeding 10 req/10s per IP"
    enabled     = true
    expression  = "(starts_with(http.request.uri.path, \"/api/v1/ai/\") and http.request.method eq \"POST\")"

    ratelimit {
      characteristics     = ["cf.colo.id", "ip.src"]
      period              = 10
      requests_per_period = 10
      mitigation_timeout  = 10
    }
  }
}
