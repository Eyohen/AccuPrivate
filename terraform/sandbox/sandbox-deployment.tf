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
  description = "The second subnet CIDR block"
  default     = "10.0.1.0/24"
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
  default     = "*******"
}

variable "image_id" {
  description = "The ID of the AMI to use for the instance"
  default     = ""
}

variable "instance_keypair" {
  description = "The name of the key pair for the EC2 instance"
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


# variable "db_password" {
#   description = "The password for the database"
#   default     = ""
# }

# variable "db_user_name" {
#   description = "The username for the database"
#   default     = ""
# }

# variable "db_instance_type" {
#   description = "The instance type for the database"
#   default     = ""
# }

# variable "db_db_name" {
#   description = "The name of the database"
#   default     = ""
# }


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
  secret_key = var.secret_key
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
    Name = "sandbox_public_subnet_2"
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
    Name = "sandbox_public_subnet_3"
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


# database security group

resource "aws_security_group" "sandbox_db_security_group" {
  vpc_id = aws_vpc.sandbox_vpc.id
  
  ingress {
    from_port         =  5432
    description = "Allow postgres access"
    protocol       = "tcp"
    to_port           =  5432
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port         =  22
    description = "Allow SSH access"
    protocol       = "tcp"
    to_port           = 22
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

# Core Engine Insatnce

resource "aws_instance" "sandbox-core-engine" {
  instance_type = var.instance_type
  depends_on = [ aws_msk_cluster.sandbox_aws_managed_kafka , aws_instance.sandbox-db ]
  subnet_id = aws_subnet.sandbox_public_subnet_1
  ami = var.image_id
  key_name = var.instance_keypair
  iam_instance_profile = aws_iam_instance_profile.sandbox_ec2_profile.arn
  user_data = filebase64("${path.module}/app-install.sh")
  tags ={
    Name : "Sandbox-core-engine"
  }
  ebs_block_device {
    device_name = "/dev/sda1"
    volume_size = 10 
    delete_on_termination = true
    volume_type = "gp2" # default is gp2
  }
}


# Database Instance 

resource "aws_instance" "sandbox-db" {
  instance_type = var.instance_type
  subnet_id = aws_subnet.sandbox_public_subnet_1
  ami = var.image_id
  iam_instance_profile = aws_iam_instance_profile.sandbox_ec2_profile.arn
  user_data = filebase64("${path.module}/db-install.sh")
  key_name = var.instance_keypair
  tags ={
    Name : "Sandbox-db"
  }
  ebs_block_device {
    device_name = "/dev/sda1"
    volume_size = 10 
    delete_on_termination = true
    volume_type = "gp2" # default is gp2
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

resource "aws_lb_target_group_attachment" "name" {
  target_group_arn = aws_lb_target_group.sandbox_target_group_http.arn
  target_id = aws_instance.sandbox-core-engine.id
  port = 80
}



#IAM Policy for Kafka 
resource "aws_iam_policy" "sandbox_iam_kafka_policy" {
  depends_on = [ aws_msk_cluster.sandbox_aws_managed_kafka ]
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
                "arn:aws:kafka:${var.region}:${var.accountId}:cluster/${aws_msk_cluster.sandbox_aws_managed_kafka.cluster_name}/*"
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
                "arn:aws:kafka:${var.region}:${var.accountId}:topic/${aws_msk_cluster.sandbox_aws_managed_kafka.cluster_name}/*"
            ]
        },
        {
            Effect: "Allow",
            Action: [
                "kafka-cluster:AlterGroup",
                "kafka-cluster:DescribeGroup"
            ],
            Resource: [
                "arn:aws:kafka::${var.region}:${var.accountId}:group/${aws_msk_cluster.sandbox_aws_managed_kafka.cluster_name}/*"
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





#create a security kafka for loadbalancer 

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

resource "aws_msk_cluster" "sandbox_aws_managed_kafka" {
  cluster_name = "sandbox-aws-managed-kafka-2"
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
  value       = aws_msk_cluster.sandbox_aws_managed_kafka.broker_endpoints
  description = "List of broker endpoints"
}

#
output "dns_name" {
  description = "The DNS name of the load balancer"
  value       = try(aws_lb.sandbox_load_balancer.dns_name, null)
}

# output "server"
