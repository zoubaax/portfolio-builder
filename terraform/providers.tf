terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.52.0"
    }
    grafana = {
      source  = "grafana/grafana"
      version = "~> 3.18.0"
    }
  }

  # Recommended remote state backend (Uncomment when using HCP Terraform / Terraform Cloud)
  # cloud {
  #   organization = "your-organization"
  #   workspaces {
  #     name = "portfolify-production"
  #   }
  # }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "grafana" {
  url  = var.grafana_url
  auth = var.grafana_auth
}

