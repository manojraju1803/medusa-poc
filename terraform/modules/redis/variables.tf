variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "subnet_ids" {
  type        = list(string)
  description = "Isolated database subnet IDs"
}

variable "security_group_id" {
  type        = string
  description = "Redis Security Group ID"
}

variable "node_type" {
  type    = string
  default = "cache.t4g.micro"
}
