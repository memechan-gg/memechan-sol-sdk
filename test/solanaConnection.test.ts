import { createSolanaConnection } from "../src";

describe('connectToService', () => {
    it('should return connection', async () => {
        const connection = createSolanaConnection();
        const version = await connection.getVersion();
        console.log('Connection details:', version);
        expect(version).toBeDefined();
    });
});