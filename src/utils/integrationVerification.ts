import { supabase } from '../lib/supabase';

export async function verifyIntegration(appId: string, externalUrl: string): Promise<boolean> {
  try {
    // Validate URL
    const url = new URL(externalUrl);
    
    // Attempt to fetch the page
    const response = await fetch(url.toString(), {
      method: 'HEAD',
      mode: 'no-cors'
    });

    // Update the app's integration status
    const { error } = await supabase
      .from('apps')
      .update({
        metadata: {
          external_url: externalUrl,
          integration_status: 'verified',
          last_verified: new Date().toISOString()
        }
      })
      .eq('id', appId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Integration verification failed:', error);
    return false;
  }
}

export function getIntegrationStatus(status: string): {
  label: string;
  color: string;
} {
  switch (status) {
    case 'verified':
      return {
        label: 'Verified',
        color: 'green'
      };
    case 'pending_verification':
      return {
        label: 'Pending Verification',
        color: 'yellow'
      };
    case 'failed':
      return {
        label: 'Verification Failed',
        color: 'red'
      };
    default:
      return {
        label: 'Not Connected',
        color: 'gray'
      };
  }
}