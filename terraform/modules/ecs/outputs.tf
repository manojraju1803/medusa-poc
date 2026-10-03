output "cluster_id" {
  value       = aws_ecs_cluster.main.id
  description = "ECS cluster ID"
}

output "cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "ECS cluster name"
}

output "backend_service_name" {
  value       = aws_ecs_service.backend.name
  description = "Backend ECS service name"
}

output "storefront_service_name" {
  value       = var.enable_storefront ? aws_ecs_service.storefront[0].name : ""
  description = "Storefront ECS service name"
}

output "task_execution_role_arn" {
  value       = aws_iam_role.ecs_task_execution_role.arn
  description = "ECS task execution role ARN"
}

output "task_role_arn" {
  value       = aws_iam_role.ecs_task_role.arn
  description = "ECS task role ARN"
}
