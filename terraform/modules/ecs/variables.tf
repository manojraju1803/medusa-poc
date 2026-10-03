variable "project_name" {
  type        = string
  description = "Project name prefix"
}

variable "environment" {
  type        = string
  description = "Environment name (e.g. dev, staging, prod)"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "app_subnet_ids" {
  type        = list(string)
  description = "Subnet IDs for private app tier"
}

variable "backend_security_group_id" {
  type        = string
  description = "Security group ID for Backend ECS tasks"
}

variable "storefront_security_group_id" {
  type        = string
  description = "Security group ID for Storefront ECS tasks"
}

variable "backend_target_group_arn" {
  type        = string
  description = "ALB target group ARN for backend"
}

variable "storefront_target_group_arn" {
  type        = string
  description = "ALB target group ARN for storefront"
}

variable "backend_image" {
  type        = string
  description = "Docker image URI for Medusa backend"
  default     = "medusajs/medusa:latest"
}

variable "storefront_image" {
  type        = string
  description = "Docker image URI for Storefront"
  default     = "node:20-alpine"
}

variable "backend_cpu" {
  type        = number
  description = "CPU units for backend (e.g., 512 = 0.5 vCPU)"
  default     = 512
}

variable "backend_memory" {
  type        = number
  description = "Memory for backend in MB (e.g., 1024 = 1GB)"
  default     = 1024
}

variable "storefront_cpu" {
  type        = number
  description = "CPU units for storefront"
  default     = 256
}

variable "storefront_memory" {
  type        = number
  description = "Memory for storefront in MB"
  default     = 512
}

variable "backend_desired_count" {
  type        = number
  description = "Number of backend instances to run"
  default     = 1
}

variable "storefront_desired_count" {
  type        = number
  description = "Number of storefront instances to run"
  default     = 1
}

# Environment variables for Medusa Backend
variable "database_url" {
  type        = string
  description = "PostgreSQL connection string"
  sensitive   = true
}

variable "redis_url" {
  type        = string
  description = "Redis connection string"
}

variable "jwt_secret" {
  type        = string
  description = "JWT Secret for Medusa backend"
  sensitive   = true
}

variable "cookie_secret" {
  type        = string
  description = "Cookie Secret for Medusa backend"
  sensitive   = true
}

variable "store_cors" {
  type        = string
  description = "CORS origin for Store API"
  default     = ""
}

variable "admin_cors" {
  type        = string
  description = "CORS origin for Admin API"
  default     = ""
}

variable "auth_cors" {
  type        = string
  description = "CORS origin for Auth API"
  default     = ""
}

variable "s3_bucket_name" {
  type        = string
  description = "S3 bucket for media storage"
  default     = ""
}

variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "ap-south-1"
}

variable "enable_storefront" {
  type        = bool
  description = "Whether to create and run the storefront ECS service"
  default     = true
}
