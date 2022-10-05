import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';
import { verify, decode } from 'jsonwebtoken';
import Axios from 'axios';
import { createLogger } from '../../utils/logger';
import { JwtPayload } from '../../auth/JwtPayload';
import { Jwt } from '../../auth/Jwt';

const logger = createLogger('auth');
const jwksUrl = process.env.JWT_WEB_KEY_URL;

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  //logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info(`User was authorized ${jwtToken}`);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message });
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  if (!authHeader)
    throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];
  const jwt: Jwt = decode(token, {complete: true}) as Jwt;

  let cert: string;
  try {
    const res = await Axios.get(jwksUrl);
    const keys = res.data.keys;
    const signedKey = keys.find(key => key['kid'] === jwt['header']['kid']);
    const data = signedKey['x5c'][0];
    cert = `-----BEGIN CERTIFICATE-----\n${data}\n-----END CERTIFICATE-----`;
  } catch (e) {
    logger.info('Invalid signedKey: ', e);
  }

  return verify(token, cert, { algorithms: ['RS256']}) as JwtPayload;
}