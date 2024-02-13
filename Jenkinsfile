pipeline {
    environment {
        MONGO_USER = 'root'
        MONGO_PASSWORD = 'password'
        MONGO_URI = 'mongodb://root:password@localhost:27017/tests'
        JWT_SECRET = 'jwt_secret'
    }

    agent { 
        dockerfile {
            args "-e JWT_SECRET=${JWT_SECRET} -e MONGO_URI=${MONGO_URI} -p 5000:5000"
        }
    }

    stages {
        stage('Prepare MongoDB') {
            steps {
                script {
                    sh "docker run -e MONGO_INITDB_ROOT_USERNAME=${MONGO_USER} -e MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD} -e MONGO_INITDB_DATABASE=tests -p 27017:27017 mongo:latest"
                }
            }
        }

        stage('Test') {
            steps {
                sh 'bun run test'
            }
        }
    }
}
