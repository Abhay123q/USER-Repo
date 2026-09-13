CREATE DATABASE IF NOT EXISTS user_management_db;
USE user_management_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  city VARCHAR(50),
  state VARCHAR(50),
  country VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('sent', 'failed') DEFAULT 'sent',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Data
INSERT INTO users (first_name, last_name, email, phone, city, state, country) VALUES
('Rahul', 'Sharma', 'rahul.s@example.com', '+91 9876543210', 'Mumbai', 'Maharashtra', 'India'),
('Priya', 'Patel', 'priya.p@example.com', '+91 9876543211', 'New Delhi', 'Delhi', 'India'),
('Amit', 'Singh', 'amit.s@example.com', '+91 9876543212', 'Bangalore', 'Karnataka', 'India'),
('Neha', 'Gupta', 'neha.g@example.com', '+91 9876543213', 'Chennai', 'Tamil Nadu', 'India'),
('Sanjay', 'Kumar', 'sanjay.k@example.com', '+91 9876543214', 'Hyderabad', 'Telangana', 'India'),
('Anjali', 'Desai', 'anjali.d@example.com', '+91 9876543215', 'Pune', 'Maharashtra', 'India'),
('Vikram', 'Rao', 'vikram.r@example.com', '+91 9876543216', 'Kolkata', 'West Bengal', 'India'),
('Meera', 'Reddy', 'meera.r@example.com', '+91 9876543217', 'Jaipur', 'Rajasthan', 'India'),
('Karan', 'Mehta', 'karan.m@example.com', '+91 9876543218', 'Ahmedabad', 'Gujarat', 'India'),
('Priya', 'Jha', 'priya@gmail.com', '+91 7656787905', 'Ranchi', 'Jharkhand', 'India'),
('Abhay', 'Kumar', 'abhaykumar4771@gmail.com', '+91 9876543219', 'Ranchi', 'Jharkhand', 'India'),
('John', 'Doe', 'john.doe@example.com', '+1 2125551234', 'New York City', 'New York', 'USA'),
('Jane', 'Smith', 'jane.smith@example.com', '+1 4155551234', 'San Francisco', 'California', 'USA'),
('Michael', 'Johnson', 'michael.j@example.com', '+1 3125551234', 'Chicago', 'Illinois', 'USA'),
('Emily', 'Brown', 'emily.b@example.com', '+44 7911123456', 'London', 'England', 'UK'),
('David', 'Wilson', 'david.w@example.com', '+1 2065551234', 'Seattle', 'Washington', 'USA'),
('Sarah', 'Davis', 'sarah.d@example.com', '+44 7922123456', 'Manchester', 'England', 'UK'),
('Sophie', 'Tremblay', 'sophie.t@example.com', '+1 4165552345', 'Toronto', 'Ontario', 'Canada'),
('Liam', 'Hemsworth', 'liam.h@example.com', '+61 412345678', 'Sydney', 'New South Wales', 'Australia');
