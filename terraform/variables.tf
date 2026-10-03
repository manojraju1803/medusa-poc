variable "aws_region" {
  type        = string
  description = "AWS region to deploy resources into"
  default     = "ap-south-1"
}

variable "project_name" {
  type        = string
  description = "Project name prefix for naming resources"
  default     = "ingredients-bazar"
}

variable "environment" {
  type        = string
  description = "Deployment environment (e.g. dev, staging, prod)"
  default     = "dev"
}

# Network Variables
variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR block"
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  type        = list(string)
  description = "List of Availability Zones"
  default     = ["ap-south-1a", "ap-south-1b"]
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for public subnets"
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "app_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for app subnets"
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "data_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for database subnets"
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

# Database Variables
variable "db_name" {
  type        = string
  description = "PostgreSQL database name"
  default     = "medusa"
}

variable "db_username" {
  type        = string
  description = "Master username for PostgreSQL"
  default     = "medusa_admin"
}

variable "db_password" {
  type        = string
  description = "Master password for PostgreSQL"
  sensitive   = true
}

variable "db_instance_class" {
  type        = string
  description = "RDS instance class"
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  type        = number
  description = "RDS allocated storage (GB)"
  default     = 20
}

variable "db_multi_az" {
  type        = bool
  description = "Enable Multi-AZ deployment for RDS"
  default     = false
}

# Redis Variables
variable "redis_node_type" {
  type        = string
  description = "ElastiCache Redis node type"
  default     = "cache.t4g.micro"
}

# Container Images & ECS Variables
variable "backend_image" {
  type        = string
  description = "Container image URI for Medusa backend (e.g. from ECR)"
  default     = ""
}

variable "storefront_image" {
  type        = string
  description = "Container image URI for Next.js storefront"
  default     = ""
}

variable "backend_cpu" {
  type        = number
  description = "CPU units for backend task (512 = 0.5 vCPU)"
  default     = 512
}

variable "backend_memory" {
  type        = number
  description = "Memory for backend task in MB"
  default     = 1024
}

variable "storefront_cpu" {
  type        = number
  description = "CPU units for storefront task"
  default     = 256
}

variable "storefront_memory" {
  type        = number
  description = "Memory for storefront task in MB"
  default     = 512
}

variable "backend_desired_count" {
  type        = number
  description = "Desired number of backend tasks"
  default     = 1
}

variable "storefront_desired_count" {
  type        = number
  description = "Desired number of storefront tasks"
  default     = 1
}

variable "enable_storefront" {
  type        = bool
  description = "Whether to provision and run the storefront ECS service"
  default     = true
}

# Medusa Application Secrets
variable "jwt_secret" {
  type        = string
  description = "Medusa JWT secret key"
  sensitive   = true
}

variable "cookie_secret" {
  type        = string
  description = "Medusa cookie secret key"
  sensitive   = true
}

variable "store_cors" {
  type        = string
  description = "Allowed origins for Medusa Store API (e.g., http://localhost:8000 or custom domain)"
  default     = "*"
}

variable "admin_cors" {
  type        = string
  description = "Allowed origins for Medusa Admin API"
  default     = "*"
}

variable "auth_cors" {
  type        = string
  description = "Allowed origins for Medusa Auth API"
  default     = "*"
}

# Vercel Configuration (Optional)
variable "deploy_storefront_to_vercel" {
  type        = bool
  description = "Whether to provision the storefront project on Vercel"
  default     = false
}

variable "vercel_api_token" {
  type        = string
  description = "Vercel API Token for provisioning the storefront project"
  default     = ""
  sensitive   = true
}

variable "git_repository" {
  type = object({
    type = string
    repo = string
  })
  description = "Git repo to link to Vercel (e.g. { type = \"github\", repo = \"org/repo\" })"
  default     = null
}

variable "medusa_publishable_key" {
  type        = string
  description = "Medusa publishable API key for Vercel storefront"
  default     = ""
}

