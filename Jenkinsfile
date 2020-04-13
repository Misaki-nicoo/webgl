pipeline {
    agent {
        docker {
            image 'node:10-alpine'
            args '-p 3000:3000'
        }
    }
    stages {
        stage('TEST') {
            steps {
                sh 'node --version'
            }
        }
    }
}
