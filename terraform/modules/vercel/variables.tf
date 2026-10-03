variable "project_name" {
  type        = string
  description = "Project name"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "storefront_root_dir" {
  type        = string
  description = "Root directory for the storefront app"
  default     = "apps/storefront"
}

variable "medusa_backend_url" {
  type        = string
  description = "URL of the Medusa backend (e.g. ALB DNS or custom domain)"
}

variable "medusa_publishable_key" {
  type        = string
  description = "Medusa publishable API key"
  default     = ""
}

variable "git_repository" {
  type = object({
    type = string
    repo = string
  })
  description = "Git repository link for continuous deployment (e.g. { type = \"github\", repo = \"org/repo\" })"
  default     = null
}
