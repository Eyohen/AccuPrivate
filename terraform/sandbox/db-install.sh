#!/bin/bash

# Step 1: Install aws-cli
sudo apt-get update
sudo apt-get install -y awscli

# Step 2: Pull .env file from S3 bucket to the home directory
aws s3 cp s3://db-bucket-configuration/.env ~/.env

# Step 3: Install PostgreSQL and configure using .env
sudo apt-get install -y postgresql

# Read database credentials from .env file
DB_USERNAME=$(grep DB_USERNAME ~/.env | cut -d '=' -f2)
DB_PASSWORD=$(grep DB_PASSWORD ~/.env | cut -d '=' -f2)
DB_NAME=$(grep DB_NAME ~/.env | cut -d '=' -f2)

# Create PostgreSQL user and database
sudo -u postgres psql -c "CREATE USER $DB_USERNAME WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME WITH OWNER $DB_USERNAME;"

# Restart PostgreSQL for changes to take effect
sudo service postgresql restart

echo "Installation and configuration completed successfully."
