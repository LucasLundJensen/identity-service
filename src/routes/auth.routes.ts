
import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import argon from 'argon2';
import oidc from '../oidc.js';
import { getUserByEmail } from '../services/user.service.js';


const AuthRoutes: FastifyPluginAsync = async (server: FastifyInstance, options: FastifyPluginOptions) => {
    server.get('/oidc/interaction/:uid', async (req, res) => {
      
        try {
          const {
            uid, prompt, params, session,
          } = await oidc.interactionDetails(req.raw, res.raw);
    
          const client = await oidc.Client.find(params.client_id as string);
          server.log.debug(`Interaction endpoint called with prompt ${prompt.name}`)
    
          switch (prompt.name) {
            case 'login': {
              return res.view('src/templates/login.ejs', {
                client,
                uid,
                details: prompt.details,
                params,
                title: 'Sign-in',
                session: session || undefined,
                dbg: {
                  params: params,
                  prompt: prompt
                },
              });
            }
            case 'consent': {
              return res.view('src/templates/authorize.ejs', {
                client,
                uid,
                details: prompt.details,
                params,
                title: 'Authorize',
                session: session || undefined,
                dbg: {
                  params: params,
                  prompt: prompt
                },
              });
            }
            default:
              return undefined;
          }
        } catch (err) {
          return err;
        }
      });




    server.post<{
      Body: {
        email: string,
        password: string
      }
    }>('/oidc/interaction/:uid/login', async (req, res) => {
      try {
        const { prompt: { name }, grantId } = await oidc.interactionDetails(req.raw, res.raw);
        
        if(name !== "login") return;

        const user = await getUserByEmail(req.body.email);
        if(user.status != "Found" || user.data === null) return;

        const verified = await argon.verify(user.data.password, req.body.password);
        if(!verified) return;

        const result = {
          login: {
            accountId: user.data.id.toString(),
          },
        };
        return await oidc.interactionFinished(req.raw, res.raw, result, { mergeWithLastSubmission: false });
      } catch (err) {
        return err;
      }
    });

    server.post('/oidc/interaction/:uid/confirm', async (req, res) => {
      try {
        const interactionDetails = await oidc.interactionDetails(req.raw, res.raw);
        const { prompt: { name } } = interactionDetails;
        const accountId = interactionDetails.session?.accountId;
        const params = interactionDetails.params as any;
        const details = interactionDetails.prompt.details as any;


        if(name !== "consent") return;
  
        let { grantId } = interactionDetails;
        let grant = new oidc.Grant({
          accountId,
          clientId: params.client_id,
        });
  
        if (grantId) {
          // we'll be modifying existing grant in existing session
          const existingGrant = await oidc.Grant.find(grantId);
          if(existingGrant) {
            grant = existingGrant;
          }
        }
  
        if (details.missingOIDCScope) {
          grant.addOIDCScope(details.missingOIDCScope.join(' '));
        }
        if (details.missingOIDCClaims) {
          grant.addOIDCClaims(details.missingOIDCClaims);
        }
        if (details.missingResourceScopes) {
          for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
            grant.addResourceScope(indicator, (scopes as any[]).join(' '));
          }
        }
  
        grantId = await grant.save();
  
        const consent: {grantId?: string} = {};
        if (!interactionDetails.grantId) {
          // we don't have to pass grantId to consent, we're just modifying existing one
          consent.grantId = grantId;
        }
  
        const result = { consent };
        await oidc.interactionFinished(req.raw, res.raw, result, { mergeWithLastSubmission: true });
      } catch (err) {
        return err;
      }
    });

}




export default AuthRoutes;





//   app.get('/interaction/:uid/abort', setNoCache, async (req, res, next) => {
//     try {
//       const result = {
//         error: 'access_denied',
//         error_description: 'End-User aborted interaction',
//       };
//       await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
//     } catch (err) {
//       next(err);
//     }
//   });