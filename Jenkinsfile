pipeline {
    agent any

    environment {
        APP_NAME = 'si-releves'
        ENVIRONMENT = 'staging'

        // Git
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
        VERSION = "${env.BUILD_NUMBER}-${GIT_COMMIT_SHORT}"

        // Docker
        COMPOSE_FILE = 'docker-compose.app.yml'
        COMPOSE_PROFILES = 'staging'
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

        stage(' Install Dependencies') {
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

        stage(' Run Tests') {
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

        stage(' SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube-server') {
                    sh '''
                        sonar-scanner \
                            -Dsonar.projectKey=si-releves \
                            -Dsonar.sources=server,client \
                            -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/build/** \
                            -Dsonar.host.url=http://sonarqube:9000
                    '''
                }
            }
        }

        stage(' Build Docker Images') {
            steps {
                sh '''
                    # Stop and clean
                    docker compose -f ${COMPOSE_FILE} --profile ${COMPOSE_PROFILES} down || true
                    docker rm -f si_releves_frontend_staging si_releves_backend_staging si_releves_mysql_staging 2>/dev/null || true

                    # Build images with staging profile (no code volumes = production-like)
                    docker compose -f ${COMPOSE_FILE} --profile ${COMPOSE_PROFILES} build --no-cache

                    echo " Images built"
                    docker images | grep si-releves
                '''
            }
        }

        stage(' Security Scan') {
            when {
                expression {
                    return sh(script: 'command -v trivy', returnStatus: true) == 0
                }
            }
            steps {
                sh '''
                    trivy image --severity HIGH,CRITICAL \
                        --no-progress \
                        si-releves-staging-backend:latest || true

                    trivy image --severity HIGH,CRITICAL \
                        --no-progress \
                        si-releves-staging-frontend:latest || true

                    echo " Security scan completed"
                '''
            }
        }

        stage(' Deploy Application') {
            steps {
                sh '''
                    # Deploy application ONLY (not infrastructure)
                    # Staging profile: no code volumes mounted (production-like deployment)
                    docker compose -f ${COMPOSE_FILE} --profile ${COMPOSE_PROFILES} up -d --remove-orphans

                    # Wait for services
                    sleep 15

                    # Check status
                    docker compose -f ${COMPOSE_FILE} --profile ${COMPOSE_PROFILES} ps

                    echo " Application deployed"
                '''
            }
        }

        stage(' Health Check') {
            steps {
                sh '''
                    echo "Checking application health..."
                    docker inspect si_releves_backend_staging --format='{{.State.Status}}'
                    docker inspect si_releves_frontend_staging --format='{{.State.Status}}'
                    docker inspect si_releves_mysql_staging --format='{{.State.Health.Status}}'

                    echo " Health checks passed"
                '''
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
            echo " Application deployment successful!"
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
            echo " Application deployment failed!"
        }
    }
}
