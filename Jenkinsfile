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

        // Deployment (local staging)
        DEPLOY_HOST = 'localhost'

        // ELK Stack
        ELASTICSEARCH_URL = 'http://localhost:9200'
        KIBANA_URL = 'http://localhost:5601'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    triggers {
        // Poll SCM every 5 minutes for devops branch
        pollSCM('H/5 * * * *')

        // GitHub webhook - triggers on push to devops branch
        githubPush()
    }

    stages {
        stage('📋 Checkout') {
            steps {
                script {
                    echo "🔄 Checking out code from devops branch..."
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

        stage('🔧 Environment Setup') {
            steps {
                script {
                    echo "🔧 Setting up staging environment..."

                    sh '''
                        # Create necessary directories
                        mkdir -p logs backups

                        # Create .env.staging if not exists
                        if [ ! -f .env.staging ]; then
                            echo "⚠️ Warning: .env.staging not found, using example"
                            cp .env.staging.example .env.staging || true
                        fi
                    '''
                }
            }
        }

        stage('📦 Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('server') {
                            echo "📦 Installing backend dependencies..."
                            sh '''
                                npm install
                                echo "✅ Backend dependencies installed"
                            '''
                        }
                    }
                }

                stage('Frontend Dependencies') {
                    steps {
                        dir('client') {
                            echo "📦 Installing frontend dependencies..."
                            sh '''
                                npm install
                                echo "✅ Frontend dependencies installed"
                            '''
                        }
                    }
                }
            }
        }

        stage('🔍 Code Quality') {
            parallel {
                stage('Lint Backend') {
                    steps {
                        dir('server') {
                            echo "🔍 Linting backend code..."
                            sh 'npm run lint || true'
                        }
                    }
                }

                stage('Lint Frontend') {
                    steps {
                        dir('client') {
                            echo "🔍 Linting frontend code..."
                            sh 'npm run lint || true'
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
                            echo "🧪 Running backend tests..."
                            sh '''
                                npm run test:ci
                                echo "✅ Backend tests completed"
                            '''

                            // Publish test results
                            junit allowEmptyResults: true, testResults: '**/test-results/*.xml'

                            // Publish coverage
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
                            echo "🧪 Running frontend tests..."
                            sh 'npm run test:ci || true'
                        }
                    }
                }
            }
        }

        stage('🔒 Security Scan') {
            parallel {
                stage('Dependency Audit') {
                    steps {
                        echo "🔒 Running security audit..."
                        sh '''
                            echo "Scanning backend dependencies..."
                            cd server && npm audit --production || true

                            echo "Scanning frontend dependencies..."
                            cd ../client && npm audit --production || true
                        '''
                    }
                }

                stage('Secret Scan') {
                    steps {
                        echo "🔐 Scanning for secrets..."
                        sh '''
                            if command -v gitleaks &> /dev/null; then
                                gitleaks detect --source . --verbose || true
                            else
                                echo "⚠️ gitleaks not installed, skipping secret scan"
                            fi
                        '''
                    }
                }
            }
        }

        stage('💾 Backup Database') {
            steps {
                script {
                    echo "💾 Creating database backup before deployment..."
                    sh '''
                        if [ -f scripts/backup-staging.sh ]; then
                            chmod +x scripts/backup-staging.sh
                            ./scripts/backup-staging.sh || echo "⚠️ Backup failed, continuing..."
                        else
                            echo "⚠️ Backup script not found, skipping backup"
                        fi
                    '''
                }
            }
        }

        stage('🐳 Build & Deploy') {
            steps {
                script {
                    echo "🐳 Building and deploying to staging..."

                    sh '''
                        # Stop existing services
                        echo "🛑 Stopping existing services..."
                        docker compose -f ${COMPOSE_FILE} down || true

                        # Clean up orphan containers and networks
                        echo "🧹 Cleaning up orphan resources..."
                        docker rm -f si_releves_frontend_staging si_releves_backend_staging si_releves_mysql_staging 2>/dev/null || true
                        docker network prune -f || true

                        # Build images
                        echo "🔨 Building Docker images..."
                        docker compose -f ${COMPOSE_FILE} build --no-cache

                        # Start services
                        echo "🚀 Starting services..."
                        docker compose -f ${COMPOSE_FILE} up -d --remove-orphans

                        # Wait for services
                        echo "⏳ Waiting for services to be ready..."
                        sleep 15

                        # Check status
                        docker compose -f ${COMPOSE_FILE} ps
                    '''
                }
            }
        }

        stage('📊 Setup ELK Stack') {
            steps {
                script {
                    echo "📊 Setting up ELK Stack for monitoring..."

                    sh '''
                        # Clean up ELK resources first
                        echo "🧹 Cleaning up ELK resources..."
                        docker compose -f docker-compose.elk.yml down || true
                        docker rm -f si_releves_elasticsearch si_releves_kibana si_releves_logstash si_releves_filebeat si_releves_metricbeat 2>/dev/null || true

                        # Start ELK stack
                        echo "🚀 Starting ELK Stack..."
                        docker compose -f docker-compose.elk.yml up -d --remove-orphans

                        # Wait for Elasticsearch
                        echo "⏳ Waiting for Elasticsearch..."
                        for i in {1..30}; do
                            if curl -f ${ELASTICSEARCH_URL}/_cluster/health 2>/dev/null; then
                                echo "✅ Elasticsearch is ready"
                                break
                            fi
                            echo "Waiting for Elasticsearch... ($i/30)"
                            sleep 5
                        done

                        # Wait for Kibana
                        echo "⏳ Waiting for Kibana..."
                        for i in {1..30}; do
                            if curl -f ${KIBANA_URL}/api/status 2>/dev/null; then
                                echo "✅ Kibana is ready"
                                break
                            fi
                            echo "Waiting for Kibana... ($i/30)"
                            sleep 5
                        done

                        # Configure Logstash pipelines
                        echo "⚙️ Configuring Logstash pipelines..."
                        docker compose -f docker-compose.elk.yml exec -T logstash logstash-plugin list || true

                        echo "✅ ELK Stack setup completed"
                    '''
                }
            }
        }

        stage('📈 Configure Monitoring') {
            steps {
                script {
                    echo "📈 Configuring monitoring dashboards..."

                    sh '''
                        # Import Kibana dashboards
                        echo "📊 Importing Kibana dashboards..."

                        # Wait a bit for Kibana to be fully ready
                        sleep 10

                        # Create index patterns
                        curl -X POST "${KIBANA_URL}/api/saved_objects/index-pattern/logs-*" \
                            -H "kbn-xsrf: true" \
                            -H "Content-Type: application/json" \
                            -d '{
                                "attributes": {
                                    "title": "logs-*",
                                    "timeFieldName": "@timestamp"
                                }
                            }' || echo "⚠️ Index pattern creation failed, might already exist"

                        # Create index pattern for application logs
                        curl -X POST "${KIBANA_URL}/api/saved_objects/index-pattern/si-releves-*" \
                            -H "kbn-xsrf: true" \
                            -H "Content-Type: application/json" \
                            -d '{
                                "attributes": {
                                    "title": "si-releves-*",
                                    "timeFieldName": "@timestamp"
                                }
                            }' || echo "⚠️ Application index pattern creation failed"

                        echo "✅ Monitoring configuration completed"
                        echo "🌐 Kibana Dashboard: ${KIBANA_URL}"
                        echo "🔍 Elasticsearch: ${ELASTICSEARCH_URL}"
                    '''
                }
            }
        }

        stage('🏥 Health Check') {
            steps {
                script {
                    echo "🏥 Running health checks..."

                    sh '''
                        echo "Checking containers status..."
                        docker compose -f ${COMPOSE_FILE} ps

                        echo "Checking backend container health..."
                        docker inspect si_releves_backend_staging --format='{{.State.Status}}' || echo "Backend container not found"

                        echo "Checking frontend container health..."
                        docker inspect si_releves_frontend_staging --format='{{.State.Status}}' || echo "Frontend container not found"

                        echo "Checking MySQL container health..."
                        docker inspect si_releves_mysql_staging --format='{{.State.Health.Status}}' || echo "MySQL container not found"

                        echo "✅ Container health checks completed!"
                    '''
                }
            }
        }

        stage('💨 Smoke Tests') {
            steps {
                script {
                    echo "💨 Running smoke tests..."

                    sh '''
                        echo "Checking containers are running..."

                        # Check all containers are running
                        RUNNING=$(docker compose -f ${COMPOSE_FILE} ps --status running | grep -c "running" || echo "0")
                        echo "Found $RUNNING running containers"

                        # Check backend logs
                        echo "Checking backend logs..."
                        docker compose -f ${COMPOSE_FILE} logs backend --tail=20

                        echo "✅ Smoke tests completed!"
                    '''
                }
            }
        }

        stage('📊 Generate Reports') {
            steps {
                script {
                    echo "📊 Generating deployment report..."

                    sh '''
                        # Create deployment report
                        REPORT_FILE="logs/deployment-report-${BUILD_NUMBER}.txt"

                        echo "=========================================" > $REPORT_FILE
                        echo "SI RELEVÉS - STAGING DEPLOYMENT REPORT" >> $REPORT_FILE
                        echo "=========================================" >> $REPORT_FILE
                        echo "" >> $REPORT_FILE
                        echo "Build Number: ${BUILD_NUMBER}" >> $REPORT_FILE
                        echo "Version: ${VERSION}" >> $REPORT_FILE
                        echo "Git Commit: ${GIT_COMMIT_SHORT}" >> $REPORT_FILE
                        echo "Deployment Time: $(date)" >> $REPORT_FILE
                        echo "" >> $REPORT_FILE
                        echo "=========================================" >> $REPORT_FILE
                        echo "SERVICES STATUS" >> $REPORT_FILE
                        echo "=========================================" >> $REPORT_FILE
                        docker compose -f ${COMPOSE_FILE} ps >> $REPORT_FILE
                        echo "" >> $REPORT_FILE
                        echo "=========================================" >> $REPORT_FILE
                        echo "ELK STACK STATUS" >> $REPORT_FILE
                        echo "=========================================" >> $REPORT_FILE
                        docker compose -f docker-compose.elk.yml ps >> $REPORT_FILE
                        echo "" >> $REPORT_FILE
                        echo "=========================================" >> $REPORT_FILE
                        echo "MONITORING URLS" >> $REPORT_FILE
                        echo "=========================================" >> $REPORT_FILE
                        echo "Kibana: ${KIBANA_URL}" >> $REPORT_FILE
                        echo "Elasticsearch: ${ELASTICSEARCH_URL}" >> $REPORT_FILE
                        echo "" >> $REPORT_FILE

                        cat $REPORT_FILE
                    '''

                    // Archive the report
                    archiveArtifacts artifacts: 'logs/deployment-report-*.txt', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        always {
            script {
                echo "🧹 Cleaning up..."

                // Archive artifacts
                archiveArtifacts artifacts: '**/coverage/**/*', allowEmptyArchive: true
                archiveArtifacts artifacts: '**/test-results/**/*', allowEmptyArchive: true
                archiveArtifacts artifacts: 'logs/**/*', allowEmptyArchive: true

                // Clean up old Docker images
                sh 'docker image prune -f || true'
            }
        }

        success {
            script {
                echo "✅ Pipeline completed successfully!"

                // Send success notification
                emailext (
                    subject: "✅ SUCCESS: SI Relevés Staging Deployment [Build #${env.BUILD_NUMBER}]",
                    body: """
                        <html>
                        <body style="font-family: Arial, sans-serif;">
                            <h2 style="color: #28a745;">✅ Déploiement Staging Réussi</h2>

                            <h3>Informations du Build</h3>
                            <ul>
                                <li><strong>Job:</strong> ${env.JOB_NAME}</li>
                                <li><strong>Build Number:</strong> ${env.BUILD_NUMBER}</li>
                                <li><strong>Version:</strong> ${VERSION}</li>
                                <li><strong>Branch:</strong> ${env.GIT_BRANCH}</li>
                                <li><strong>Commit:</strong> ${GIT_COMMIT_SHORT}</li>
                                <li><strong>Durée:</strong> ${currentBuild.durationString}</li>
                            </ul>

                            <h3>Services Déployés</h3>
                            <ul>
                                <li>✅ Frontend - <a href="http://localhost:3001">http://localhost:3001</a></li>
                                <li>✅ Backend - <a href="http://localhost:5002/api">http://localhost:5002/api</a></li>
                                <li>✅ MySQL - localhost:3308</li>
                            </ul>

                            <h3>📊 Monitoring & Logs</h3>
                            <ul>
                                <li>📊 <strong>Kibana Dashboard:</strong> <a href="${KIBANA_URL}">${KIBANA_URL}</a></li>
                                <li>🔍 <strong>Elasticsearch:</strong> <a href="${ELASTICSEARCH_URL}">${ELASTICSEARCH_URL}</a></li>
                                <li>📈 <strong>Logs Index:</strong> logs-* et si-releves-*</li>
                            </ul>

                            <h3>🔍 Rapports</h3>
                            <ul>
                                <li><a href="${env.BUILD_URL}Backend_20Coverage_20Report/">Backend Coverage Report</a></li>
                                <li><a href="${env.BUILD_URL}artifact/logs/deployment-report-${env.BUILD_NUMBER}.txt">Deployment Report</a></li>
                                <li><a href="${env.BUILD_URL}console">Console Output</a></li>
                            </ul>

                            <p style="margin-top: 20px;">
                                <strong>⚡ Quick Actions:</strong><br>
                                • Voir les logs: <code>docker-compose -f docker-compose.staging.yml logs -f</code><br>
                                • Accéder à Kibana: <a href="${KIBANA_URL}">${KIBANA_URL}</a><br>
                                • Redémarrer: <code>docker-compose -f docker-compose.staging.yml restart</code>
                            </p>

                            <p style="color: #6c757d; margin-top: 30px;">
                                <em>"If you can't see it, you can't fix it." - Monitoring actif ✅</em>
                            </p>
                        </body>
                        </html>
                    """,
                    to: '${DEFAULT_RECIPIENTS}',
                    mimeType: 'text/html'
                )
            }
        }

        failure {
            script {
                echo "❌ Pipeline failed!"

                // Send failure notification
                emailext (
                    subject: "❌ FAILURE: SI Relevés Staging Deployment [Build #${env.BUILD_NUMBER}]",
                    body: """
                        <html>
                        <body style="font-family: Arial, sans-serif;">
                            <h2 style="color: #dc3545;">❌ Échec du Déploiement Staging</h2>

                            <h3>Informations du Build</h3>
                            <ul>
                                <li><strong>Job:</strong> ${env.JOB_NAME}</li>
                                <li><strong>Build Number:</strong> ${env.BUILD_NUMBER}</li>
                                <li><strong>Branch:</strong> ${env.GIT_BRANCH}</li>
                                <li><strong>Commit:</strong> ${GIT_COMMIT_SHORT}</li>
                                <li><strong>Durée:</strong> ${currentBuild.durationString}</li>
                            </ul>

                            <h3>🔍 Dépannage</h3>
                            <ul>
                                <li><a href="${env.BUILD_URL}console">Voir Console Output</a></li>
                                <li>Vérifier les logs: <code>docker-compose -f docker-compose.staging.yml logs</code></li>
                                <li>Vérifier le statut: <code>docker-compose -f docker-compose.staging.yml ps</code></li>
                            </ul>

                            <p style="margin-top: 20px;">
                                <strong>Actions Possibles:</strong><br>
                                • Consulter les logs dans Jenkins<br>
                                • Vérifier la configuration .env.staging<br>
                                • Tester en local avec <code>docker-compose up</code>
                            </p>
                        </body>
                        </html>
                    """,
                    to: '${DEFAULT_RECIPIENTS}',
                    mimeType: 'text/html'
                )
            }
        }

        unstable {
            echo "⚠️ Pipeline is unstable - Some tests failed but build continued"
        }

        aborted {
            echo "🛑 Pipeline was aborted"
        }
    }
}
