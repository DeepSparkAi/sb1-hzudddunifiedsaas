export interface IntegrationConfig {
  mode: 'test' | 'live';
  features: string[];
  returnUrl: string;
}

export interface IntegrationCodeParams extends IntegrationConfig {
  appId: string;
  appName: string;
}