terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }
}

# Create Project in Vercel
resource "vercel_project" "storefront" {
  name           = "${var.project_name}-storefront"
  framework      = "nextjs"
  root_directory = var.storefront_root_dir

  dynamic "git_repository" {
    for_each = var.git_repository != null ? [var.git_repository] : []
    content {
      type = git_repository.value.type
      repo = git_repository.value.repo
    }
  }
}

# Environment Variable: Medusa Backend URL (Pointing to AWS ALB or Domain)
resource "vercel_project_environment_variable" "backend_url" {
  project_id = vercel_project.storefront.id
  key        = "MEDUSA_BACKEND_URL"
  value      = var.medusa_backend_url
  target     = ["production", "preview", "development"]
}

# Environment Variable: Publishable Key
resource "vercel_project_environment_variable" "publishable_key" {
  count      = var.medusa_publishable_key != "" ? 1 : 0
  project_id = vercel_project.storefront.id
  key        = "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"
  value      = var.medusa_publishable_key
  target     = ["production", "preview", "development"]
}
