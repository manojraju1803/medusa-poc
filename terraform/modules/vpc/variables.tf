variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "environment" {
  type        = string
  description = "Environment (staging, prod)"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for public subnets"
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "app_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for private app subnets"
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "data_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for private database subnets"
  default     = ["10.0.100.0/24", "10.0.200.0/24"]
}

variable "availability_zones" {
  type        = list(string)
  description = "Availability zones to deploy subnets in"
  default     = ["ap-south-1a", "ap-south-1b"]
}
