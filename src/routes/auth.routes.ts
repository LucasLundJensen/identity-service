import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import oidc from '../oidc.js';


const AuthRoutes: FastifyPluginAsync = async (server: FastifyInstance, options: FastifyPluginOptions) => {
    server.get('/oidc/interaction/:uid', async (req, res) => {
        try {
          const {
            uid, prompt, params, session,
          } = await oidc.interactionDetails(req.raw, res.raw);
    
          const client = await oidc.Client.find(params.client_id as string);
    
          switch (prompt.name) {
            case 'login': {
              return res.view('src/templates/login.ejs', {
                client,
                uid,
                details: prompt.details,
                params,
                title: 'Sign-in',
                session: session || undefined,
                dbg: {},
              });
            }
            case 'consent': {
              return res.view('../templates/authorize.ejs', {
                client,
                uid,
                details: prompt.details,
                params,
                title: 'Authorize',
                session: session || undefined,
                dbg: {},
              });
            }
            default:
              return undefined;
          }
        } catch (err) {
          return err;
        }
      });
}

export default AuthRoutes;




//   app.post('/interaction/:uid/login', setNoCache, body, async (req, res, next) => {
//     try {
//       const { prompt: { name } } = await provider.interactionDetails(req, res);
//       assert.equal(name, 'login');
//       const account = await Account.findByLogin(req.body.login);

//       const result = {
//         login: {
//           accountId: account.accountId,
//         },
//       };

//       await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
//     } catch (err) {
//       next(err);
//     }
//   });

//   app.post('/interaction/:uid/confirm', setNoCache, body, async (req, res, next) => {
//     try {
//       const interactionDetails = await provider.interactionDetails(req, res);
//       const { prompt: { name, details }, params, session: { accountId } } = interactionDetails;
//       assert.equal(name, 'consent');

//       let { grantId } = interactionDetails;
//       let grant;

//       if (grantId) {
//         // we'll be modifying existing grant in existing session
//         grant = await provider.Grant.find(grantId);
//       } else {
//         // we're establishing a new grant
//         grant = new provider.Grant({
//           accountId,
//           clientId: params.client_id,
//         });
//       }

//       if (details.missingOIDCScope) {
//         grant.addOIDCScope(details.missingOIDCScope.join(' '));
//       }
//       if (details.missingOIDCClaims) {
//         grant.addOIDCClaims(details.missingOIDCClaims);
//       }
//       if (details.missingResourceScopes) {
//         for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
//           grant.addResourceScope(indicator, scopes.join(' '));
//         }
//       }

//       grantId = await grant.save();

//       const consent = {};
//       if (!interactionDetails.grantId) {
//         // we don't have to pass grantId to consent, we're just modifying existing one
//         consent.grantId = grantId;
//       }

//       const result = { consent };
//       await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
//     } catch (err) {
//       next(err);
//     }
//   });

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