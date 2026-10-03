# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
}

# IAM Role: ECS Task Execution Role (Allows pulling from ECR & pushing logs to CloudWatch)
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.project_name}-${var.environment}-ecs-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-exec-role"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Role: ECS Task Role (Runtime permissions for the container e.g. S3 access)
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.project_name}-${var.environment}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-task-role"
  }
}

# S3 Access Policy for Medusa Media Storage
resource "aws_iam_policy" "ecs_s3_policy" {
  name        = "${var.project_name}-${var.environment}-ecs-s3-policy"
  description = "Allows Medusa ECS tasks to upload and manage assets in S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${var.s3_bucket_name}",
          "arn:aws:s3:::${var.s3_bucket_name}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_s3_policy_attachment" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_s3_policy.arn
}

# CloudWatch Logs
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}-${var.environment}-backend"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-backend-logs"
  }
}

resource "aws_cloudwatch_log_group" "storefront" {
  count             = var.enable_storefront ? 1 : 0
  name              = "/ecs/${var.project_name}-${var.environment}-storefront"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-storefront-logs"
  }
}

# Task Definition: Backend
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-${var.environment}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = tostring(var.backend_cpu)
  memory                   = tostring(var.backend_memory)
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "medusa-backend"
      image     = var.backend_image
      essential = true
      portMappings = [
        {
          containerPort = 9000
          hostPort      = 9000
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "9000" },
        { name = "DATABASE_URL", value = var.database_url },
        { name = "REDIS_URL", value = var.redis_url },
        { name = "JWT_SECRET", value = var.jwt_secret },
        { name = "COOKIE_SECRET", value = var.cookie_secret },
        { name = "STORE_CORS", value = var.store_cors },
        { name = "ADMIN_CORS", value = var.admin_cors },
        { name = "AUTH_CORS", value = var.auth_cors },
        { name = "S3_BUCKET", value = var.s3_bucket_name },
        { name = "S3_REGION", value = var.aws_region }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])

  tags = {
    Name = "${var.project_name}-${var.environment}-backend-task"
  }
}

# ECS Service: Backend
resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-${var.environment}-backend-svc"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.app_subnet_ids
    security_groups  = [var.backend_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.backend_target_group_arn
    container_name   = "medusa-backend"
    container_port   = 9000
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-backend-svc"
  }
}

# Task Definition: Storefront (Optional)
resource "aws_ecs_task_definition" "storefront" {
  count                    = var.enable_storefront ? 1 : 0
  family                   = "${var.project_name}-${var.environment}-storefront"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = tostring(var.storefront_cpu)
  memory                   = tostring(var.storefront_memory)
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "storefront"
      image     = var.storefront_image
      essential = true
      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "8000" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.storefront[0].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "storefront"
        }
      }
    }
  ])

  tags = {
    Name = "${var.project_name}-${var.environment}-storefront-task"
  }
}

# ECS Service: Storefront (Optional)
resource "aws_ecs_service" "storefront" {
  count           = var.enable_storefront ? 1 : 0
  name            = "${var.project_name}-${var.environment}-storefront-svc"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.storefront[0].arn
  desired_count   = var.storefront_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.app_subnet_ids
    security_groups  = [var.storefront_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.storefront_target_group_arn
    container_name   = "storefront"
    container_port   = 8000
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-storefront-svc"
  }
}
