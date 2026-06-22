// ============================================================
// Stationery Management System - Declarative Jenkins Pipeline
// ============================================================
// Prerequisites:
//   - Jenkins with Pipeline plugin
//   - Maven 3.9+ configured as 'Maven-3.9' in Global Tool Config
//   - JDK 17 configured as 'JDK-17' in Global Tool Config
//   - Node.js 18 configured as 'NodeJS-18' via NodeJS plugin
//   - Docker & Docker Compose installed on Jenkins agent
//   - Docker registry credentials stored as 'docker-registry-creds'
// ============================================================


//written in Groovy
//jenkins automatically reads this file when we push code.

//this is the root block of declarative jenkins pipeline. - everything inside defines entire CI/CD process.
pipeline {

    //run this pipeline on any available jenkins agent.
    agent any

    //tell which pre-configured tools we want to use in this pipeline. - maven, jdk, nodejs.
    tools {
        maven 'Maven-3.9'
        jdk 'JDK-17'
        nodejs 'NodeJS-18'
    }

    //Think of them like global constants for the pipeline. - we can use these variables in any stage or step.
    environment {
        IMAGE_TAG        = "${env.BUILD_NUMBER}"
        COMPOSE_PROJECT_NAME = 'sms'
        PATH             = "/usr/local/bin:${env.PATH}"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {

        // ──────────────────────────────────────────────────
        // Stage 1: Checkout Source Code
        // ──────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        // ──────────────────────────────────────────────────
        // Stage 2: Build All Backend Services (Parallel)
        // ──────────────────────────────────────────────────
        stage('Build Backend Services') {
            parallel {
                stage('Config Server') {
                    steps {
                        dir('config-server') {
                            echo 'Building Config Server...'
                            sh 'mvn clean package -DskipTests -B'
                        }
                    }
                }
                stage('Eureka Server') {
                    steps {
                        dir('eureka-server') {
                            echo 'Building Eureka Server...'
                            sh 'mvn clean package -DskipTests -B'
                        }
                    }
                }
                stage('API Gateway') {
                    steps {
                        dir('api-gateway') {
                            echo 'Building API Gateway...'
                            sh 'mvn clean package -DskipTests -B'
                        }
                    }
                }
                stage('Auth Service') {
                    steps {
                        dir('auth-service') {
                            echo 'Building Auth Service...'
                            sh 'mvn clean package -DskipTests -B'
                        }
                    }
                }
                stage('Inventory Service') {
                    steps {
                        dir('inventory-service') {
                            echo 'Building Inventory Service...'
                            sh 'mvn clean package -DskipTests -B'
                        }
                    }
                }
                stage('Request Service') {
                    steps {
                        dir('request-service') {
                            echo 'Building Request Service...'
                            sh 'mvn clean package -DskipTests -B'
                        }
                    }
                }
            }
        }

        // ──────────────────────────────────────────────────
        // Stage 3: Run Unit & Integration Tests (Parallel)
        // ──────────────────────────────────────────────────
        stage('Run Tests') {
            parallel {
                stage('Auth Service Tests') {
                    steps {
                        dir('auth-service') {
                            echo 'Running Auth Service tests...'
                            sh 'mvn test -B -Djacoco.skip=true'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'auth-service/target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('Inventory Service Tests') {
                    steps {
                        dir('inventory-service') {
                            echo 'Running Inventory Service tests...'
                            sh 'mvn test -B -Djacoco.skip=true'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'inventory-service/target/surefire-reports/*.xml'
                        }
                    }
                }
                stage('Request Service Tests') {
                    steps {
                        dir('request-service') {
                            echo 'Running Request Service tests...'
                            sh 'mvn test -B -Djacoco.skip=true'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'request-service/target/surefire-reports/*.xml'
                        }
                    }
                }
            }
        }

        // ──────────────────────────────────────────────────
        // Stage 4: Build React Frontend
        // ──────────────────────────────────────────────────
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    echo 'Installing frontend dependencies...'
                    sh 'npm ci'

                    echo 'Building frontend production bundle...'
                    sh 'npm run build'
                }
            }
        }

        // ──────────────────────────────────────────────────
        // Stage 5: Run Frontend Tests
        // ──────────────────────────────────────────────────
        stage('Frontend Tests') {
            steps {
                dir('frontend') {
                    echo 'Running frontend tests...'
                    sh 'npm test -- --watchAll=false --ci --passWithNoTests'
                }
            }
        }

        // ──────────────────────────────────────────────────
        // Stage 6: Build Docker Images (Parallel)
        // ──────────────────────────────────────────────────
        stage('Docker Build') {
            parallel {
                stage('Docker: Config Server') {
                    steps {
                        echo 'Building Config Server image...'
                        sh "docker build -t local/sms-config-server:${IMAGE_TAG} ./config-server"
                        sh "docker tag local/sms-config-server:${IMAGE_TAG} local/sms-config-server:latest"
                    }
                }
                stage('Docker: Eureka Server') {
                    steps {
                        echo 'Building Eureka Server image...'
                        sh "docker build -t local/sms-eureka-server:${IMAGE_TAG} ./eureka-server"
                        sh "docker tag local/sms-eureka-server:${IMAGE_TAG} local/sms-eureka-server:latest"
                    }
                }
                stage('Docker: API Gateway') {
                    steps {
                        echo 'Building API Gateway image...'
                        sh "docker build -t local/sms-api-gateway:${IMAGE_TAG} ./api-gateway"
                        sh "docker tag local/sms-api-gateway:${IMAGE_TAG} local/sms-api-gateway:latest"
                    }
                }
                stage('Docker: Auth Service') {
                    steps {
                        echo 'Building Auth Service image...'
                        sh "docker build -t local/sms-auth-service:${IMAGE_TAG} ./auth-service"
                        sh "docker tag local/sms-auth-service:${IMAGE_TAG} local/sms-auth-service:latest"
                    }
                }
                stage('Docker: Inventory Service') {
                    steps {
                        echo 'Building Inventory Service image...'
                        sh "docker build -t local/sms-inventory-service:${IMAGE_TAG} ./inventory-service"
                        sh "docker tag local/sms-inventory-service:${IMAGE_TAG} local/sms-inventory-service:latest"
                    }
                }
                stage('Docker: Request Service') {
                    steps {
                        echo 'Building Request Service image...'
                        sh "docker build -t local/sms-request-service:${IMAGE_TAG} ./request-service"
                        sh "docker tag local/sms-request-service:${IMAGE_TAG} local/sms-request-service:latest"
                    }
                }
                stage('Docker: Frontend') {
                    steps {
                        echo 'Building Frontend image...'
                        sh "docker build -t local/sms-frontend:${IMAGE_TAG} ./frontend"
                        sh "docker tag local/sms-frontend:${IMAGE_TAG} local/sms-frontend:latest"
                    }
                }
            }
        }

        // ──────────────────────────────────────────────────
        // Stage 7: Deploy with Docker Compose
        // ──────────────────────────────────────────────────
        stage('Deploy') {
            steps {
                echo 'Deploying Stationery Management System...'
                sh 'docker-compose down --remove-orphans'
                sh 'docker-compose up -d --build'

                echo 'Waiting for services to become healthy...'
                sh 'sleep 60'

                echo 'Verifying deployment...'
                sh 'docker-compose ps'
            }
        }
    }

    // ──────────────────────────────────────────────────────
    // Post-Build Actions
    // ──────────────────────────────────────────────────────
    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
        success {
            echo '========================================='
            echo ' Pipeline SUCCEEDED!'
            echo ' Build #${BUILD_NUMBER} deployed.'
            echo '========================================='
        }
        failure {
            echo '========================================='
            echo ' Pipeline FAILED!'
            echo ' Check logs for build #${BUILD_NUMBER}.'
            echo '========================================='
        }
        unstable {
            echo 'Pipeline completed with warnings. Review test results.'
        }
    }
}
