import {Token} from './token';

describe('Token', () => {
  it('should serialize and deserialize correctly', () => {
    const accessToken = 'access';
    const refreshToken = 'refresh';
    const tokenType = 'tokenType';
    const expireTime: Date = new Date();
    const token = new Token(accessToken, refreshToken, tokenType, expireTime);

    const serialization = token.serialize();

    const deserializedToken = Token.fromSerialization(serialization);

    expect(deserializedToken).toEqual(token);
  });
});
