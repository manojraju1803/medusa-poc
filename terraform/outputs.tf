# Networking
output "vpc_id" {
  value       = module.vpc.vpc_id
  description = "The ID of the VPC"
}

# Load Balancer & Access URLs
output "alb_dns_name" {
  value       = module.alb.alb_dns_name
  description = "DNS endpoint of the Application Load Balancer"
}

output "storefront_url" {
  value       = "http://${module.alb.alb_dns_name}"
  description = "Public URL for Storefront"
}

output "medusa_admin_url" {
  value       = "http://${module.alb.alb_dns_name}/app"
  description = "Public URL for Medusa Admin Dashboard"
}

output "medusa_api_url" {
  value       = "http://${module.alb.alb_dns_name}/store"
  description = "Public URL for Medusa Store API"
}

# Database & Cache (Endpoints)
output "rds_endpoint" {
  value       = module.rds.db_endpoint
  description = "RDS PostgreSQL endpoint"
}

output "redis_host" {
  value       = module.redis.redis_host
  description = "ElastiCache Redis Host"
}

# Storage
output "s3_bucket_name" {
  value       = module.s3.bucket_id
  description = "S3 bucket for media assets"
}

# ECR Repositories
output "ecr_backend_url" {
  value       = module.ecr.backend_repository_url
  description = "ECR Repository URL for Medusa backend"
}

output "ecr_storefront_url" {
  value       = module.ecr.storefront_repository_url
  description = "ECR Repository URL for Storefront"
}

# ECS Cluster & Services
output "ecs_cluster_name" {
  value       = module.ecs.cluster_name
  description = "ECS Cluster Name"
}

output "backend_service_name" {
  value       = module.ecs.backend_service_name
  description = "ECS Backend Service Name"
}
