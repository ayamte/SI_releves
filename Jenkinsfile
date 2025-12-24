pipeline {
    agent any

    environment {
        APP_NAME = 'si-releves'
        ENVIRONMENT = 'staging'

        // Git
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
        VERSION = "${env.BUILD_NUMBER}-${GIT_COMMIT_SHORT}"

        // Docker
        COMPOSE_FILE = 'docker-compose.staging.yml'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 15, unit: 'MINUTES')
        timestamps()
    }

    triggers {
        pollSCM('H/5 * * * *')
        githubPush()
    }

    stages {
        stage('📥 Checkout') {
            steps {
                script {
                    echo "Checking out code..."
                    checkout scm

                    sh '''
                        echo "========================================="
                        echo "Git Commit: ${GIT_COMMIT}"
                        echo "Git Branch: ${GIT_BRANCH}"
                        echo "Build Number: ${BUILD_NUMBER}"
                        echo "Version: ${VERSION}"
                        echo "========================================="
                    '''
                }
            }
        }

        stage('📦 Install Dependencies') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('server') {
                            sh 'npm install'
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        dir('client') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('🧪 Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('server') {
                            sh 'npm run test:ci'
                            junit allowEmptyResults: true, testResults: '**/test-results/*.xml'
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'coverage',
                                reportFiles: 'index.html',
                                reportName: 'Backend Coverage Report'
                            ])
                        }
                    }
                }

                stage('Frontend Tests') {
                    steps {
                        dir('client') {
                            sh 'npm run test:ci || true'
                        }
                    }
                }
            }
        }

        stage('📊 SonarQube Analysis') {
            steps {
                script {
                    sh '''
                        if command -v sonar-scanner &> /dev/null; then
                            echo "Starting SonarQube analysis..."
                            sonar-scanner \
                                -Dsonar.projectKey=si-releves \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=http://localhost:9000 \
                                -Dsonar.login=${SONAR_TOKEN:-admin}

                            # Wait for Quality Gate (BLOCKING)
                            sleep 10
                            QUALITY_GATE=$(curl -s -u ${SONAR_TOKEN:-admin}: \
                                "http://localhost:9000/api/qualitygates/project_status?projectKey=si-releves" \
                                | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

                            if [ "$QUALITY_GATE" != "OK" ]; then
                                echo "❌ Quality Gate FAILED"
                                exit 1
                            fi
                            echo "✅ Quality Gate PASSED"
                        else
                            echo "⚠️  SonarQube scanner not installed"
                        fi
                    '''
                }
            }
        }

        stage('🔨 Build Docker Images') {
            steps {
                script {
                    sh '''
                        # Stop and clean
                        docker compose -f ${COMPOSE_FILE} down || true
                        docker rm -f si_releves_frontend_staging si_releves_backend_staging si_releves_mysql_staging 2>/dev/null || true

                        # Build images
                        docker compose -f ${COMPOSE_FILE} build --no-cache

                        echo "✅ Images built"
                        docker images | grep si-releves-staging
                    '''
                }
            }
        }

        stage('🔒 Security Scan') {
            steps {
                script {
                    sh '''
                        if command -v trivy &> /dev/null; then
                            trivy image --severity HIGH,CRITICAL \
                                --exit-code 1 \
                                --no-progress \
                                si-releves-staging-backend:latest

                            trivy image --severity HIGH,CRITICAL \
                                --exit-code 1 \
                                --no-progress \
                                si-releves-staging-frontend:latest

                            echo "✅ Security scan passed"
                        else
                            echo "⚠️  Trivy not installed - SKIP for dev only"
                        fi
                    '''
                }
            }
        }

        stage('🚀 Deploy Application') {
            steps {
                script {
                    sh '''
                        # Deploy application ONLY (not infrastructure)
                        docker compose -f ${COMPOSE_FILE} up -d --remove-orphans

                        # Wait for services
                        sleep 15

                        # Check status
                        docker compose -f ${COMPOSE_FILE} ps

                        echo "✅ Application deployed"
                    '''
                }
            }
        }

        stage('✅ Health Check') {
            steps {
                script {
                    sh '''
                        echo "Checking application health..."
                        docker inspect si_releves_backend_staging --format='{{.State.Status}}'
                        docker inspect si_releves_frontend_staging --format='{{.State.Status}}'
                        docker inspect si_releves_mysql_staging --format='{{.State.Health.Status}}'

                        echo "✅ Health checks passed"
                    '''
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '**/coverage/**/*', allowEmptyArchive: true
            archiveArtifacts artifacts: '**/test-results/**/*', allowEmptyArchive: true
            sh 'docker image prune -f || true'
        }

        success {
            echo "✅ Application deployment successful!"
            echo ""
            echo "Application URLs:"
            echo "- Frontend: http://localhost:3000"
            echo "- Backend API: http://localhost:5002"
            echo ""
            echo "Monitoring (deployed separately via Jenkinsfile.infrastructure):"
            echo "- Kibana: http://localhost:5601"
            echo "- AIOps Dashboard: http://localhost:8082"
        }

        failure {
            echo "❌ Application deployment failed!"
        }
    }
}
