import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { jwtOptionsFactory } from './jwt-options';

describe('JWT signing key', () => {
  it('refuses to start without SECRET_TOKEN', () => {
    const config = new ConfigService({});

    expect(() => jwtOptionsFactory(config)).toThrow(/SECRET_TOKEN/);
  });

  it('signs with the configured key, so a token made with another key is rejected', async () => {
    const options = jwtOptionsFactory(new ConfigService({ SECRET_TOKEN: 'configured-key' }));
    const jwt = new JwtService(options);
    const forged = new JwtService({ secret: 'undefined' });

    const token = await jwt.signAsync({ _id: 'member' });
    await expect(jwt.verifyAsync(token)).resolves.toMatchObject({ _id: 'member' });
    await expect(jwt.verifyAsync(await forged.signAsync({ _id: 'member', memberRole: 'ADMIN' }))).rejects.toThrow();
  });
});
