CREATE TABLE IF NOT EXISTS Organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  pass VARCHAR(255) NOT NULL,
  organization_id INT NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES Organizations(id)
);

CREATE TABLE IF NOT EXISTS Repos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  repo_name VARCHAR(255) NOT NULL,
  organization_id INT NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES Organizations(id),
  CONSTRAINT unique_repo_name UNIQUE (organization_id, repo_name)
);

CREATE TABLE IF NOT EXISTS Branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_name VARCHAR(255) NOT NULL,
  is_primary BOOLEAN NOT NULL,
  repo_id INT NOT NULL,
  FOREIGN KEY (repo_id) REFERENCES Repos(id),
  CONSTRAINT unique_branch_name UNIQUE (repo_id, branch_name)
);

CREATE TABLE IF NOT EXISTS TestReports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  result_time DATETIME NOT NULL,
  duration DOUBLE NOT NULL,
  branch_id INT NOT NULL,
  FOREIGN KEY (branch_id) REFERENCES Branches(id)
);

CREATE TABLE IF NOT EXISTS TestSuites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  suite_name VARCHAR(255) NOT NULL,
  duration DOUBLE NOT NULL,
  total_tests INT NOT NULL,
  total_failures INT NOT NULL,
  total_errors INT NOT NULL,
  total_skipped INT NOT NULL,
  test_report_id INT NOT NULL,
  FOREIGN KEY (test_report_id) REFERENCES TestReports(id)
);

CREATE TABLE IF NOT EXISTS TestCases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_name VARCHAR(255) NOT NULL,
  class_name VARCHAR(255) NOT NULL,
  duration DOUBLE NOT NULL,
  result ENUM('success', 'failure', 'error', 'skipped') NOT NULL,
  failure_message VARCHAR(255),
  failure_type VARCHAR(255),
  stack_trace TEXT,
  test_suite_id INT NOT NULL,
  FOREIGN KEY (test_suite_id) REFERENCES TestSuites(id)
);

CREATE TABLE IF NOT EXISTS CoverageReports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  result_time DATETIME NOT NULL,
  branch_rate DOUBLE NOT NULL,
  line_rate DOUBLE NOT NULL,
  total_lines INT NOT NULL,
  valid_lines INT NOT NULL,
  complexity DOUBLE NOT NULL,
  branch_id INT NOT NULL,
  FOREIGN KEY (branch_id) REFERENCES Branches(id)
);

CREATE TABLE IF NOT EXISTS CoverageFiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  branch_rate DOUBLE NOT NULL,
  line_rate DOUBLE NOT NULL,
  complexity DOUBLE NOT NULL,
  coverage_report_id INT NOT NULL,
  FOREIGN KEY (coverage_report_id) REFERENCES CoverageReports(id)
);