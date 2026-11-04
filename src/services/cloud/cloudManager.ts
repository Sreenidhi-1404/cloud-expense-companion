import { 
  CloudPlatformDescriptor, 
  CloudProviderId, 
  IAuthService, 
  IDatabaseService, 
  IStorageService, 
  ICloudMonitorService,
  CloudHealthProbe 
} from './types';
import { 
  FirebaseAuthService, 
  FirebaseDatabaseService, 
  FirebaseStorageService, 
  FirebaseMonitorService 
} from './firebaseAdapter';
import { 
  AWSCognitoAuthService, 
  AWSDynamoDBService, 
  AWSS3StorageService, 
  AWSMonitorService 
} from './awsAdapter';
import { 
  AzureEntraAuthService, 
  AzureCosmosDBService, 
  AzureBlobStorageService, 
  AzureMonitorService 
} from './azureAdapter';

export const CLOUD_PLATFORMS: Record<CloudProviderId, CloudPlatformDescriptor> = {
  firebase: {
    id: 'firebase',
    name: 'Google Cloud Platform (Firebase)',
    company: 'Google LLC',
    status: 'active',
    description: 'Active production backend powering multi-tenant identity, real-time Firestore database synchronization, and cloud storage.',
    services: {
      auth: { name: 'Firebase Authentication (Google Identity Platform)', mechanism: 'OAuth 2.0, OIDC, Argon2/Scrypt Passwords', status: 'Active & Enforcing Rules' },
      database: { name: 'Cloud Firestore', type: 'NoSQL Document Store (/users/{userId}/* isolation)', status: 'Active' },
      storage: { name: 'Cloud Storage for Firebase', type: 'Google Cloud Storage Bucket (Receipts & Docs)', status: 'Active' },
      hosting: { name: 'Firebase Hosting / Express App Engine', type: 'Global Edge CDN + Node SSR', status: 'Connected' }
    },
    securityCompliance: ['SOC 1, 2, 3', 'ISO/IEC 27001', 'HIPAA compliant', 'GDPR compliant', 'Client-side rules enforcement']
  },
  aws: {
    id: 'aws',
    name: 'Amazon Web Services (AWS)',
    company: 'Amazon.com, Inc.',
    status: 'architectural_adapter',
    description: 'Enterprise multi-cloud expansion adapter allowing seamless migration or hybrid sync with AWS native services.',
    services: {
      auth: { name: 'Amazon Cognito User Pools', mechanism: 'SRP (Secure Remote Password), Hosted UI OAuth 2.0', status: 'Adapter Ready' },
      database: { name: 'Amazon DynamoDB', type: 'Single-table partition key design (PK: USER#id, SK: EXP#id)', status: 'Adapter Ready' },
      storage: { name: 'Amazon S3', type: 'S3 Standard Bucket with KMS client-side envelope encryption', status: 'Adapter Ready' },
      hosting: { name: 'AWS Amplify / CloudFront + S3', type: 'CloudFront Edge Distribution', status: 'Adapter Ready' }
    },
    securityCompliance: ['FedRAMP High', 'PCI-DSS Level 1', 'FIPS 140-2', 'SOC 1, 2, 3']
  },
  azure: {
    id: 'azure',
    name: 'Microsoft Azure',
    company: 'Microsoft Corporation',
    status: 'architectural_adapter',
    description: 'Enterprise Microsoft cloud adapter for Entra ID (Azure AD), Cosmos DB multi-master replication, and Azure Blob Vault.',
    services: {
      auth: { name: 'Microsoft Entra ID (Azure Active Directory B2C)', mechanism: 'MSAL (Microsoft Authentication Library), OAuth2 / OIDC', status: 'Adapter Ready' },
      database: { name: 'Azure Cosmos DB', type: 'Multi-model SQL API with /userId logical partition keys', status: 'Adapter Ready' },
      storage: { name: 'Azure Blob Storage', type: 'Hot Tier Blob Container with Shared Access Signatures (SAS)', status: 'Adapter Ready' },
      hosting: { name: 'Azure Static Web Apps', type: 'Global GitHub Actions CI/CD Edge distribution', status: 'Adapter Ready' }
    },
    securityCompliance: ['ISO 27018', 'FedRAMP', 'HITRUST CSF', 'EU Model Clauses']
  }
};

class CloudManager {
  private activeProvider: CloudProviderId = 'firebase';

  private authServices: Record<CloudProviderId, IAuthService> = {
    firebase: new FirebaseAuthService(),
    aws: new AWSCognitoAuthService(),
    azure: new AzureEntraAuthService()
  };

  private dbServices: Record<CloudProviderId, IDatabaseService> = {
    firebase: new FirebaseDatabaseService(),
    aws: new AWSDynamoDBService(),
    azure: new AzureCosmosDBService()
  };

  private storageServices: Record<CloudProviderId, IStorageService> = {
    firebase: new FirebaseStorageService(),
    aws: new AWSS3StorageService(),
    azure: new AzureBlobStorageService()
  };

  private monitorServices: Record<CloudProviderId, ICloudMonitorService> = {
    firebase: new FirebaseMonitorService(),
    aws: new AWSMonitorService(),
    azure: new AzureMonitorService()
  };

  getActiveProviderId(): CloudProviderId {
    return this.activeProvider;
  }

  getAuthService(): IAuthService {
    return this.authServices[this.activeProvider];
  }

  getDatabaseService(): IDatabaseService {
    return this.dbServices[this.activeProvider];
  }

  getStorageService(): IStorageService {
    return this.storageServices[this.activeProvider];
  }

  async runAllHealthProbes(): Promise<Record<CloudProviderId, CloudHealthProbe[]>> {
    const results: Record<CloudProviderId, CloudHealthProbe[]> = {
      firebase: await this.monitorServices.firebase.runHealthProbes(),
      aws: await this.monitorServices.aws.runHealthProbes(),
      azure: await this.monitorServices.azure.runHealthProbes()
    };
    return results;
  }
}

export const cloudManager = new CloudManager();
