def ENV_NAME = getEnvName(env.BRANCH_NAME)
def CONTAINER_NAME = "angular-app-" + ENV_NAME
def CONTAINER_TAG = getTag(env.BUILD_NUMBER, env.BRANCH_NAME)
def HTTP_PORT = getHTTPPort(env.BRANCH_NAME)
def EMAIL_RECIPIENTS = "votre-email@example.com"

// Configuration GitOps pour ArgoCD
def GITOPS_REPO = "https://github.com/votre-org/angular-app-gitops.git"
def GITOPS_BRANCH = "main"
def GITOPS_CREDENTIALS = "gitops-repo-credentials"

node {
    try {
        stage('Initialize') {
            def dockerHome = tool 'dockerlatest'
            def nodeHome = tool 'nodelatest'
            env.PATH = "${dockerHome}/bin:${nodeHome}/bin:${env.PATH}"
        }

        stage('Checkout') {
            checkout scm
        }

        // ÉTAPE 1: BUILD ANGULAR
        stage('Angular Build') {
            sh 'npm ci'  // Installation des dépendances
            
            // Build selon l'environnement
            if (ENV_NAME == 'prod') {
                sh 'npm run build:prod'
            } else if (ENV_NAME == 'uat') {
                sh 'npm run build:uat'
            } else {
                sh 'npm run build:dev'
            }
            
            // Vérifier que le build a créé les fichiers
            sh 'ls -la dist/'
            
            // Tests unitaires optionnels
            // sh 'npm run test:ci'
        }

        // ÉTAPE 2: CONTAINERISATION
        stage('Image Build') {
            imageBuild(CONTAINER_NAME, CONTAINER_TAG)
        }

        stage('Push to Docker Registry') {
            withCredentials([usernamePassword(credentialsId: 'dockerhubcredential', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                pushToImage(CONTAINER_NAME, CONTAINER_TAG, USERNAME, PASSWORD)
            }
        }

        // ÉTAPE 3: MISE À JOUR GITOPS POUR ARGOCD
        stage('Update GitOps Repository') {
            withCredentials([usernamePassword(credentialsId: GITOPS_CREDENTIALS, usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
                updateGitOpsManifests(CONTAINER_NAME, CONTAINER_TAG, ENV_NAME, GIT_USERNAME, GIT_PASSWORD)
            }
        }

        // ÉTAPE 4: SYNCHRONISATION ARGOCD (OPTIONNEL)
        stage('Trigger ArgoCD Sync') {
            // Option 1: Attendre la synchronisation automatique d'ArgoCD
            echo "ArgoCD détectera automatiquement les changements dans le repository GitOps"
            echo "Application sera déployée automatiquement dans l'environnement: ${ENV_NAME}"
            
            // Option 2: Déclencher manuellement la synchronisation (si CLI ArgoCD disponible)
            triggerArgoCDSync(ENV_NAME)
        }

        // ÉTAPE 5: VÉRIFICATION DU DÉPLOIEMENT
        stage('Verify Deployment') {
            // Attendre quelques secondes pour la synchronisation
            sleep(30)
            
            // Vérifier le statut de l'application ArgoCD
            verifyArgoCDDeployment(ENV_NAME)
        }

    } catch (Exception e) {
        currentBuild.result = 'FAILURE'
        throw e
    } finally {
        deleteDir()
        sendEmail(EMAIL_RECIPIENTS)
    }
}

// FONCTIONS UTILITAIRES EXISTANTES
def imageBuild(containerName, tag) {
    sh "docker build -t $containerName:$tag -t $containerName --pull --no-cache ."
    echo "Image build complete"
}

def pushToImage(containerName, tag, dockerUser, dockerPassword) {
    sh "docker login -u $dockerUser -p $dockerPassword"
    sh "docker tag $containerName:$tag $dockerUser/$containerName:$tag"
    sh "docker push $dockerUser/$containerName:$tag"
    echo "Image push complete"
}

// NOUVELLES FONCTIONS POUR GITOPS
def updateGitOpsManifests(containerName, tag, envName, gitUser, gitPassword) {
    // Cloner le repository GitOps
    sh "git clone https://$gitUser:$gitPassword@github.com/votre-org/angular-app-gitops.git gitops-repo"
    
    dir('gitops-repo') {
        // Configurer Git
        sh "git config user.name 'Jenkins CI'"
        sh "git config user.email 'jenkins@votre-domaine.com'"
        
        // Mettre à jour le manifeste Kubernetes selon l'environnement
        def manifestPath = "environments/${envName}/deployment.yaml"
        
        // Utiliser sed pour mettre à jour l'image dans le manifeste
        sh "sed -i 's|image: .*/.*:.*|image: ${dockerUser}/${containerName}:${tag}|g' ${manifestPath}"
        
        // Vérifier les changements
        sh "git diff"
        
        // Commit et push
        sh "git add ."
        sh "git commit -m 'Update ${envName} image to ${tag} - Build #${env.BUILD_NUMBER}'"
        sh "git push origin ${GITOPS_BRANCH}"
        
        echo "GitOps repository updated successfully"
    }
}

def triggerArgoCDSync(envName) {
    // Cette fonction nécessite que ArgoCD CLI soit installé sur Jenkins
    def appName = "angular-app-${envName}"
    def argoCDServer = "argocd.votre-domaine.com"
    
    withCredentials([usernamePassword(credentialsId: 'argocd-credentials', usernameVariable: 'ARGOCD_USERNAME', passwordVariable: 'ARGOCD_PASSWORD')]) {
        try {
            // Login ArgoCD
            sh "argocd login ${argoCDServer} --username ${ARGOCD_USERNAME} --password ${ARGOCD_PASSWORD} --insecure"
            
            // Synchroniser l'application
            sh "argocd app sync ${appName}"
            
            echo "ArgoCD synchronization triggered for ${appName}"
        } catch (Exception e) {
            echo "Warning: Could not trigger ArgoCD sync automatically: ${e.message}"
            echo "ArgoCD will detect changes automatically within its polling interval"
        }
    }
}

def verifyArgoCDDeployment(envName) {
    def appName = "angular-app-${envName}"
    
    withCredentials([usernamePassword(credentialsId: 'argocd-credentials', usernameVariable: 'ARGOCD_USERNAME', passwordVariable: 'ARGOCD_PASSWORD')]) {
        try {
            // Vérifier le statut de l'application
            def appStatus = sh(script: "argocd app get ${appName} -o json | jq -r '.status.health.status'", returnStdout: true).trim()
            
            if (appStatus == "Healthy") {
                echo "✅ Déploiement vérifié: Application ${appName} est en bonne santé"
            } else {
                echo "⚠️  Attention: Application ${appName} status: ${appStatus}"
            }
            
            // Obtenir l'URL de l'application
            def appUrl = getApplicationUrl(envName)
            echo "🌐 Application accessible à: ${appUrl}"
            
        } catch (Exception e) {
            echo "Warning: Could not verify deployment status: ${e.message}"
        }
    }
}

def getApplicationUrl(envName) {
    if (envName == 'prod') {
        return "https://angular-app.votre-domaine.com"
    } else if (envName == 'uat') {
        return "https://angular-app-uat.votre-domaine.com"
    } else {
        return "https://angular-app-dev.votre-domaine.com"
    }
}

def sendEmail(recipients) {
    def appUrl = getApplicationUrl(ENV_NAME)
    mail(
        to: recipients,
        subject: "Angular Build ${env.BUILD_NUMBER} - ${currentBuild.currentResult} - (${currentBuild.fullDisplayName})",
        body: "Check console output at: ${env.BUILD_URL}/console\n" +
              "Environment: ${ENV_NAME}\n" +
              "Docker Image: ${CONTAINER_NAME}:${CONTAINER_TAG}\n" +
              "Application URL: ${appUrl}\n" +
              "ArgoCD App: angular-app-${ENV_NAME}\n"
    )
}

// FONCTIONS UTILITAIRES EXISTANTES
String getEnvName(String branchName) {
    if (branchName == 'main') {
        return 'prod'
    }
    return (branchName == 'develop') ? 'uat' : 'dev'
}

String getHTTPPort(String branchName) {
    if (branchName == 'main') {
        return '8083'  // Port pour prod
    }
    return (branchName == 'develop') ? '8082' : '8081'  // UAT et DEV
}

String getTag(String buildNumber, String branchName) {
    if (branchName == 'main') {
        return buildNumber + '-prod'
    }
    return (branchName == 'develop') ? buildNumber + '-uat' : buildNumber + '-dev'
}
