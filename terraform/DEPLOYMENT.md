# Terraform Deployment Guide — Ingredients Bazar (Medusa v2)

This directory contains the production-ready Terraform Infrastructure as Code (IaC) configuration for deploying the Medusa DTC / B2B e-commerce backend and storefront onto AWS using containerized ECS Fargate, RDS PostgreSQL, ElastiCache Redis, ALB, S3, and ECR.

---

## 1. Architecture Overview

```mermaid
graph TD
    Client[Internet Users] -->|HTTP / HTTPS| ALB[AWS Application Load Balancer]
    
    subgraph VPC [AWS VPC - 10.0.0.0/16]
        subgraph PublicSubnets [Public Subnets]
            ALB
            NAT[NAT Gateway]
        end
        
        subgraph AppSubnets [Private App Subnets]
            ECS_BE["ECS Fargate: Medusa Backend (:9000)"]
            ECS_FE["ECS Fargate: Storefront (:8000)"]
        end
        
        subgraph DataSubnets [Private Data Subnets (Isolated)]
            RDS[("Amazon RDS PostgreSQL 15")]
            Redis[("Amazon ElastiCache Redis 7")]
        end
    end
    
    ALB -->|/app*, /admin*, /store*, /auth*, /health*| ECS_BE
    ALB -->|Default /| ECS_FE
    
    ECS_BE --> RDS
    ECS_BE --> Redis
    ECS_BE --> S3[Amazon S3: Media Bucket]
    
    ECR[Amazon ECR] -.->|Pull Image| ECS_BE
    ECR -.->|Pull Image| ECS_FE
```

---

## 2. Directory Structure

```text
terraform/
├── main.tf                    # Root orchestrator invoking all modules
├── variables.tf               # Root input variable declarations & defaults
├── outputs.tf                 # Exported endpoints, DNS URLs, and resource IDs
├── providers.tf               # AWS Provider and Terraform version constraints
├── terraform.tfvars.example   # Template variable values
├── backend.tf.example         # Remote S3 state backend configuration
└── modules/
    ├── vpc/                   # VPC, 3-tier subnets (Public, App, Data), IGW, NAT
    ├── security/              # Security groups with least privilege rules
    ├── alb/                   # Load balancer, target groups & routing rules
    ├── rds/                   # PostgreSQL 15 RDS instance & parameter groups
    ├── redis/                 # ElastiCache Redis cluster
    ├── s3/                    # S3 bucket for media asset uploads & CORS
    ├── ecr/                   # Container repositories for backend & storefront
    └── ecs/                   # ECS Fargate Cluster, Task Definitions, Roles & Services
```

---

## 3. Pre-Requisites

1. **AWS CLI v2** installed and authenticated:
   ```bash
   aws sts get-caller-identity
   ```
2. **Terraform CLI** (`>= 1.5.0`):
   ```bash
   terraform version
   ```
3. **Docker** installed and running locally for building images.

---

## 4. Step-by-Step Deployment Plan

### Phase 1: Initialize & Bootstrap Core Infrastructure & ECR

1. Navigate to the `terraform` directory:
   ```bash
   cd terraform
   ```

2. Create your `terraform.tfvars`:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
   *Edit `terraform.tfvars` and set a strong `db_password`, `jwt_secret`, and `cookie_secret`.*

3. Initialize Terraform:
   ```bash
   terraform init
   ```

4. First, apply up to ECR & Database foundation (or apply the whole plan):
   ```bash
   terraform plan -out=tfplan
   terraform apply tfplan
   ```

---

### Phase 2: Build and Push Docker Images to ECR

Once Terraform runs, get your ECR repository URLs:
```bash
terraform output ecr_backend_url
terraform output ecr_storefront_url
```

1. **Login to AWS ECR**:
   ```bash
   aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com
   ```

2. **Build and Tag Backend Image**:
   ```bash
   # From the project root
   docker build -t <ECR_BACKEND_URL>:latest -f Dockerfile .
   docker push <ECR_BACKEND_URL>:latest
   ```

3. **Force ECS Deployment** to pull the newly pushed images:
   ```bash
   aws ecs update-service --cluster ingredients-bazar-dev-cluster --service ingredients-bazar-dev-backend-svc --force-new-deployment --region ap-south-1
   ```

---

### Phase 3: Run Database Migrations & Initial Seed

You can run migrations against RDS through an ECS task execution or through a bastion host / VPN session:

```bash
# Execute migration from within a running task or local container connected to VPC
pnpm exec medusa db:migrate
pnpm exec medusa user -e admin@ingredientsbazar.com -p StrongAdminPass123!
pnpm run backend:seed
```

---

## 5. Verification & Endpoints

Run:
```bash
terraform output
```

Output includes:
- **`storefront_url`**: `http://<alb-dns-name>`
- **`medusa_admin_url`**: `http://<alb-dns-name>/app`
- **`medusa_api_url`**: `http://<alb-dns-name>/store`
- **`rds_endpoint`**: Private endpoint for PostgreSQL database
- **`redis_host`**: Private endpoint for Redis cache

---

## 6. Cleanup / Teardown

To destroy the provisioned infrastructure when testing is complete:
```bash
terraform destroy
```
