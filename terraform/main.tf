# 1. Network: VPC, Subnets, Gateways, Route Tables
module "vpc" {
  source = "./modules/vpc"

  project_name         = var.project_name
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  app_subnet_cidrs     = var.app_subnet_cidrs
  data_subnet_cidrs    = var.data_subnet_cidrs
}

# 2. Security: Security Groups with Least Privilege
module "security" {
  source = "./modules/security"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
}

# 3. Application Load Balancer
module "alb" {
  source = "./modules/alb"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  security_group_id = module.security.alb_security_group_id
}

# 4. Relational Database (Amazon RDS PostgreSQL 15)
module "rds" {
  source = "./modules/rds"

  project_name      = var.project_name
  environment       = var.environment
  subnet_ids        = module.vpc.data_subnet_ids
  security_group_id = module.security.rds_security_group_id
  db_name           = var.db_name
  db_username       = var.db_username
  db_password       = var.db_password
  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  multi_az          = var.db_multi_az
}

# 5. Caching & Event Bus (Amazon ElastiCache Redis)
module "redis" {
  source = "./modules/redis"

  project_name      = var.project_name
  environment       = var.environment
  subnet_ids        = module.vpc.data_subnet_ids
  security_group_id = module.security.redis_security_group_id
  node_type         = var.redis_node_type
}

# 6. S3 Bucket for Media Uploads
module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
}

# 7. ECR Repositories for Docker Images
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

# 8. ECS Fargate Cluster & Services
module "ecs" {
  source = "./modules/ecs"

  project_name                 = var.project_name
  environment                  = var.environment
  aws_region                   = var.aws_region
  vpc_id                       = module.vpc.vpc_id
  app_subnet_ids               = module.vpc.app_subnet_ids
  backend_security_group_id    = module.security.ecs_backend_security_group_id
  storefront_security_group_id = module.security.ecs_storefront_security_group_id
  backend_target_group_arn     = module.alb.backend_target_group_arn
  storefront_target_group_arn  = module.alb.storefront_target_group_arn

  backend_image                = var.backend_image != "" ? var.backend_image : "${module.ecr.backend_repository_url}:latest"
  storefront_image             = var.storefront_image != "" ? var.storefront_image : "${module.ecr.storefront_repository_url}:latest"
  backend_cpu                  = var.backend_cpu
  backend_memory               = var.backend_memory
  storefront_cpu               = var.storefront_cpu
  storefront_memory            = var.storefront_memory
  backend_desired_count        = var.backend_desired_count
  storefront_desired_count     = var.storefront_desired_count
  enable_storefront            = var.enable_storefront

  database_url                 = module.rds.database_url
  redis_url                    = module.redis.redis_url
  jwt_secret                   = var.jwt_secret
  cookie_secret                = var.cookie_secret
  store_cors                   = var.store_cors
  admin_cors                   = var.admin_cors
  auth_cors                    = var.auth_cors
  s3_bucket_name               = module.s3.bucket_id
}

# 9. Storefront on Vercel (Optional)
module "vercel" {
  count  = var.deploy_storefront_to_vercel ? 1 : 0
  source = "./modules/vercel"

  project_name           = var.project_name
  environment            = var.environment
  medusa_backend_url     = "http://${module.alb.alb_dns_name}"
  medusa_publishable_key = var.medusa_publishable_key
  git_repository         = var.git_repository
}

