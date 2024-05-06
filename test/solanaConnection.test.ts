import { Connection, clusterApiUrl } from '@solana/web3.js';

describe('Solana Connection', () => {
  it('should connect to the devnet cluster', async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const version = await connection.getVersion();
    expect(version).toBeDefined();
  });
});
