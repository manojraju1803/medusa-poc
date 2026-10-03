output "vpc_id" {
  value       = aws_vpc.main.id
  description = "The ID of the VPC"
}

output "public_subnet_ids" {
  value       = aws_subnet.public[*].id
  description = "IDs of the public subnets"
}

output "app_subnet_ids" {
  value       = aws_subnet.app[*].id
  description = "IDs of the private app subnets"
}

output "data_subnet_ids" {
  value       = aws_subnet.data[*].id
  description = "IDs of the private data subnets"
}
