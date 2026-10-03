output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "ecs_backend_security_group_id" {
  value = aws_security_group.ecs_backend.id
}

output "ecs_storefront_security_group_id" {
  value = aws_security_group.ecs_storefront.id
}

output "rds_security_group_id" {
  value = aws_security_group.rds.id
}

output "redis_security_group_id" {
  value = aws_security_group.redis.id
}
