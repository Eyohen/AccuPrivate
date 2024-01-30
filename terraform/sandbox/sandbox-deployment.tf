


#Variables 
variable "region" {
  description = "The AWS region"
  default     = "eu-west-2"
}

variable "access_key" {
  description = "The AWS access key"
  default     = ""
}

variable "secret_key" {
  description = "The AWS secret key"
  default     = ""
}

variable "subnet_1" {
  description = "The first subnet CIDR block"
  default     = "10.0.0.0/24"
}

variable "subnet_2" {
  description = "The second subnet CIDR block"
  default     = "10.0.1.0/24"
}

variable "subnet_3" {
  description = "The third subnet CIDR block"
  default     = "10.0.2.0/24"
}

variable "accountId" {
  description = "The AWS account ID"
  default     = "984109170193"
}

variable "image_id" {
  description = "The ID of the AMI to use for the instance"
  default     = ""
}

variable "instance_type" {
  description = "The EC2 instance type"
  default     = "t2.micro"
}

variable "kafka_instance_type" {
  description = "The Kafka instance type"
  default     = ""
}

variable "autoscaling_max_size" {
  description = "The maximum size of the auto-scaling group"
  default     = 1
}

variable "autoscaling_min_size" {
  description = "The minimum size of the auto-scaling group"
  default     = 1
}

variable "deployment_prefix" {
  description = "Prefix for resources deployed (e.g., sandbox)"
  default     = "sandbox"
}


variable "instance_keypair" {
  description = "The name of the key pair for the EC2 instance"
  default     = ""
}

variable "db_password" {
  description = "The password for the database"
  default     = ""
}

variable "db_user_name" {
  description = "The username for the database"
  default     = ""
}

variable "db_instance_type" {
  description = "The instance type for the database"
  default     = ""
}

variable "db_db_name" {
  description = "The name of the database"
  default     = ""
}




terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}


# Configure the AWS Provider
provider "aws" { 
   region = var.region
   access_key = var.access_key
   secret_key = "f3uFmzhHN1pM8tjz33DmBVXFhsODmf+kqo2bVCEJ"
}


# Networking Aspect on AWS 
# Create  vpc for the sandbox 
resource "aws_vpc" "sandbox_vpc" {
  cidr_block       = "10.0.0.0/16"
  instance_tenancy = "default"
  enable_dns_support = true
  enable_dns_hostnames = true
  
  tags = {
    Environment = "sandbox"
    Name = "sandbox_vpc"
  }
}

# creating one subnets in one az 
resource "aws_subnet" "sandbox_public_subnet_1" {
  vpc_id     = aws_vpc.sandbox_vpc.id
  cidr_block = var.subnet_1
  availability_zone = "eu-west-2a"
  map_public_ip_on_launch = true
  tags = {
    Environment = "sandbox"
    Name = "sandbox_public_subnet_1"
  }
}
# creating one subnets in one az 
resource "aws_subnet" "sandbox_public_subnet_2" {
  vpc_id     = aws_vpc.sandbox_vpc.id
  cidr_block =  var.subnet_2
  availability_zone = "eu-west-2b"
  map_public_ip_on_launch = true
  tags = {
    Environment = "sandbox"
    Name = "sandbox_public_subnet_1"
  }
}

# creating one subnets in one az 
resource "aws_subnet" "sandbox_public_subnet_3" {
  vpc_id     = aws_vpc.sandbox_vpc.id
  cidr_block =  var.subnet_3
  availability_zone = "eu-west-2c"
  map_public_ip_on_launch = true
  tags = {
    Environment = "sandbox"
    Name = "sandbox_public_subnet_1"
  }
}


#Creating internetgateway 

resource "aws_internet_gateway" "sandbox_internet_gateway" {
  vpc_id = aws_vpc.sandbox_vpc.id
  tags = {
    Environment = "sandbox"
    Name = "sandbox_internetgateway"
  }
}



#Create Route Table 

resource "aws_route_table" "sandbox_route_table" {
  vpc_id = aws_vpc.sandbox_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.sandbox_internet_gateway.id
  }

  route {
    ipv6_cidr_block        = "::/0"
    gateway_id = aws_internet_gateway.sandbox_internet_gateway.id
  }

  tags = {
    Environment = "sandbox"
    Name = "sandbox_route_table"
  }
}


# Assocate route table with subnet 1

resource "aws_route_table_association" "sandbox_public_subnet_1_routetable_assc" {
  subnet_id = aws_subnet.sandbox_public_subnet_1.id
  route_table_id = aws_route_table.sandbox_route_table.id
}


# Assocate route table with subnet 2

resource "aws_route_table_association" "sandbox_public_subnet_2_routetable_assc" {
  subnet_id = aws_subnet.sandbox_public_subnet_2.id
  route_table_id = aws_route_table.sandbox_route_table.id
}




# Assocate route table with subnet 3

resource "aws_route_table_association" "sandbox_public_subnet_3_routetable_assc" {
  subnet_id = aws_subnet.sandbox_public_subnet_3.id
  route_table_id = aws_route_table.sandbox_route_table.id
}



#create a security group for loadbalancer 

resource "aws_security_group" "sandbox_loadbalancer_security_group" {
  vpc_id = aws_vpc.sandbox_vpc.id
  
  ingress {
    from_port         = 443
    description = "HTTPS"
    protocol       = "tcp"
    to_port           = 443
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port         = 80
    description = "HTTP"
    protocol       = "tcp"
    to_port           = 80
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port         = 443
    description = "HTTPS"
    protocol       = "tcp"
    to_port           = 443
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port         = 80
    description = "HTTP"
    protocol       = "tcp"
    to_port           = 80
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

#create a security group for web server

resource "aws_security_group" "sandbox_webserver_security_group" {
  vpc_id = aws_vpc.sandbox_vpc.id
  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
  ingress {
    from_port         = 443
    description = "HTTPS"
    protocol       = "tcp"
    to_port           = 443
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port         = 22
    description = "SSH"
    protocol       = "tcp"
    to_port           = 22
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port         = 80
    description = "HTTP"
    protocol       = "tcp"
    to_port           = 80
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port         = 3000
    description = "HTTP"
    protocol       = "tcp"
    to_port           = 3000
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

}




#Creating a loadbalancer

resource "aws_lb" "sandbox_load_balancer" {
  name               = "sandbox-load-balance"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.sandbox_loadbalancer_security_group.id]
  subnets            = [aws_subnet.sandbox_public_subnet_1.id , aws_subnet.sandbox_public_subnet_2.id]

  # enable_deletion_protection = true

  # access_logs {
  #   bucket  = aws_s3_bucket.lb_logs.id
  #   prefix  = "sandbox-lb"
  #   enabled = true
  # }

  tags = {
    Environment = "sandbox"
    name = "sandbox_application_load_balancer"
  }
}

# loadnbalancer listeners

resource "aws_acm_certificate" "cert" {
  domain_name       = "*.accuvend.ng"
  validation_method = "DNS"

  tags = {
    Environment = "sandbox"
  }

  lifecycle {
    create_before_destroy = true
  }
}





resource "aws_lb_listener" "sandbox_application_load_balancer_listner_http" {
  load_balancer_arn = aws_lb.sandbox_load_balancer.arn
  port              = "80"
  protocol          = "HTTP"  

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.sandbox_target_group_http.arn
  }
}

# loadbalancer listener rule


resource "aws_lb_listener_rule" "host_based_weighted_routing-http" {
  listener_arn = aws_lb_listener.sandbox_application_load_balancer_listner_http.arn
  priority     = 1

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.sandbox_target_group_http.arn
  }

  condition {
    path_pattern {
      values = ["/"]
    }
  }
}



# Load Balancer target group

resource "aws_lb_target_group" "sandbox_target_group_http" {
    name     = "sandbox-target-group-http"
    port     = 80
    protocol = "HTTP"
    vpc_id   = aws_vpc.sandbox_vpc.id
    health_check {
      interval = 30
      healthy_threshold = 2
      unhealthy_threshold = 5
      path = "/"
      timeout = 8
    }
}




#IAM Policy for Kafka 
resource "aws_iam_policy" "sandbox_iam_kafka_policy" {
  depends_on = [ aws_msk_cluster.staging_aws_managed_kafka ]
  name = "sandbox-iam-kafka-policy"
  policy = jsonencode(
  {
    Version: "2012-10-17",
    Statement: [
        {
            Effect: "Allow",
            Action: [
                "kafka-cluster:Connect",
                "kafka-cluster:AlterCluster",
                "kafka-cluster:DescribeCluster"
            ],
            Resource: [
                "arn:aws:kafka:${var.region}:${var.accountId}:cluster/${aws_msk_cluster.staging_aws_managed_kafka.cluster_name}/*"
            ]
        },
        {
            Effect: "Allow",
            Action: [
                "kafka-cluster:*Topic*",
                "kafka-cluster:WriteData",
                "kafka-cluster:ReadData"
            ],
            Resource: [
                "arn:aws:kafka:${var.region}:${var.accountId}:topic/${aws_msk_cluster.staging_aws_managed_kafka.cluster_name}/*"
            ]
        },
        {
            Effect: "Allow",
            Action: [
                "kafka-cluster:AlterGroup",
                "kafka-cluster:DescribeGroup"
            ],
            Resource: [
                "arn:aws:kafka::${var.region}:${var.accountId}:group/${aws_msk_cluster.staging_aws_managed_kafka.cluster_name}/*"
            ]
        }
    ]
  })
  
  
}

#S3 Policy to update Deployment 
resource "aws_iam_policy" "sandbox_iam_S3_policy" {
 
  name = "sandbox-iam-kafka-policy"
  policy = jsonencode(
  {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [
          "s3:GetObject",
          "s3:ListBucket"
        ],
        Resource: [
          "arn:aws:s3:::*/*",
          "arn:aws:s3:::*"
        ]
      }
    ]
  })
  
  
}

# IAM Role for Kafka 

resource "aws_iam_role" "sandbox_iam_kafka_s3_role" {
  name = "sandbox_iam_kafka_s3_role"
  assume_role_policy = jsonencode({
      Version : "2012-10-17",
      Statement : [
        {
          Effect : "Allow",
          Principal : {
            Service : "ec2.amazonaws.com"
          },
          Action : "sts:AssumeRole"
        }
      ]
    })
      
}

#IAM KAFKA Role Policy attachment
resource "aws_iam_role_policy_attachment" "sandbox_role_kafka_policy_attachment" {
  role       = aws_iam_role.sandbox_iam_kafka_s3_role.name
  policy_arn = aws_iam_policy.sandbox_iam_kafka_policy.arn
}




#IAM S3 Role Policy attachment
resource "aws_iam_role_policy_attachment" "sandbox_role_S3_policy_attachment" {
  role       = aws_iam_role.sandbox_iam_kafka_s3_role.name
  policy_arn = aws_iam_policy.sandbox_iam_S3_policy.arn
}

#EC2 Update Creating the EC2 

resource "aws_iam_instance_profile" "sandbox_ec2_profile" {
  name = "sandbox-ec2-profile"
  role = aws_iam_role.sandbox_iam_kafka_s3_role.name
}



#Aws launch template

resource "aws_launch_template" "sandbox_launch_aws_launch_template" {
  
  name = "Sandbox-launch-template"
  description = "Sanbox-launch-template"
  image_id = var.image_id
  instance_type = var.instance_type
  iam_instance_profile {
    arn = aws_iam_instance_profile.sandbox_ec2_profile.arn
  }

  vpc_security_group_ids = [aws_security_group.sandbox_webserver_security_group.id]
  key_name = var.instance_keypair
  # user_data = filebase64("${path.module}/app1-install.sh")
  # ebs_optimized = true
  #default_version = 1
  update_default_version = true
  block_device_mappings {
    device_name = "/dev/sda1"
    ebs {
      volume_size = 10 
      #volume_size = 20 # LT Update Testing - Version 2 of LT      
      delete_on_termination = true
      volume_type = "gp2" # default is gp2
     }
  }
  monitoring {
    enabled = true
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "sandbox-launch-group"
    }
  }
}


#Creating an autoscaling group

resource "aws_autoscaling_group" "sandbox_auto_scaling_group" {
  depends_on = [ aws_launch_template.sandbox_launch_aws_launch_template ]
  max_size = 1
  min_size = 1
  desired_capacity = 1
  target_group_arns = [aws_lb_target_group.sandbox_target_group_http.arn]
  health_check_type = "ELB"
  vpc_zone_identifier = [
    aws_subnet.sandbox_public_subnet_1.id,
  ]
  name = "sandbox_autoscaling_group"
  launch_template {
    id = aws_launch_template.sandbox_launch_aws_launch_template.id
  }
  tag {
    key = "Name"
    value = "sandbox_autoscaling_group"
    propagate_at_launch = true
  }
}


#create a security group for loadbalancer 

resource "aws_security_group" "sandbox_kafka_security_group" {
  vpc_id = aws_vpc.sandbox_vpc.id
  
  ingress {
    from_port         = 9092
    description = "HTTPS"
    protocol       = "tcp"
    to_port           = 9092
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port         = 29092
    description = "HTTP"
    protocol       = "tcp"
    to_port           = 29092
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
  ingress {
    from_port         = 9999
    description = "HTTP"
    protocol       = "tcp"
    to_port           = 9999
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    ipv6_cidr_blocks = ["::/0"]
  }
}



#creating Managed kafka 

resource "aws_msk_cluster" "staging_aws_managed_kafka" {
  cluster_name = "staging-aws-managed-kafka-2"
  kafka_version = "3.5.1"
  number_of_broker_nodes = 3
  


  broker_node_group_info {
    instance_type = var.kafka_instance_type
    client_subnets = [
      aws_subnet.sandbox_public_subnet_1.id,
      aws_subnet.sandbox_public_subnet_2.id,
      aws_subnet.sandbox_public_subnet_3.id
    ]
     storage_info {
      ebs_storage_info {
        volume_size = 10
      }
    }
    security_groups = [aws_security_group.sandbox_kafka_security_group.id]
    connectivity_info {
      # public_access {
      #   type = "enabled"
      # }
      vpc_connectivity {
        client_authentication {
          sasl {
            iam = true
          }
        }
      }
    }
  }


}

# outputs 
output "broker_endpoints" {
  value       = staging_aws_managed_kafka.broker_endpoints
  description = "List of broker endpoints"
}

#
output "dns_name" {
  description = "The DNS name of the load balancer"
  value       = try(sandbox_load_balancer.this[0].dns_name, null)
}





# #  RDS For Testing Staging using free-tier 

# resource "aws_security_group" "sandbox_rds_security_group" {
#   vpc_id = aws_vpc.sandbox_vpc.id
  
#   ingress {
#     from_port         =  5432
#     description = "Allo postgres access"
#     protocol       = "tcp"
#     to_port           =  5432
#     cidr_blocks      = ["0.0.0.0/0"]
#     ipv6_cidr_blocks = ["::/0"]
#   }


#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     ipv6_cidr_blocks = ["::/0"]
#   }
# }

# #RDS subnet groups 

# resource "aws_db_subnet_group" "staging_db_subnet_group" {
#   name = "staging-db-subnet-group"
#   subnet_ids = [aws_subnet.sandbox_public_subnet_1.id, aws_subnet.sandbox_public_subnet_2.id]

#   tags = {
#     Name = "My DB Subnet Group"
#   }
# }

# # RDS
# resource "aws_db_instance" "staging_rds_service" {
#   allocated_storage    = 10
#   db_name              = var.db_db_name
#   engine               = "postgres"
#   engine_version       = "15.4"
#   instance_class       = var.db_instance_type
#   username             = var.db_user_name
#   password             = var.db_user_name
#   skip_final_snapshot  = true
#   publicly_accessible = true
#   db_subnet_group_name = aws_db_subnet_group.staging_db_subnet_group.name
#   vpc_security_group_ids = [aws_security_group.sandbox_rds_security_group.id]

# }





